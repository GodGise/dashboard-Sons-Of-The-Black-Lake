(function(){
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* barra di avanzamento */
const pb=document.getElementById('pb');
function onScroll(){const m=document.documentElement.scrollHeight-innerHeight;if(pb)pb.style.width=(m>0?scrollY/m*100:0)+'%';
  document.querySelectorAll('.story').forEach(s=>{const r=s.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.6-r.top)/r.height));const f=s.querySelector('.fill');if(f)f.style.height=(p*(r.height-12))+'px'})}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();
/* rivelazione allo scroll, con scaglionamento */
window.reveal=function(){
  document.querySelectorAll('.tiles>*,.ppl>*,.road>*,.feat>*,.rules>*,.chips>*').forEach((n,i)=>{if(!n.classList.contains('rv')){n.classList.add('rv');n.style.transitionDelay=((i%6)*70)+'ms'}});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);setTimeout(()=>{e.target.style.transitionDelay=''},1200)}}),{threshold:.12});
  document.querySelectorAll('.rv').forEach(n=>io.observe(n));
};
/* voce di menu attiva */
const links=[...document.querySelectorAll('nav a[href^="#"]')];
if(links.length){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
  links.forEach(a=>{const t=document.querySelector(a.getAttribute('href'));if(t)io.observe(t)})}
/* braci pixelate che salgono nell'intestazione (quadratini, niente sfocature: look da vecchio gioco) */
const cv=document.getElementById('fx');
if(cv&&!reduce&&innerWidth>700&&!matchMedia('(pointer:coarse)').matches){const g=cv.getContext('2d');let W,H,ps=[],run=true,vis=true;
  const d=devicePixelRatio||1,PX=3*d;/* lato del "pixel" */
  const size=()=>{const r=cv.getBoundingClientRect();W=cv.width=r.width*d;H=cv.height=r.height*d};size();addEventListener('resize',size);
  /* colori caldi di fiamma, ogni tanto un lampo azzurro acciaio */
  const COL=['255,222,150','246,183,95','232,150,46','201,105,31','232,150,46','246,183,95','140,190,240'];
  const mk=(init)=>({x:Math.random()*W,y:init?Math.random()*H:H+10,k:Math.random()<.3?2:1,v:(Math.random()*.45+.2)*d,a:Math.random()*6.28,s:Math.random()*.02+.008,c:COL[Math.floor(Math.random()*COL.length)]});
  const n=Math.min(60,Math.round(innerWidth/18));for(let i=0;i<n;i++)ps.push(mk(true));
  let last=0;
  (function loop(t){if(run&&vis&&t-last>50){last=t;g.clearRect(0,0,W,H);ps.forEach((p,i)=>{p.y-=p.v*2;p.a+=p.s;p.x+=Math.sin(p.a)*1.1;if(p.y<-10)ps[i]=mk(false);
    const k=Math.max(0,Math.min(1,p.y/H)),o=Math.round(((.3+.7*Math.abs(Math.sin(p.a*1.7)))*(.3+.7*k))*4)/4;/* opacità a gradini */
    g.fillStyle='rgba('+p.c+','+o+')';g.fillRect(Math.round(p.x/PX)*PX,Math.round(p.y/PX)*PX,PX*p.k,PX*p.k)})}requestAnimationFrame(loop)})(0);
  new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(cv);
  document.addEventListener('visibilitychange',()=>{run=!document.hidden});
}
})();

/* Visore 3D low poly, senza librerie: poligoni a tinta unita disegnati su un canvas piccolo e ingranditi
   "a pixel", come nei giochi di una volta. I modelli sono costruiti qui dentro con forme semplici
   (scatole, tronchi di cono, prismi). Sono modelli di anteprima: quelli definitivi del gioco li fa Nazar. */
