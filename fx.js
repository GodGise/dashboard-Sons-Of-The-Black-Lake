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
/* braci che salgono nell'intestazione */
const cv=document.getElementById('fx');
if(cv&&!reduce){const g=cv.getContext('2d');let W,H,ps=[],run=true,vis=true;
  const size=()=>{const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;W=cv.width=r.width*d;H=cv.height=r.height*d};size();addEventListener('resize',size);
  const mk=(init)=>({x:Math.random()*W,y:init?Math.random()*H:H+10,r:(Math.random()*1.8+.6)*(devicePixelRatio||1),v:(Math.random()*.5+.25)*(devicePixelRatio||1),a:Math.random()*6.28,s:Math.random()*.02+.01,h:[28,18,340,270][Math.floor(Math.random()*4)]});
  const n=Math.min(70,Math.round(innerWidth/16));for(let i=0;i<n;i++)ps.push(mk(true));
  (function loop(){if(run&&vis){g.clearRect(0,0,W,H);ps.forEach((p,i)=>{p.y-=p.v;p.a+=p.s;p.x+=Math.sin(p.a)*.5;if(p.y<-10)ps[i]=mk(false);
    const k=Math.max(0,Math.min(1,p.y/H)),o=(.25+.55*Math.abs(Math.sin(p.a*1.7)))*(.35+.65*k);
    g.beginPath();g.fillStyle='hsla('+p.h+',100%,60%,'+o+')';g.shadowColor='hsla('+p.h+',100%,60%,.9)';g.shadowBlur=8;g.arc(p.x,p.y,p.r,0,6.28);g.fill()})}requestAnimationFrame(loop)})();
  new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(cv);
  document.addEventListener('visibilitychange',()=>{run=!document.hidden});
}
})();
