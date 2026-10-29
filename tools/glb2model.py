#!/usr/bin/env python3
"""Converte un modello .glb / .gltf / .obj nel formato del visore 3D del sito.

Uso:
  python3 tools/glb2model.py spada.glb --key spada --name "Spada" --desc "L'arma del Guerriero."

Aggiunge (o sostituisce, se la chiave esiste) il modello in media/models/models.json.
Il visore usa quel file al posto del modello provvisorio con la stessa chiave.
Chiavi attuali: spada, scudo, arco, bastone, ascia, pozzo.
"""
import argparse, base64, json, math, os, struct, sys

def srgb(c):  # lineare -> sRGB 0..255
    c = max(0.0, min(1.0, c))
    return round(255 * (12.92 * c if c <= .0031308 else 1.055 * c ** (1 / 2.4) - .055))

def matmul(a, b):  # 4x4 column-major
    return [sum(a[k * 4 + r] * b[c * 4 + k] for k in range(4)) for c in range(4) for r in range(4)]

def trs(n):
    if 'matrix' in n: return list(n['matrix'])
    t = n.get('translation', [0, 0, 0]); q = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1])
    x, y, z, w = q
    r = [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
         2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
         2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0, 0, 0, 0, 1]
    for i in range(3):
        for j in range(3): r[i * 4 + j] *= s[i]
    r[12], r[13], r[14] = t
    return r

def apply(m, v):
    return [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
            m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
            m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]]

CT = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}
NORM = {5121: 255.0, 5123: 65535.0, 5120: 127.0, 5122: 32767.0}