(function(){
const rad=d=>d*Math.PI/180;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mean=p=>{const n=p.length;return [p.reduce((s,v)=>s+v[0],0)/n,p.reduce((s,v)=>s+v[1],0)/n,p.reduce((s,v)=>s+v[2],0)/n]};
function newell(p){const n=[0,0,0];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];n[0]+=(a[1]-b[1])*(a[2]+b[2]);n[1]+=(a[2]-b[2])*(a[0]+b[0]);n[2]+=(a[0]-b[0])*(a[1]+b[1])}return n}
/* ogni faccia viene girata in modo che la sua normale guardi fuori dal solido */
function mk(polys,col,center,glow){return polys.map(p=>{p=p.map(v=>v.slice());if(dot(newell(p),sub(mean(p),center))<0)p.reverse();return {p,c:hex(col),g:!!glow}})}
function place(fs,x,y,z,o){o=o||{};const R=p=>{let a=p[0],b=p[1],c=p[2],t,cs,sn;
  if(o.rx){t=rad(o.rx);cs=Math.cos(t);sn=Math.sin(t);[b,c]=[b*cs-c*sn,b*sn+c*cs]}
  if(o.ry){t=rad(o.ry);cs=Math.cos(t);sn=Math.sin(t);[a,c]=[a*cs+c*sn,-a*sn+c*cs]}
  if(o.rz){t=rad(o.rz);cs=Math.cos(t);sn=Math.sin(t);[a,b]=[a*cs-b*sn,a*sn+b*cs]}
  return [a+x,b+y,c+z]};
  return fs.map(f=>({p:f.p.map(R),c:f.c,g:f.g,b:f.b}))}
function box(x,y,z,w,h,d,col,o){o=o||{};const X=w/2,Y=h/2,Z=d/2,v=[[-X,-Y,-Z],[X,-Y,-Z],[X,Y,-Z],[-X,Y,-Z],[-X,-Y,Z],[X,-Y,Z],[X,Y,Z],[-X,Y,Z]];
  const q=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[3,2,6,7],[0,3,7,4],[1,2,6,5]].map(i=>i.map(k=>v[k]));
  return place(mk(q,col,[0,0,0],o.g),x,y,z,o)}
/* tronco di cono con n lati (r1=0: piramide). sx/sz schiacciano la sezione, rot0 ruota i lati */
function fr(x,y,z,r0,r1,h,n,col,o){o=o||{};const sx=o.sx==null?1:o.sx,sz=o.sz==null?1:o.sz,a0=rad(o.rot0||0);
  const ring=(r,yy)=>{const a=[];for(let i=0;i<n;i++){const t=a0+i*2*Math.PI/n;a.push([r*Math.cos(t)*sx,yy,r*Math.sin(t)*sz])}return a};
  const b=ring(r0,-h/2),t=ring(r1,h/2),q=[];
  for(let i=0;i<n;i++){const j=(i+1)%n;q.push([b[i],b[j],t[j],t[i]])}
  if(r1>0)q.push(t);if(r0>0)q.push(b);
  return place(mk(q,col,[0,0,0],o.g),x,y,z,o)}
/* solido convesso da punti e facce */
function solid(pts,idx,col,o){o=o||{};const c=mean(pts);return place(mk(idx.map(i=>i.map(k=>pts[k])),col,c,o.g),o.x||0,o.y||0,o.z||0,o)}

const C={steel:'#aeb8c6',dsteel:'#5d6877',bronze:'#b9833a',leather:'#4a2f1b',wood:'#7a5230',dwood:'#3f2a18',bone:'#d9d0b6',skin:'#648340',dskin:'#46602c',cloth:'#8a2f2c',
  stone:'#7d8590',dstone:'#565e69',thatch:'#bf9a52',plaster:'#a98b66',glow:'#8fe0ff',amber:'#ffc15a',water:'#0d2236',blue:'#3d4f6e',eye:'#ffd24a'};

