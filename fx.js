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
