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
S.COL=['linear-gradient(135deg,#4f9de8,#2a5f9e)','linear-gradient(135deg,#e8962e,#a8531a)','linear-gradient(135deg,#6cbf5a,#2f7a3c)','linear-gradient(135deg,#8b78d6,#4d3f94)'];
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
  const home=page==='index.html'||page==='',H=id=>(home?'':'index.html')+'#'+id;
  [[H('gioco'),'Il gioco'],[H('modelli'),'In 3D'],[H('storia'),'La storia'],[H('progressi'),'Progressi'],[H('team'),'Il team']].forEach(([h,t])=>{
    const a=document.createElement('a');a.href=h;a.textContent=S.t(t);nav.append(a)});
  const g=document.createElement('a');g.href=H('sostieni');g.className='go';g.textContent=S.t('Sostienici');nav.append(g);
  const sel=document.createElement('select');sel.className='lang';sel.setAttribute('aria-label','Language');SUP.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=NAMES[c];if(c===S.lang)o.selected=true;sel.append(o)});sel.onchange=()=>S.setLang(sel.value);nav.append(sel);
}
const ft=document.getElementById('ft');
if(ft){
  const home=page==='index.html'||page==='',H=id=>(home?'':'index.html')+'#'+id,E=S.el;
  const col=(t,links)=>{const d=E('div');d.append(E('h4','',S.t(t)));links.forEach(([h,x,ext])=>{const a=E('a','',S.t(x));a.href=h;if(ext){a.target='_blank';a.rel='noopener'}d.append(a)});return d};
  const brand=E('div'),fb=E('div','fb'),im=E('img');im.src='media/logo.svg';im.alt='';im.width=34;im.height=34;fb.append(im,E('span','','Obolus Studio'));
  brand.append(fb,E('p','',S.t('Un gioco dark fantasy open world, da giocare da soli o in tre.')));
  const g=E('div','fgrid');
  const build=C=>{
    const sc=[];if(/^https:\/\//.test(C.steam_url||''))sc.push([C.steam_url,'Steam',1]);
    if(/^https:\/\//.test(C.donate_url||''))sc.push([C.donate_url,'Ko-fi',1]);
    const so=C.social||{};[['discord','Discord'],['youtube','YouTube'],['x','X'],['instagram','Instagram'],['tiktok','TikTok']].forEach(([k,n])=>{if(/^https:\/\//.test(so[k]||''))sc.push([so[k],n,1])});
    g.replaceChildren(brand,
      col('Esplora',[[H('gioco'),'Il gioco'],[H('modelli'),'In 3D'],[H('storia'),'La storia'],[H('progressi'),'Progressi'],[H('team'),'Il team']]),
      col('Segui il progetto',sc.length?sc:[[H('sostieni'),'Sostienici']]),
      col('Studio',[[H('press'),'Press kit'],[H('sostieni'),'Sostienici'],['team.html','Area team']]));
    const bar=E('div','fbar',S.t('© 2026 Obolus Studio. Tutti i diritti riservati.')+' · Sons of the Black Lake');
    ft.replaceChildren(g,bar)};
  build({});S.cfg.then(build)}
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