const MODELS=[
 {key:'spada',name:'Spada',desc:"L'arma del Guerriero.",build:()=>[
  ...fr(0,-1.3,0,.16,.12,.22,6,C.bronze),...fr(0,-.92,0,.07,.07,.62,6,C.leather),
  ...box(0,-.52,0,.95,.12,.2,C.bronze),...box(-.5,-.52,0,.12,.28,.28,C.bronze),...box(.5,-.52,0,.12,.28,.28,C.bronze),
  ...fr(0,.34,0,.34,.27,1.56,4,C.steel,{rot0:45,sz:.3}),...fr(0,1.35,0,.27,0,.46,4,C.steel,{rot0:45,sz:.3}),
  ...box(0,.3,.075,.07,1.3,.02,C.dsteel),...box(0,.3,-.075,.07,1.3,.02,C.dsteel)]},
 {key:'scudo',name:'Scudo',desc:'Per parare i colpi più duri.',build:()=>[
  ...fr(0,0,.02,1.02,1.02,.2,8,C.bronze,{rot0:22.5,rx:90}),...fr(0,0,.06,.88,.88,.16,8,C.blue,{rot0:22.5,rx:90}),
  ...box(0,0,.17,.18,1.7,.05,C.bronze),...box(0,0,.17,1.7,.18,.05,C.bronze),
  ...fr(0,0,.24,.3,.15,.18,8,C.bronze,{rot0:22.5,rx:90}),...fr(0,0,.34,.1,.1,.03,8,C.steel,{rot0:22.5,rx:90})]},
 {key:'arco',name:'Arco',desc:"Veloce e preciso: l'arma del Ladro.",build:()=>{
  const out=[],R=1.2,N=8,P=[];for(let i=0;i<=N;i++){const t=rad(-62+124*i/N);P.push([.45+R*Math.cos(t)-R,R*Math.sin(t)])}
  for(let i=0;i<N;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])+.03,ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI,th=i===N/2-1||i===N/2?.2:.15-.06*Math.abs(i-N/2+.5)/N;
    out.push(...box((a[0]+b[0])/2,(a[1]+b[1])/2,0,L,th,.12,i===N/2-1||i===N/2?C.leather:C.wood,{rz:ang}))}
  const top=P[0],bot=P[N];out.push(...box(top[0]+.02,(top[1]+bot[1])/2,0,.025,top[1]-bot[1],.025,'#e6dcc0'));
  out.push(...box(top[0]-.4,0,0,1.6,.04,.04,C.wood),...fr(top[0]+.5,0,0,.07,0,.28,4,C.steel,{rz:-90,rot0:45}),...box(top[0]-1.1,.07,0,.28,.04,.015,C.cloth,{rz:20}),...box(top[0]-1.1,-.07,0,.28,.04,.015,C.cloth,{rz:-20}));
  return out}},
 {key:'bastone',name:'Bastone incantato',desc:'Lo Stregone lo usa per lanciare incantesimi.',build:()=>[
  ...fr(0,-1.28,0,0,.07,.4,6,C.dsteel),...fr(0,-.05,0,.075,.06,2.3,6,C.dwood),
  ...fr(0,.5,0,.1,.1,.12,6,C.bronze),...fr(0,1.12,0,.08,.13,.22,6,C.bronze),
  ...box(.2,1.25,0,.05,.5,.05,C.dwood,{rz:-18}),...box(-.2,1.25,0,.05,.5,.05,C.dwood,{rz:18}),...box(0,1.25,.2,.05,.5,.05,C.dwood,{rx:18}),...box(0,1.25,-.2,.05,.5,.05,C.dwood,{rx:-18}),
  ...fr(0,1.5,0,.22,0,.3,4,C.glow,{rot0:45,g:true}),...fr(0,1.2,0,.22,0,.3,4,C.glow,{rot0:45,rz:180,g:true}).map(f=>f)]},
 {key:'ascia',name:'Ascia da legna',desc:"L'arma con cui tutto comincia.",build:()=>[
  ...fr(0,-.1,0,.075,.065,2.1,6,C.wood),...fr(0,-1.18,0,.1,.1,.14,6,C.dwood),
  ...box(0,.78,0,.26,.62,.34,C.dsteel),...fr(.62,.78,0,.22,.72,.9,4,C.steel,{rot0:45,sz:.3,rz:-90}),...box(-.24,.78,0,.26,.4,.26,C.dsteel)]},
 {key:'pozzo',name:'Pozzo',desc:'Il vecchio pozzo del villaggio.',build:()=>{
  const o=[];
  for(let i=0;i<8;i++){const a=i*45;o.push(...box(Math.cos(rad(a))*.78,.4,Math.sin(rad(a))*.78,.28,.8,.66,i%2?C.stone:C.dstone,{ry:-a}))}
  o.push(...fr(0,.52,0,.62,.62,.04,8,C.water,{rot0:22.5,g:true}),
   ...box(-.9,1.3,0,.16,2.2,.16,C.dwood),...box(.9,1.3,0,.16,2.2,.16,C.dwood),...box(0,2.28,0,2.1,.16,.2,C.dwood),
   ...solid([[-1.15,2.36,-.55],[1.15,2.36,-.55],[1.15,2.36,.55],[-1.15,2.36,.55],[-1.15,2.9,0],[1.15,2.9,0]],[[0,1,5,4],[3,2,5,4],[0,3,4],[1,2,5],[0,1,2,3]],C.thatch),
   ...box(0,1.75,0,.03,1.0,.03,C.leather),...fr(0,1.15,0,.2,.26,.3,6,C.dwood),...box(0,.9,0,.04,.04,.04,C.bronze));
  return o}}
];

