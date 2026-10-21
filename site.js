(function(){
const S=window.site={};
/* lingua: scelta salvata, altrimenti quella del browser del visitatore */
const SUP=['it','en','fr','es','de','pt','ru'],LOC={it:'it-IT',en:'en-GB',fr:'fr-FR',es:'es-ES',de:'de-DE',pt:'pt-BR',ru:'ru-RU'},NAMES={it:'Italiano',en:'English',fr:'Français',es:'Español',de:'Deutsch',pt:'Português',ru:'Русский'};
const detect=()=>{try{const v=localStorage.getItem('lang');if(SUP.includes(v))return v}catch(e){}
  for(const l of (navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'en'])){const c=String(l).slice(0,2).toLowerCase();if(SUP.includes(c))return c}
  return 'en'};
S.lang=detect();S.loc=LOC[S.lang];document.documentElement.lang=S.lang;
const I=window.I18N||{langs:[],rows:[],rules:[]},li=I.langs.indexOf(S.lang)+1,MAP={};
if(li>0)I.rows.forEach(r=>{MAP[r[0]]=r[li]});
const tr=str=>{const t=String(str).trim();if(!t||li<1)return null;if(MAP[t]!=null)return MAP[t];
  for(const [re,o] of I.rules){if(re.test(t)){const v=o[S.lang];return v==null?null:t.replace(re,v)}}return null};
S.t=x=>{const v=tr(x);return v==null?x:v};
S.setLang=l=>{try{localStorage.setItem('lang',l)}catch(e){}location.reload()};
S.$=id=>document.getElementById(id);
S.f=n=>n.toLocaleString(S.loc);
S.fx=(n,d)=>n.toLocaleString(S.loc,{maximumFractionDigits:d,minimumFractionDigits:0});
S.el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
S.add=(d,n)=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
S.reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
S.COL=['linear-gradient(135deg,#0a84ff,#bf5af2)','linear-gradient(135deg,#ff9f0a,#ff375f)','linear-gradient(135deg,#30d158,#40c8e0)','linear-gradient(135deg,#bf5af2,#ff375f)'];
S.count=(node,to)=>{if(S.reduce||to<2){node.textContent=S.f(to);return}const t0=performance.now();(function s(t){const p=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-p,3);node.textContent=S.f(Math.round(to*e));if(p<1)requestAnimationFrame(s)})(t0)};
S.tile=(l,v,c,m,o)=>{const t=S.el('div','tile'),n=S.el('div','n',o&&o.raw?v:'0');t.style.setProperty('--c',c);t.append(S.el('div','l',l),n,S.el('div','m',m));if(!(o&&o.raw))setTimeout(()=>S.count(n,v||0),200);return t};
S.cfg=fetch('config.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({}));
S.data=fetch('data.json',{cache:'no-store'}).then(r=>r.json());
S.fail=()=>{const a=S.$('app');if(a)a.replaceChildren(Object.assign(document.createElement('div'),{className:'err',textContent:'Impossibile caricare i dati.'}))};
S.reveal=()=>window.reveal?window.reveal():addEventListener('load',()=>window.reveal());
S.person=(v,i,big)=>{const c=S.el('div','pc'),a=S.el('div','av',v.name[0]);a.style.background=S.COL[i%S.COL.length];c.append(a,S.el('b','',v.name),S.el('div','mut',v.role));return c};
S.countdown=(C,box,lab)=>{
  if(!C.launch_date){lab.textContent='—';return}
  const tgt=new Date(C.launch_date+'T00:00:00'),U=[['giorni',864e5],['ore',36e5],['minuti',6e4],['secondi',1e3]];
  const boxes=U.map(([l])=>{const d=S.el('div'),b=S.el('b','','0');d.append(b,S.el('span','',l));box.append(d);return b});
  const tick=()=>{let ms=Math.max(0,tgt-new Date());U.forEach(([l,u],i)=>{const v=Math.floor(ms/u);ms-=v*u;boxes[i].textContent=i?String(v).padStart(2,'0'):v})};
  tick();setInterval(tick,1000);
  lab.textContent=S.t(C.launch_label||'Lancio')+' · '+tgt.toLocaleDateString(S.loc,{dateStyle:'long'});
};
S.donate=(C,btn)=>{const ok=/^https:\/\//.test(C.donate_url||'');if(ok){btn.href=C.donate_url;btn.target='_blank';btn.rel='noopener'}else{btn.classList.add('off');btn.removeAttribute('href');btn.textContent='Link in arrivo'}};

/* menu e piè di pagina condivisi */
const page=(location.pathname.split('/').pop()||'index.html');
const nav=document.getElementById('nav');
if(nav){
  const brand=document.createElement('a');brand.href='index.html';brand.className='brand';
  const im=document.createElement('img');im.src='media/logo.svg';im.alt='';im.width=26;im.height=26;
  brand.append(im,Object.assign(document.createElement('b'),{textContent:'Obolus Studio'}));
  nav.append(brand);
  [['index.html#gioco','Il gioco','index.html'],['progressi.html','Progressi','progressi.html'],['impatto.html','Impatto','impatto.html'],['chi-siamo.html','Chi siamo','chi-siamo.html']].forEach(([h,t,p])=>{
    const a=document.createElement('a');a.href=h;a.textContent=S.t(t);if(p===page&&p!=='index.html')a.className='on';nav.append(a)});
  const g=document.createElement('a');g.href='index.html#sostieni';g.className='go';g.textContent=S.t('Sostienici');nav.append(g);
  const sel=document.createElement('select');sel.className='lang';sel.setAttribute('aria-label','Language');SUP.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=NAMES[c];if(c===S.lang)o.selected=true;sel.append(o)});sel.onchange=()=>S.setLang(sel.value);nav.append(sel);
}
const ft=document.getElementById('ft');
if(ft){const a=document.createElement('p');a.style.margin='0 0 6px';a.textContent=S.t('© 2026 Obolus Studio. Tutti i diritti riservati.');
  const b=document.createElement('p');b.style.margin='0';b.append('Sons of the Black Lake · ');const l=document.createElement('a');l.href='team.html';l.textContent=S.t('Area team')+' 🔒';b.append(l);ft.replaceChildren(a,b)}
/* traduzione del contenuto della pagina (testo e attributi), anche quello creato dopo */
if(li>0){
  const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1};
  const pass=()=>{
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while(n=w.nextNode()){if(SKIP[n.parentElement&&n.parentElement.tagName])continue;const t=n.nodeValue.trim();if(!t)continue;const v=tr(t);if(v!=null&&v!==t)n.nodeValue=n.nodeValue.replace(t,v)}
    document.querySelectorAll('[placeholder],[aria-label],[alt]').forEach(e=>['placeholder','aria-label','alt'].forEach(a=>{const x=e.getAttribute(a);if(x){const v=tr(x);if(v!=null&&v!==x)e.setAttribute(a,v)}}));
    const [a,...b]=document.title.split(' – ');const v=tr(a);if(v!=null&&v!==a)document.title=[v,...b].join(' – ');
  };
  let q=0;const sched=()=>{if(!q)q=requestAnimationFrame(()=>{q=0;pass()})};
  new MutationObserver(sched).observe(document.body,{childList:true,subtree:true,characterData:true});
  pass();
}
})();
