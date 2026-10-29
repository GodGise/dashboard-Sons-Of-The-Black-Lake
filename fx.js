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
})();