function prepare(m){
  let fs=m.build(),mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  fs.forEach(f=>f.p.forEach(v=>{for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],v[k]);mx[k]=Math.max(mx[k],v[k])}}));
  const dx=-(mn[0]+mx[0])/2,dz=-(mn[2]+mx[2])/2,dy=-mn[1];
  fs=place(fs,dx,dy,dz);const n0=fs.length;
  let rh=0;fs.forEach(f=>f.p.forEach(v=>{rh=Math.max(rh,Math.hypot(v[0],v[2]))}));
  const pr=Math.max(rh*1.12,.95);
  fs.push(...fr(0,-.06,0,pr,pr,.12,10,C.dstone,{rot0:18}),...fr(0,-.15,0,pr*1.12,pr*1.12,.06,10,C.bronze,{rot0:18}).map(f=>f));
  fs.slice(n0).forEach((f,i)=>{f.b=i<fs.length-n0-0&&f.c.join()===hex(C.bronze).join()?1:2});
  const h=mx[1]-mn[1];
  return {faces:fs,cy:(h-.18)/2,R:Math.max(Math.hypot(rh,(h+.18)/2),pr*1.1)}}

function Viewer(canvas){
  const W=canvas.width=448,H=canvas.height=336,g=canvas.getContext('2d');
  const L=(()=>{const v=[-.45,.7,.55],n=Math.hypot(...v);return v.map(x=>x/n)})();
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let M=null,yaw=.6,pitch=.32,zoom=1,drag=null,idle=0,vis=true,last=0,dirty=true,cur=null;
  const api={models:MODELS,onchange:null};
  function draw(){
    g.clearRect(0,0,W,H);if(!M)return;
    const D=M.R*6,k=Math.min(W,H)*.4/M.R*zoom,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),out=[];
    for(const f of M.faces){
      const p=f.p.map(v=>{let x=v[0],y=v[1]-M.cy,z=v[2];let a=x*cy+z*sy,c=-x*sy+z*cy;x=a;z=c;let b=y*cp-z*sp;c=y*sp+z*cp;return [x,b,c]});
      const n=newell(p),cen=mean(p);if(dot(n,[-cen[0],-cen[1],D-cen[2]])<=0)continue;
      const nl=Math.hypot(...n)||1,sh=f.g?1:.36+.64*Math.max(0,(n[0]*L[0]+n[1]*L[1]+n[2]*L[2])/nl);
      out.push({z:f.b?(f.b===1?-1e9:-5e8)+cen[2]:cen[2],p,c:f.c.map(v=>Math.min(255,Math.round(v*sh*(f.g?1.1:1))))})}
    out.sort((a,b)=>a.z-b.z);
    g.lineJoin='round';g.lineWidth=1;g.strokeStyle='rgba(0,0,0,.5)';
    for(const f of out){g.beginPath();f.p.forEach((v,i)=>{const s=D/(D-v[2]),X=W/2+v[0]*s*k,Y=H*.5-v[1]*s*k;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.closePath();g.fillStyle='rgb('+f.c.join(',')+')';g.fill();g.stroke()}}
  function frame(t){
    const dt=Math.min(.05,(t-last)/1000||0);last=t;
    if(vis){if(!drag&&!reduce){idle+=dt;if(idle>1.2){yaw+=dt*.7;dirty=true}}
      if(dirty){dirty=false;draw()}}
    requestAnimationFrame(frame)}
  api.select=key=>{const m=MODELS.find(x=>x.key===key)||MODELS[0];cur=m;if(!m.cache)m.cache=prepare(m);M=m.cache;zoom=1;pitch=.32;dirty=true;idle=0;if(api.onchange)api.onchange(m)};
  api.zoom=f=>{zoom=Math.max(.7,Math.min(2.4,zoom*f));dirty=true};
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,t:e.pointerType};canvas.setPointerCapture(e.pointerId);canvas.classList.add('grab')});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;yaw+=dx*.012;if(drag.t==='mouse')pitch=Math.max(-.5,Math.min(1.1,pitch+dy*.008));dirty=true;idle=0});
  const end=()=>{drag=null;idle=0;canvas.classList.remove('grab')};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();api.zoom(e.deltaY<0?1.08:.92)}},{passive:false});
  canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){yaw-=.2}else if(e.key==='ArrowRight'){yaw+=.2}else if(e.key==='+'||e.key==='='){api.zoom(1.15)}else if(e.key==='-'){api.zoom(.87)}else return;e.preventDefault();dirty=true;idle=0});
  new IntersectionObserver(e=>{vis=e[0].isIntersecting;dirty=true}).observe(canvas);
  requestAnimationFrame(frame);
  return api}
