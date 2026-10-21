#!/usr/bin/env python3
"""Scarica commit e PR di GodGise/magic-gnl delle ultime due settimane e scrive data.json."""
import hashlib, json, os, urllib.request, datetime as dt
from zoneinfo import ZoneInfo

REPO = os.environ.get("TARGET_REPO", "GodGise/magic-gnl")
TOKEN = os.environ.get("GITHUB_TOKEN", "")
ROME = ZoneInfo("Europe/Rome")
SHOW_TITLES = True  # i titoli finiscono solo nel file cifrato per il team
HIDE = {"claude"}  # autori esclusi dalle statistiche

def api(path):
    req = urllib.request.Request("https://api.github.com/" + path, headers={
        "Accept": "application/vnd.github+json", "User-Agent": "gnl-dashboard",
        **({"Authorization": "Bearer " + TOKEN} if TOKEN else {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

def pages(path, cap=15):
    out, p = [], 1
    while p <= cap:
        sep = "&" if "?" in path else "?"
        chunk = api(f"{path}{sep}per_page=100&page={p}")
        out += chunk
        if len(chunk) < 100: break
        p += 1
    return out

def day(s):
    if not s: return ""
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(ROME).strftime("%Y-%m-%d")

now = dt.datetime.now(ROME)
monday = (now - dt.timedelta(days=now.weekday())).date()
start = monday - dt.timedelta(days=7)

hist_start = monday - dt.timedelta(days=56)
since = "2020-01-01T00:00:00Z"

def week_of(d):
    x = dt.date.fromisoformat(d)
    return (x - dt.timedelta(days=x.weekday())).isoformat()

agg, hist, days_set, assistant = {}, {}, set(), 0
for c in pages(f"repos/{REPO}/commits?since={since}"):
    if len(c["parents"]) > 1: continue
    d = day(c["commit"]["author"]["date"])
    a = (c.get("author") or {}).get("login") or c["commit"]["author"]["name"]
    if a in HIDE: assistant += 1; continue
    if d < hist_start.isoformat(): continue
    days_set.add(d)
    h = hist.setdefault((week_of(d), a), 0); hist[(week_of(d), a)] = h + 1
    if d < start.isoformat(): continue
    st = api(f"repos/{REPO}/commits/{c['sha']}")["stats"]
    r = agg.setdefault((d, a), [0, 0, 0])
    r[0] += 1; r[1] += st["additions"]; r[2] += st["deletions"]

prs, merged = [], []
for p in pages(f"repos/{REPO}/pulls?state=all&sort=updated&direction=desc"):
    o, m = day(p["created_at"]), day(p.get("merged_at"))
    if o >= start.isoformat() or m >= start.isoformat():
        prs.append({"n": p["number"], "author": p["user"]["login"], "opened": o, "merged": m})
    if m:
        merged.append({"n": p["number"], "title": p["title"] if SHOW_TITLES else f"Pull request #{p['number']}", "author": p["user"]["login"], "merged": m, "ts": p["merged_at"], "url": p["html_url"] if SHOW_TITLES else ""})
merged.sort(key=lambda x: x["ts"], reverse=True)
recent = [{k: v for k, v in x.items() if k != "ts"} for x in merged[:8]]

openprs = [{"n": p["number"], "title": p["title"] if SHOW_TITLES else f"Pull request #{p['number']}", "author": p["user"]["login"], "opened": day(p["created_at"]), "draft": p.get("draft", False), "url": p["html_url"] if SHOW_TITLES else ""}
           for p in pages(f"repos/{REPO}/pulls?state=open")]

# stato del capitolo 1, letto dai file della repo
tree = {t["path"] for t in api(f"repos/{REPO}/git/trees/main?recursive=1")["tree"] if t["type"] == "blob"}
nmod = sum(1 for p in tree if p.lower().endswith((".fbx", ".glb", ".gltf", ".obj")))
treeh = {hashlib.sha256(p.encode()).hexdigest()[:16] for p in tree}  # i nomi dei file non stanno nella repo pubblica
chapter = []
for step in json.load(open("scripts/chapter.json")).get("chapter", []):
    if step.get("models"):
        chapter.append({"name": step["name"], "status": "doing" if nmod else "todo", "detail": f"{nmod} modelli finora"})
        continue
    have = sum(1 for p in step["files"] if p in treeh)
    chapter.append({"name": step["name"], "status": "done" if have == len(step["files"]) else ("doing" if have else "todo")})

today = now.date()
cur = today if today.isoformat() in days_set else today - dt.timedelta(days=1)
streak = 0
while cur.isoformat() in days_set:
    streak += 1; cur -= dt.timedelta(days=1)
wk = {}
for (w, a), n in hist.items(): wk[w] = wk.get(w, 0) + n
bw = max(wk.items(), key=lambda x: x[1]) if wk else ("", 0)
cnt = {}
for m in merged: cnt[m["author"]] = cnt.get(m["author"], 0) + 1
top = max(cnt.items(), key=lambda x: x[1]) if cnt else ("", 0)
numbers = {
    "scripts": sum(1 for p in tree if p.startswith("Assets/Scripts/") and p.endswith(".cs")),
    "scenes": sum(1 for p in tree if p.endswith(".unity")),
    "models": nmod,
    "audio": sum(1 for p in tree if p.startswith("Assets/") and p.lower().endswith((".ogg", ".wav", ".mp3"))),
    "docs": sum(1 for p in tree if p.startswith("Docs/") and p.endswith(".md")),
}
records = {"streak": streak, "best_week": {"week": bw[0], "commits": bw[1]}, "top_merger": {"prs": top[1]}, "merged_total": len(merged)}

public = {
    "numbers": numbers, "records": records, "assistant": {"commits": assistant},
    "chapter": chapter,
    "generated": now.isoformat(timespec="minutes"),
}
private = {
    "generated": public["generated"],
    "week_start": monday.isoformat(), "prev_week_start": start.isoformat(),
    "commits": [{"day": d, "author": a, "commits": v[0], "additions": v[1], "deletions": v[2]} for (d, a), v in sorted(agg.items())],
    "prs": prs,
    "history": [{"week": w, "author": a, "commits": n} for (w, a), n in sorted(hist.items())],
    "recent": recent,
    "open_prs": openprs,
}
json.dump(public, open("data.json", "w"), indent=1)
pw = os.environ.get("TEAM_PASSWORD", "")
if pw:
    import sys; sys.path.insert(0, os.path.dirname(__file__))
    from crypto_util import encrypt
    json.dump(encrypt(private, pw), open("private.enc", "w"))
else:
    print("TEAM_PASSWORD mancante: area team non generata")
print("ok", len(agg), "righe commit,", len(prs), "PR")