def load_gltf(path):
    raw = open(path, 'rb').read(); base = os.path.dirname(path)
    bins = []
    if raw[:4] == b'glTF':
        off = 12; js = None
        while off < len(raw):
            ln, ty = struct.unpack_from('<II', raw, off); body = raw[off + 8:off + 8 + ln]; off += 8 + ln
            if ty == 0x4E4F534A: js = json.loads(body)
            elif ty == 0x004E4942: bins.append(body)
        g = js; glb_bin = bins[0] if bins else b''
    else:
        g = json.loads(raw); glb_bin = b''
    bufs = []
    for b in g.get('buffers', []):
        u = b.get('uri')
        if u is None: bufs.append(glb_bin)
        elif u.startswith('data:'): bufs.append(base64.b64decode(u.split(',', 1)[1]))
        else: bufs.append(open(os.path.join(base, u), 'rb').read())

    def acc(i):
        a = g['accessors'][i]; bv = g['bufferViews'][a['bufferView']]
        fmt, sz = CT[a['componentType']]; n = NC[a['type']]; stride = bv.get('byteStride') or sz * n
        o = bv.get('byteOffset', 0) + a.get('byteOffset', 0); data = bufs[bv['buffer']]
        out = []
        for k in range(a['count']):
            v = list(struct.unpack_from('<' + fmt * n, data, o + k * stride))
            if a.get('normalized') and a['componentType'] in NORM: v = [x / NORM[a['componentType']] for x in v]
            out.append(v if n > 1 else v[0])
        return out

    try:
        from PIL import Image
        import io
    except Exception:
        Image = None
    imgs = {}
    def image(ix):
        if Image is None: return None
        if ix in imgs: return imgs[ix]
        im = g['images'][ix]
        if 'bufferView' in im:
            bv = g['bufferViews'][im['bufferView']]; d = bufs[bv['buffer']][bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
        elif im['uri'].startswith('data:'): d = base64.b64decode(im['uri'].split(',', 1)[1])
        else: d = open(os.path.join(base, im['uri']), 'rb').read()
        imgs[ix] = Image.open(io.BytesIO(d)).convert('RGB'); return imgs[ix]

    faces = []
    def walk(ni, parent):
        n = g['nodes'][ni]; m = matmul(parent, trs(n))
        if 'mesh' in n:
            for prim in g['meshes'][n['mesh']]['primitives']:
                if prim.get('mode', 4) != 4: continue
                at = prim['attributes']; pos = acc(at['POSITION'])
                idx = acc(prim['indices']) if 'indices' in prim else list(range(len(pos)))
                col = acc(at['COLOR_0']) if 'COLOR_0' in at else None
                uv = acc(at['TEXCOORD_0']) if 'TEXCOORD_0' in at else None
                mat = g.get('materials', [{}])[prim['material']] if 'material' in prim else {}
                pbr = mat.get('pbrMetallicRoughness', {}); bc = pbr.get('baseColorFactor', [1, 1, 1, 1])
                tex = pbr.get('baseColorTexture'); im = None
                if tex is not None and uv is not None:
                    im = image(g['textures'][tex['index']]['source'])
                em = mat.get('emissiveFactor', [0, 0, 0]); glow = sum(em) > .6
                for t in range(0, len(idx) - 2, 3):
                    tri = idx[t:t + 3]; p = [apply(m, pos[i]) for i in tri]
                    if col:
                        c = [sum(col[i][k] for i in tri) / 3 for k in range(3)]
                        c = [srgb(c[k] * bc[k]) for k in range(3)]
                    elif im is not None:
                        u = sum(uv[i][0] for i in tri) / 3; v = sum(uv[i][1] for i in tri) / 3
                        px = im.getpixel((int(min(max(u % 1.0, 0), .9999) * im.width), int(min(max(v % 1.0, 0), .9999) * im.height)))
                        c = [round(px[k] * bc[k]) for k in range(3)]
                    else:
                        c = [srgb(bc[k]) for k in range(3)]
                    if glow: c = [max(c[k], srgb(em[k])) for k in range(3)]
                    faces.append({'p': p, 'c': c, 'g': 1 if glow else 0})
        for ch in n.get('children', []): walk(ch, m)
    ident = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    sc = g['scenes'][g.get('scene', 0)]
    for r in sc['nodes']: walk(r, ident)
    return faces

def load_obj(path):
    mats = {}; cur = [200, 200, 200]; V = []; faces = []
    base = os.path.dirname(path)
    for line in open(path, encoding='utf-8', errors='ignore'):
        s = line.split()
        if not s: continue
        if s[0] == 'mtllib':
            mp = os.path.join(base, ' '.join(s[1:]))
            if os.path.exists(mp):
                name = None
                for l in open(mp, encoding='utf-8', errors='ignore'):
                    w = l.split()
                    if not w: continue
                    if w[0] == 'newmtl': name = ' '.join(w[1:])
                    elif w[0] == 'Kd' and name: mats[name] = [srgb(float(x)) for x in w[1:4]]
        elif s[0] == 'usemtl': cur = mats.get(' '.join(s[1:]), [200, 200, 200])
        elif s[0] == 'v': V.append([float(x) for x in s[1:4]])
        elif s[0] == 'f':
            ids = [int(x.split('/')[0]) for x in s[1:]]; ids = [i - 1 if i > 0 else len(V) + i for i in ids]
            for k in range(1, len(ids) - 1):
                faces.append({'p': [V[ids[0]], V[ids[k]], V[ids[k + 1]]], 'c': cur, 'g': 0})
    return faces

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('file'); ap.add_argument('--key', required=True); ap.add_argument('--name', required=True)
    ap.add_argument('--desc', default=''); ap.add_argument('--size', type=float, default=2.0, help="altezza/dimensione massima (default 2.0)")
    ap.add_argument('--out', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'media', 'models', 'models.json'))
    a = ap.parse_args()
    faces = load_obj(a.file) if a.file.lower().endswith('.obj') else load_gltf(a.file)
    if not faces: sys.exit('Nessun triangolo trovato.')
    mn = [min(v[k] for f in faces for v in f['p']) for k in range(3)]; mx = [max(v[k] for f in faces for v in f['p']) for k in range(3)]
    s = a.size / max(mx[k] - mn[k] for k in range(3))
    out = [{'p': [[round(v[k] * s, 3) for k in range(3)] for v in f['p']], 'c': f['c'], 'g': f['g']} for f in faces]
    n = len(out)
    print(f'{a.key}: {n} triangoli' + ('  (ATTENZIONE: più di 2500, il visore potrebbe essere lento)' if n > 2500 else ''))
    try: db = json.load(open(a.out))
    except Exception: db = {'models': []}
    db['models'] = [m for m in db['models'] if m['key'] != a.key] + [{'key': a.key, 'name': a.name, 'desc': a.desc, 'faces': out}]
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(db, open(a.out, 'w'), separators=(',', ':'), ensure_ascii=False)
    print('Scritto', os.path.normpath(a.out))
main()