window.Viewer3D=Viewer;
/* modelli definitivi: media/models/models.json (creato con tools/glb2model.py), sostituiscono quelli provvisori con la stessa chiave */
Viewer.load=async function(){try{const r=await fetch('media/models/models.json',{cache:'no-cache'});if(!r.ok)return;const j=await r.json();
  for(const m of (j&&j.models)||[]){if(!/^[a-z0-9-]{1,24}$/.test(m.key||'')||!Array.isArray(m.faces)||!m.faces.length)continue;
    const fs=m.faces.filter(f=>Array.isArray(f.p)&&f.p.length>=3&&Array.isArray(f.c));
    const o={key:m.key,name:String(m.name||m.key).slice(0,40),desc:String(m.desc||'').slice(0,160),build:()=>fs.map(f=>({p:f.p.map(v=>v.slice()),c:f.c.slice(),g:!!f.g}))};
    const i=MODELS.findIndex(x=>x.key===m.key);if(i>=0)MODELS[i]=o;else MODELS.push(o)}}catch(e){}};
})();

/* Sfondo animato dell'intestazione: montagne innevate viste dal lago nero, di notte.
   Disegnato a bassa risoluzione e ingrandito "a pixel" (stile retro). Luna, stelle che brillano,
   nuvole lente, nebbia, neve che cade e l'acqua che riflette le montagne con onde e cerchi. */
(function(){
const cv=document.getElementById('sky');if(!cv)return;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,coarse=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const g=cv.getContext('2d');
let W,H,hy,sky,mount,full,cl1,cl2,mist,stars,flakes,moon,ripples=[],vis=true,last=0,t0=performance.now(),rid=0;
const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const rng=seed=>{let s=seed>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)};
function ridge(R,base,amp,step,k){/* profilo a punte, a segmenti netti (low poly) */
  const ph=[R()*6.3,R()*6.3,R()*6.3],f=[1.3+R()*.6,2.9+R()*.8,6.1+R()*1.2].map(v=>v*k*2*Math.PI/W),pts=[];
  for(let x=-step;x<=W+step;x+=step){let n=0;n+=1*(1-Math.abs(Math.sin(f[0]*x+ph[0])));n+=.5*(1-Math.abs(Math.sin(f[1]*x+ph[1])));n+=.25*(1-Math.abs(Math.sin(f[2]*x+ph[2])));n=n/1.75+(R()-.5)*.07;pts.push([x,base-amp*n])}
  return pts}
function mountain(c,R,pts,base,col,snowLine){
  for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],lit=y1>y0;
    c.fillStyle=lit?col.lit:col.shade;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x1,base);c.lineTo(x0,base);c.fill();
    if(snowLine!=null&&Math.min(y0,y1)<snowLine){const s0=Math.max(y0,snowLine+Math.sin(x0*.9)*4+R()*4),s1=Math.max(y1,snowLine+Math.sin(x1*.9)*4+R()*4);
      c.fillStyle=lit?col.snowLit:col.snowShade;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x1,s1);c.lineTo(x0,s0);c.fill()}}}
function haze(c,y0,y1,a){const gr=c.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'rgba(43,69,102,0)');gr.addColorStop(1,'rgba(43,69,102,'+a+')');c.fillStyle=gr;c.fillRect(0,y0,W,y1-y0)}
function clouds(R,n,y0,y1,alpha){const c=mkc(W,hy),x=c.getContext('2d');
  for(let i=0;i<n;i++){const cx=R()*W,cy=y0+R()*(y1-y0),rx=W*(.06+R()*.12),ry=2+R()*5;
    for(const o of [-W,0,W]){x.fillStyle='rgba(6,12,22,'+alpha+')';x.beginPath();x.ellipse(cx+o,cy,rx,ry,0,0,7);x.fill();
      x.fillStyle='rgba(140,168,205,.16)';x.beginPath();x.ellipse(cx+o+rx*.15,cy-ry*.55,rx*.8,ry*.35,0,0,7);x.fill()}}
  return c}
function setup(){
  const r=cv.parentElement.getBoundingClientRect();W=coarse?240:380;H=Math.max(150,Math.round(W*r.height*1.18/Math.max(1,r.width)));cv.width=W;cv.height=H;hy=Math.round(H*.62);
  const R=rng(11);
  sky=mkc(W,hy);let s=sky.getContext('2d');
  let gr=s.createLinearGradient(0,0,0,hy);gr.addColorStop(0,'#03060c');gr.addColorStop(.55,'#0a1424');gr.addColorStop(1,'#1d3552');s.fillStyle=gr;s.fillRect(0,0,W,hy);
  const mr=Math.max(6,Math.round(W*.03));moon={x:Math.round(W*.74),y:Math.round(hy*.3),r:mr};
  const hl=s.createRadialGradient(moon.x,moon.y,mr*.5,moon.x,moon.y,mr*10);hl.addColorStop(0,'rgba(170,200,235,.4)');hl.addColorStop(1,'rgba(170,200,235,0)');s.fillStyle=hl;s.fillRect(0,0,W,hy);
  s.fillStyle='#e9eff8';s.beginPath();s.arc(moon.x,moon.y,mr,0,7);s.fill();
  s.fillStyle='rgba(120,140,170,.38)';[[-.3,-.2,.28],[.25,.15,.22],[-.1,.4,.16],[.3,-.35,.14]].forEach(([a,b,c])=>{s.beginPath();s.arc(moon.x+a*mr,moon.y+b*mr,c*mr,0,7);s.fill()});
  /* montagne: lontane con neve, poi più scure, infine la riva con i pini */
  mount=mkc(W,hy);const m=mount.getContext('2d'),st=Math.max(7,Math.round(W/46));
  mountain(m,R,ridge(R,hy*.84,hy*.6,st,1),hy,{lit:'#2b4466',shade:'#16263c',snowLit:'#cddcee',snowShade:'#7388a6'},hy*.5);haze(m,hy*.4,hy,.3);
  mountain(m,R,ridge(R,hy*.93,hy*.4,st,1.2),hy,{lit:'#192b43',shade:'#0d1829',snowLit:'#a4b7ce',snowShade:'#4d607a'},hy*.66);haze(m,hy*.55,hy,.34);
  const near=ridge(R,hy*1.0,hy*.2,Math.round(st*.8),.8);mountain(m,R,near,hy,{lit:'#0b131f',shade:'#060b13'},null);
  m.fillStyle='#04080e';near.forEach(([x,y])=>{if(R()<.75){const h=hy*.05+R()*hy*.07,w=h*.38;m.beginPath();m.moveTo(x,y-h);m.lineTo(x+w,y+2);m.lineTo(x-w,y+2);m.fill()}});
  full=mkc(W,hy);const f=full.getContext('2d');f.drawImage(sky,0,0);f.drawImage(mount,0,0);
  cl1=clouds(rng(3),7,hy*.1,hy*.38,.55);cl2=clouds(rng(5),6,hy*.28,hy*.5,.7);
  /* nebbia: bande morbide che scorrono */
  mist=mkc(W,28);const q=mist.getContext('2d'),R2=rng(9);
  for(let i=0;i<9;i++){const cx=R2()*W,cy=14+(R2()-.5)*8,rx=W*(.1+R2()*.14);for(const o of [-W,0,W]){q.save();q.translate(cx+o,cy);q.scale(1,.16);const rg=q.createRadialGradient(0,0,0,0,0,rx);rg.addColorStop(0,'rgba(150,178,212,.28)');rg.addColorStop(1,'rgba(150,178,212,0)');q.fillStyle=rg;q.beginPath();q.arc(0,0,rx,0,7);q.fill();q.restore()}}
  const R3=rng(21);stars=[];for(let i=0;i<Math.round(W*.42);i++)stars.push({x:Math.round(R3()*W),y:Math.round(R3()*hy*.72),p:R3()*6.3,s:.6+R3()*2.2,b:R3()<.12});
  flakes=[];for(let i=0;i<Math.round(W*.2);i++)flakes.push({x:R3()*W,y:R3()*H,v:6+R3()*14,p:R3()*6.3,a:.35+R3()*.5})}
function wrapDraw(img,ox,y,a){g.globalAlpha=a;const x=-(((ox%W)+W)%W);g.drawImage(img,x,y);g.drawImage(img,x+W,y);g.globalAlpha=1}
function draw(t,dt){
  g.clearRect(0,0,W,H);g.drawImage(sky,0,0);
  for(const s of stars){const a=(.3+.7*(.5+.5*Math.sin(t*s.s+s.p)))*(s.b?1:.7);g.fillStyle='rgba('+(s.b?'255,244,220':'200,220,255')+','+a.toFixed(2)+')';g.fillRect(s.x,s.y,s.b?2:1,1)}
  wrapDraw(cl1,t*1.6,0,1);wrapDraw(cl2,t*3.2,0,1);
  g.drawImage(mount,0,0);
  wrapDraw(mist,t*2.4,hy-20,.9);
  /* lago: riflesso capovolto con onde, poi scurito */
  const wh=H-hy;
  for(let d=0;d<wh;d++){const sy=hy-1-d;if(sy<0)break;g.globalAlpha=.62*(1-d/wh*.75);g.drawImage(full,0,sy,W,1,Math.round(Math.sin(d*.5+t*1.5)*(.7+d*.05)),hy+d,W,1)}
  g.globalAlpha=1;const wg=g.createLinearGradient(0,hy,0,H);wg.addColorStop(0,'rgba(5,11,20,.42)');wg.addColorStop(1,'rgba(1,3,6,.9)');g.fillStyle=wg;g.fillRect(0,hy,W,wh);
  /* colonna di luce della luna sull'acqua, a tratti */
  for(let d=2;d<wh;d+=2){const k=d/wh,w=moon.r*(1+k*2.4)*(.3+.7*Math.max(0,Math.sin(d*.8-t*2.1)));if(w<1)continue;g.fillStyle='rgba(205,224,248,'+(.4*(1-k*.8)).toFixed(2)+')';g.fillRect(Math.round(moon.x+Math.sin(d*.45+t*.9)*2-w/2),hy+d,Math.round(w),1)}
  /* cerchi sull'acqua ogni tanto */
  if(!ripples.length||t-ripples[ripples.length-1].t>3.2+Math.random()*3)ripples.push({x:W*(.1+Math.random()*.8),y:hy+wh*(.25+Math.random()*.65),t});
  ripples=ripples.filter(p=>t-p.t<3);g.lineWidth=1;
  for(const p of ripples){const a=t-p.t,r=a*7;if(a<=0)continue;g.strokeStyle='rgba(175,205,235,'+(.32*(1-a/3)).toFixed(2)+')';g.beginPath();g.ellipse(p.x,p.y,r,r*.22,0,0,7);g.stroke();if(a>.5){g.beginPath();g.ellipse(p.x,p.y,(a-.5)*7,(a-.5)*1.5,0,0,7);g.stroke()}}
  wrapDraw(mist,-t*3.4,hy-4,.7);
  /* neve */
  for(const f of flakes){f.y+=f.v*dt;f.x+=Math.sin(t*.7+f.p)*7*dt;if(f.y>H){f.y=-2;f.x=Math.random()*W}if(f.x<0)f.x+=W;if(f.x>W)f.x-=W;g.fillStyle='rgba(225,236,250,'+f.a.toFixed(2)+')';g.fillRect(Math.round(f.x),Math.round(f.y),1,1)}}
function loop(now){
  rid=requestAnimationFrame(loop);
  if(!vis||document.hidden)return;
  const gap=1000/(coarse?15:24);if(now-last<gap)return;const dt=Math.min(.1,(now-last)/1000);last=now;draw((now-t0)/1000,dt)}
setup();draw(4,0);
if(!reduce){rid=requestAnimationFrame(loop)}
new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(cv);
if(!reduce){let pq=0;addEventListener('scroll',()=>{if(pq)return;pq=requestAnimationFrame(()=>{pq=0;const y=scrollY;if(y<innerHeight*1.3)cv.style.transform='translate3d(0,'+(y*.28).toFixed(1)+'px,0)'})},{passive:true})}
let rs=0;addEventListener('resize',()=>{clearTimeout(rs);rs=setTimeout(()=>{setup();draw((performance.now()-t0)/1000,0)},200)});
})();

/* torna su */
(function(){const b=document.createElement('button');b.type='button';b.className='up';b.textContent='\u2191';b.setAttribute('aria-label','Torna su');
  b.onclick=()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});document.body.append(b);
  let q=0;addEventListener('scroll',()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;b.classList.toggle('on',scrollY>900)})},{passive:true})})();
window.lightbox=function(src,cap){const o=document.createElement('div');o.className='lb';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  const im=document.createElement('img');im.src=src;im.alt=cap||'';const x=document.createElement('button');x.type='button';x.textContent='\u00d7';x.setAttribute('aria-label','Chiudi');
  const close=()=>{o.remove();document.removeEventListener('keydown',k);if(window.__lbf)window.__lbf.focus()},k=e=>{if(e.key==='Escape')close()};
  x.onclick=close;o.onclick=e=>{if(e.target!==im)close()};o.append(im,x);if(cap){const p=document.createElement('p');p.textContent=cap;o.append(p)}
  document.addEventListener('keydown',k);document.body.append(o);x.focus()};
