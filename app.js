/* app.js - responsive, mobile-first AtlasStock
   Features: IndexedDB (with localStorage fallback), translations (en/fr/ar), currencies,
   responsive layout (sidebar + bottom nav), add/edit/delete/sell, CSV/JSON import/export,
   barcode scanning (BarcodeDetector), printable labels, simple charts.
*/
(() => {
  'use strict';

  /* ---------- translations & currencies ---------- */
  const translations = {
    en: { title:'AtlasStock', add:'Add', edit:'Edit', del:'Delete', import:'Import', export:'Export', total:'Total', low:'Low', value:'Value', activity:'Activity', name:'Name', sku:'SKU', category:'Category', qty:'Qty', price:'Price', save:'Save', cancel:'Cancel', newproduct:'New product', search:'Search...', sell:'Sell', sellQty:'Quantity to sell' },
    fr: { title:'AtlasStock', add:'Ajouter', edit:'Éditer', del:'Supprimer', import:'Importer', export:'Exporter', total:'Total', low:'Faible', value:'Valeur', activity:'Journal', name:'Nom', sku:'SKU', category:'Catégorie', qty:'Quantité', price:'Prix', save:'Enregistrer', cancel:'Annuler', newproduct:'Produit', search:'Rechercher...', sell:'Vendre', sellQty:'Quantité à vendre' },
    ar: { title:'أطلس ستوك', add:'إضافة', edit:'تعديل', del:'حذف', import:'استيراد', export:'تصدير', total:'الإجمالي', low:'منخفض', value:'القيمة', activity:'النشاط', name:'الاسم', sku:'رمز', category:'الفئة', qty:'الكمية', price:'السعر', save:'حفظ', cancel:'إلغاء', newproduct:'منتج جديد', search:'بحث...', sell:'بيع', sellQty:'كمية للبيع' }
  };

  const currencies = [
    {code:'DZD',name:'Algerian Dinar'}, {code:'XOF',name:'CFA Franc'}, {code:'EUR',name:'Euro'},
    {code:'USD',name:'US Dollar'}, {code:'GBP',name:'British Pound'}, {code:'MAD',name:'Moroccan Dirham'},
    {code:'TND',name:'Tunisian Dinar'}, {code:'SAR',name:'Saudi Riyal'}, {code:'AED',name:'UAE Dirham'}
  ];

  /* ---------- DOM shortcuts ---------- */
  const $ = id => document.getElementById(id);
  const sidebar = document.querySelector('.sidebar');
  const menuButtons = Array.from(document.querySelectorAll('.menu-btn'));
  const bottomNavBtns = Array.from(document.querySelectorAll('.bnav'));
  const views = Array.from(document.querySelectorAll('.view'));
  const topTitle = $('topTitle');

  /* elements */
  const langSel = $('language-selector'), curSel = $('currency-selector');
  const qEl = $('q'), tbody = $('tbody');
  const totalCountEl = $('totalCount'), lowCountEl = $('lowCount'), stockValueEl = $('stockValue');
  const modal = $('modal'), modalTitle = $('modalTitle'), productForm = $('productForm');
  const sellModal = $('sellModal'), sellForm = $('sellForm'), sellInfo = $('sellInfo');
  const fileInput = $('fileInput');
  const video = $('video'), scanModal = $('scanModal'), scanFile = $('scanFile');

  /* ---------- IndexedDB helpers ---------- */
  const DB_NAME = 'atlasstock-v1', STORE = 'products', LOG = 'log';
  function openDB(){
    return new Promise((res,rej)=>{
      if(!window.indexedDB) return res(null);
      const r = indexedDB.open(DB_NAME,1);
      r.onupgradeneeded = e => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains(STORE)){
          const os = db.createObjectStore(STORE,{keyPath:'id'});
          os.createIndex('name','name'); os.createIndex('sku','sku'); os.createIndex('category','category'); os.createIndex('updated','updated');
        }
        if(!db.objectStoreNames.contains(LOG)) db.createObjectStore(LOG,{autoIncrement:true});
      };
      r.onsuccess = ()=>res(r.result);
      r.onerror = ()=>rej(r.error);
    });
  }
  async function tx(names, mode, fn){
    const db = await openDB();
    if(!db) throw new Error('no-idb');
    return new Promise((res,rej)=>{
      try{
        const t = db.transaction(names, mode);
        const stores = {}; names.forEach(n=>stores[n]=t.objectStore(n));
        t.oncomplete = ()=>res(true);
        t.onerror = ()=>rej(t.error);
        fn(stores, t);
      } catch(e){ rej(e); }
    });
  }

  /* fallback LS */
  const ls = { get:k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}, set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}} };

  /* ---------- CRUD ---------- */
  async function addProduct(p){
    p.id = p.id || (crypto?.randomUUID?crypto.randomUUID():'id-'+Math.random().toString(36).slice(2,9));
    p.updated = Date.now();
    try{ await tx([STORE],'readwrite', s=>s[STORE].put(p)); } catch { const arr = ls.get('products')||[]; arr.push(p); ls.set('products',arr); }
    log(`Added ${p.name}`); renderAll();
  }
  async function updateProduct(id, patch){
    const existing = await getProduct(id);
    if(!existing) return;
    const next = Object.assign({}, existing, patch, {updated:Date.now()});
    try{ await tx([STORE],'readwrite', s=>s[STORE].put(next)); } catch { let arr=ls.get('products')||[]; arr=arr.map(a=>a.id===id?next:a); ls.set('products',arr); }
    log(`Updated ${next.name}`); renderAll();
  }
  async function deleteProduct(id){
    try{ await tx([STORE],'readwrite', s=>s[STORE].delete(id)); } catch { let arr=ls.get('products')||[]; arr=arr.filter(a=>a.id!==id); ls.set('products',arr); }
    log(`Deleted ${id}`); renderAll();
  }
  async function getAll(){
    try{
      const db = await openDB(); if(!db) throw new Error('no-idb');
      return new Promise((res,rej)=>{ const out=[]; const cur = db.transaction(STORE,'readonly').objectStore(STORE).openCursor(); cur.onsuccess = e=>{ const c=e.target.result; if(c){ out.push(c.value); c.continue(); } }; cur.onerror=()=>rej(cur.error); cur.transaction.oncomplete=()=>res(out); });
    } catch { return Promise.resolve(ls.get('products')||[]); }
  }
  async function getProduct(id){
    try{ const db=await openDB(); if(!db) throw new Error('no-idb'); return new Promise((res,rej)=>{ const req = db.transaction(STORE,'readonly').objectStore(STORE).get(id); req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error); }); } catch { return Promise.resolve((ls.get('products')||[]).find(p=>p.id===id)); }
  }
  async function clearAll(){ try{ await tx([STORE,LOG],'readwrite', s=>{ s[STORE].clear(); s[LOG].clear(); }); }catch{} ls.set('products',[]); ls.set('log',[]); renderAll(); }

  async function log(text){ try{ await tx([LOG],'readwrite', s=>s[LOG].add({t:Date.now(),text})); }catch{ let l = ls.get('log')||[]; l.unshift({t:Date.now(),text}); ls.set('log', l); } renderActivity(); }
  async function getLog(){ try{ const db=await openDB(); if(!db) throw new Error('no-idb'); return new Promise((res,rej)=>{ const out=[]; const cur = db.transaction(LOG,'readonly').objectStore(LOG).openCursor(null,'prev'); cur.onsuccess = e=>{ const c=e.target.result; if(c){ out.push(c.value); c.continue(); } }; cur.transaction.oncomplete=()=>res(out); }); }catch{return Promise.resolve(ls.get('log')||[]);} }

  /* ---------- UI: navigation & responsive ---------- */
  function setView(name){
    views.forEach(v=>v.classList.toggle('hidden', v.dataset.view !== name));
    menuButtons.forEach(b=>b.classList.toggle('active', b.dataset.view===name));
    bottomNavBtns.forEach(b=>b.classList.toggle('active', b.dataset.view===name));
    topTitle && (topTitle.textContent = name[0].toUpperCase()+name.slice(1));
    closeSidebarIfMobile();
  }
  menuButtons.forEach(b=>b.addEventListener('click', ()=>setView(b.dataset.view)));
  bottomNavBtns.forEach(b=>b.addEventListener('click', ()=>setView(b.dataset.view)));

  function openSidebar(){ sidebar.classList.add('open'); }
  function closeSidebarIfMobile(){ if(window.innerWidth<=900) sidebar.classList.remove('open'); }
  $('menuToggle')?.addEventListener('click', ()=>sidebar.classList.toggle('open'));
  window.addEventListener('resize', ()=>{ if(window.innerWidth>900) sidebar.classList.remove('open'); });

  /* ---------- i18n & currencies ---------- */
  function populateLanguages(){ Object.keys(translations).forEach(l=>{ const o=document.createElement('option'); o.value=l; o.textContent = l==='en'?'English':(l==='fr'?'Français':'العربية'); langSel.appendChild(o); }); }
  function populateCurrencies(){ currencies.forEach(c=>{ const o=document.createElement('option'); o.value=c.code; o.textContent = `${c.code} — ${c.name}`; curSel.appendChild(o); }); }
  function detectLanguage(){ try{ const nav=(navigator.language||'en').toLowerCase(); const code=nav.split('-')[0]; return translations[code]?code:'en'; }catch{return 'en';} }
  const regionCurrencyMap = {dz:'DZD',ci:'XOF',fr:'EUR',us:'USD',gb:'GBP',ma:'MAD',tn:'TND',sa:'SAR',ae:'AED'};
  function detectCurrency(){ try{ const nav=(navigator.language||'en').toLowerCase(); const parts=nav.split('-'); const region=parts[1]?parts[1].toLowerCase():''; if(region && regionCurrencyMap[region]) return regionCurrencyMap[region]; const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''; if(tz){ const country = tz.split('/')[0].toLowerCase(); if(regionCurrencyMap[country]) return regionCurrencyMap[country]; } }catch{} return 'USD'; }

  function i18n(key){ const lang = langSel.value || detectLanguage(); return (translations[lang] && translations[lang][key]) || translations.en[key] || key; }
  function translateUI(){ document.querySelectorAll('[data-i18n]').forEach(el=>{ const k=el.getAttribute('data-i18n'); if(k) el.textContent = i18n(k); }); $('app-title').textContent = i18n('title'); document.documentElement.lang = langSel.value; document.body.dir = langSel.value==='ar'?'rtl':'ltr'; }

  /* ---------- Rendering ---------- */
  async function renderAll(){
    const items = await getAll();
    const q = (qEl.value||'').trim().toLowerCase();
    const list = items.filter(i=>{ if(!q) return true; return (i.name||'').toLowerCase().includes(q) || (i.sku||'').toLowerCase().includes(q) || (i.category||'').toLowerCase().includes(q); }).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    totalCountEl.textContent = list.length;
    lowCountEl.textContent = list.filter(i=>Number(i.qty)<=Number(i.threshold||0)).length;
    stockValueEl.textContent = formatMoney(list.reduce((s,i)=>s + (Number(i.qty)||0)*(Number(i.price)||0),0));

    tbody.innerHTML = '';
    list.forEach((it, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${idx+1}</td><td>${escape(it.name)}</td><td>${escape(it.sku||'')}</td><td>${escape(it.category||'')}</td><td class="${Number(it.qty)<=Number(it.threshold||0)?'low':''}">${Number(it.qty)||0}</td><td>${formatMoney(Number(it.price)||0)}</td><td>${it.updated?new Date(it.updated).toLocaleString():''}</td><td></td>`;
      const actionsTd = tr.querySelector('td:last-child');
      const edit = document.createElement('button'); edit.className='btn ghost'; edit.textContent=i18n('edit'); edit.onclick=()=>openProductModal(it);
      const sell = document.createElement('button'); sell.className='btn ghost'; sell.textContent=i18n('sell'); sell.onclick=()=>openSellModal(it);
      const del = document.createElement('button'); del.className='btn ghost'; del.textContent=i18n('del'); del.onclick=()=>{ if(confirm(i18n('del')+'?')) deleteProduct(it.id); };
      actionsTd.appendChild(edit); actionsTd.appendChild(sell); actionsTd.appendChild(del);
      tbody.appendChild(tr);
    });

    renderActivity();
    drawChart(list);
  }

  async function renderActivity(){
    const logs = await getLog();
    const el = document.querySelector('.log');
    if(!el) return;
    el.innerHTML = '';
    (logs||[]).slice(0,60).forEach(l=>{ const d=document.createElement('div'); d.className='muted'; d.textContent = new Date(l.t).toLocaleString()+' — '+l.text; el.appendChild(d); });
  }

  /* ---------- product modal ---------- */
  let editingId = null;
  function openProductModal(p){ editingId = p? p.id : null; modalTitle.textContent = p? i18n('edit') : i18n('newproduct'); $('p_name').value = p ? p.name : ''; $('p_sku').value = p ? p.sku : ''; $('p_category').value = p ? p.category : ''; $('p_qty').value = p ? p.qty : 0; $('p_price').value = p ? p.price : 0; $('p_threshold').value = p ? (p.threshold||5) : 5; showModal(modal); }
  function showModal(m){ m.classList.add('open'); m.style.display='flex'; m.setAttribute('aria-hidden','false'); }
  function hideModal(m){ m.classList.remove('open'); m.style.display='none'; m.setAttribute('aria-hidden','true'); }

  productForm.addEventListener('submit', async e=>{ e.preventDefault(); const p = { name:$('p_name').value.trim(), sku:$('p_sku').value.trim(), category:$('p_category').value.trim(), qty:Number($('p_qty').value)||0, price:Number($('p_price').value)||0, threshold:Number($('p_threshold').value)||5 }; if(!p.name) return alert('Name required'); if(editingId) await updateProduct(editingId, p); else await addProduct(p); hideModal(modal); });

  $('modalClose').addEventListener('click', ()=>hideModal(modal));
  $('modalCancel').addEventListener('click', ()=>hideModal(modal));

  /* ---------- sell modal ---------- */
  let sellingId = null;
  function openSellModal(item){ sellingId = item.id; $('sellInfo').textContent = `${item.name} — ${item.qty} ${i18n('qty')}`; $('sell_qty').value = 1; showModal(sellModal); }
  sellForm.addEventListener('submit', async e=>{ e.preventDefault(); const q = Number($('sell_qty').value)||0; if(!sellingId || q<=0) return; const prod = await getProduct(sellingId); if(!prod) return alert('Item not found'); if(q > Number(prod.qty||0)) return alert('Not enough stock'); await updateProduct(sellingId, { qty: (Number(prod.qty)||0) - q }); log(`Sold ${q} × ${prod.name}`); hideModal(sellModal); });
  $('sellClose').addEventListener('click', ()=>hideModal(sellModal));
  $('sellCancel').addEventListener('click', ()=>hideModal(sellModal));

  /* ---------- import/export/backup/reset ---------- */
  $('btn-add')?.addEventListener('click', ()=>openProductModal(null));
  $('btn-add-side')?.addEventListener('click', ()=>{ setView('inventory'); openProductModal(null); });
  $('btn-import')?.addEventListener('click', ()=>fileInput.click());
  fileInput.addEventListener('change', async e=>{
    const f = e.target.files[0]; if(!f) return;
    const text = await f.text();
    if(f.name.endsWith('.json')){ try{ const data = JSON.parse(text); if(Array.isArray(data)){ for(const p of data) await addProduct(p); alert('Imported JSON'); } }catch{ alert('Invalid JSON'); } }
    else { const rows = text.split(/\r?\n/).filter(Boolean); const headers = rows[0].split(',').map(h=>h.trim().toLowerCase()); for(let i=1;i<rows.length;i++){ const cols = rows[i].split(','); const obj={}; headers.forEach((h,idx)=>obj[h]=cols[idx]); const p={ name: obj.name||obj.title||'Unknown', sku: obj.sku||'', category: obj.category||'', qty: Number(obj.qty||0), price: Number(obj.price||0), threshold: Number(obj.threshold||5) }; await addProduct(p); } alert('Imported CSV'); }
    e.target.value='';
    renderAll();
  });

  $('btn-export')?.addEventListener('click', ()=>{ getAll().then(items=>{ const headers=['id','name','sku','category','qty','price','threshold','updated']; const csv=[headers.join(',')].concat(items.map(i=>headers.map(h=>'"'+String(i[h]||'').replace(/"/g,'""')+'"').join(','))).join('\n'); download(csv,'text/csv','atlasstock-'+(new Date().toISOString().slice(0,10))+'.csv'); }); });
  $('btn-backup')?.addEventListener('click', ()=>{ getAll().then(items=>download(JSON.stringify(items,null,2),'application/json','atlasstock-backup-'+Date.now()+'.json')); });
  $('btn-reset')?.addEventListener('click', ()=>{ if(confirm('Reset all local data?')) clearAll(); });

  function download(content,type,filename){ const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }

  /* ---------- scanner ---------- */
  $('btn-scan')?.addEventListener('click', openScanner);
  $('scanClose')?.addEventListener('click', stopScanner);
  $('scanStop')?.addEventListener('click', stopScanner);
  $('scanFile')?.addEventListener('change', async e=>{ const f=e.target.files[0]; if(!f) return; const url=URL.createObjectURL(f); const img=new Image(); img.onload=async ()=>{ const code = await decodeImage(img); if(code) handleScanned(code); else alert('No code found'); URL.revokeObjectURL(url); }; img.src=url; });

  let stream=null, scanner=null, scanning=false;
  async function openScanner(){
    showModal(scanModal);
    if('BarcodeDetector' in window){ scanner = new BarcodeDetector(); try{ stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); video.srcObject = stream; scanning=true; tick(); }catch(e){ alert('Camera not allowed or not available'); } }
    else { try{ stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); video.srcObject = stream; scanning=true; tick(); }catch(e){ alert('Camera not available'); } }
  }
  async function tick(){
    if(!scanning) return;
    try{
      const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight; const ctx = canvas.getContext('2d'); ctx.drawImage(video,0,0);
      if(scanner){ const results = await scanner.detect(canvas).catch(()=>[]); if(results && results.length){ handleScanned(results[0].rawValue); stopScanner(); return; } }
    }catch(e){}
    setTimeout(tick, 500);
  }
  async function stopScanner(){ scanning=false; if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } hideModal(scanModal); }
  async function decodeImage(img){
    const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; const ctx=c.getContext('2d'); ctx.drawImage(img,0,0);
    if('BarcodeDetector' in window){ const det = new BarcodeDetector(); const res = await det.detect(c).catch(()=>[]); if(res && res.length) return res[0].rawValue; }
    return null;
  }
  async function handleScanned(value){
    const items = await getAll();
    const found = items.find(i=> (i.sku||'').toLowerCase()===value.toLowerCase() || (i.id||'')===value || (i.name||'').toLowerCase()===value.toLowerCase());
    if(found) openSellModal(found);
    else if(confirm(`No product found for "${value}". Create new?`)) openProductModal({name:value, sku:value, category:'', qty:0, price:0});
  }

  /* ---------- charts (category value) ---------- */
  function drawChart(items){
    const canvas = $('chartCanvas'); if(!canvas) return;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height);
    const byCat = {}; (items||[]).forEach(i=>{ const c=i.category||'Uncategorized'; byCat[c]=(byCat[c]||0)+((Number(i.qty)||0)*(Number(i.price)||0)); });
    const entries = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,8);
    if(entries.length===0){ ctx.fillStyle='#9aa4b2'; ctx.font='14px sans-serif'; ctx.fillText('No data',20,30); return; }
    const w=canvas.width, h=canvas.height, pad=40; const gap=12; const max=Math.max(...entries.map(e=>e[1]));
    entries.forEach((e,i)=>{ const bw = (w-pad*2 - gap*(entries.length-1))/entries.length; const x = pad + i*(bw+gap); const bh = (e[1]/max)*(h-pad*2); ctx.fillStyle='#00b3ff'; ctx.fillRect(x, h-pad-bh, bw, bh); ctx.fillStyle='#e6eef6'; ctx.font='12px sans-serif'; ctx.fillText(e[0], x, h-pad+14); });
  }

  /* ---------- helpers ---------- */
  function escape(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function formatMoney(n){ const cur = curSel.value || 'USD'; try{ return new Intl.NumberFormat(undefined,{style:'currency',currency:cur}).format(Number(n||0)); }catch{return (Number(n||0).toFixed(2))+' '+cur; } }
  function download(content,type,name){ const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url); }

  function $(id){ return document.getElementById(id); }

  /* ---------- startup ---------- */
  (async function init(){
    populateLanguages(); populateCurrencies();
    langSel.value = detectLang(); curSel.value = detectCurrency(); translateUI();
    window.addEventListener('click', e=>{ if(e.target.matches('.bnav')){} });
    // wire bottom nav (for mobile)
    document.querySelectorAll('.bnav').forEach(b=>b.addEventListener('click', ()=>setView(b.dataset.view)));

    // wire top buttons
    $('btn-print')?.addEventListener('click', ()=>window.print());
    $('btn-export')?.addEventListener('click', ()=>{ getAll().then(items=>{ const headers=['id','name','sku','category','qty','price','threshold','updated']; const csv=[headers.join(',')].concat(items.map(i=>headers.map(h=>'"'+String(i[h]||'').replace(/"/g,'""')+'"').join(','))).join('\n'); download(csv,'text/csv','atlasstock-'+(new Date().toISOString().slice(0,10))+'.csv'); }); });
    $('btn-backup')?.addEventListener('click', ()=>getAll().then(items=>download(JSON.stringify(items,null,2),'application/json','atlas-backup-'+Date.now()+'.json')));
    $('btn-reset')?.addEventListener('click', ()=>{ if(confirm('Reset all local data?')) clearAll(); });

    // search
    qEl.addEventListener('input', debounce(renderAll,180));

    // initial seed if empty
    const items = await getAll();
    if(!items || items.length===0){
      await addProduct({name:'iPhone 15 Pro',sku:'IP15P',category:'Phones',qty:30,price:999.99,threshold:5});
      await addProduct({name:'Galaxy A35',sku:'SGA35',category:'Phones',qty:120,price:249.5,threshold:10});
      await addProduct({name:'Logitech M325',sku:'LOG-M325',category:'Accessories',qty:240,price:19.99,threshold:20});
    }

    // show inventory on start
    setView('dashboard');
    renderAll();

    // quick sell search list
    $('sellSearch')?.addEventListener('input', debounce(async e=>{ const q=e.target.value.trim().toLowerCase(); const list = await getAll(); const matches = list.filter(i=> (i.name||'').toLowerCase().includes(q) || (i.sku||'').toLowerCase().includes(q)).slice(0,8); const out=$('sellResults'); out.innerHTML=''; matches.forEach(m=>{ const el = document.createElement('div'); el.className='list-item'; el.textContent = `${m.name} — ${m.qty}`; el.onclick = ()=>openSellModal(m); out.appendChild(el); }); },200));

    // scanning wiring
    $('scanFile')?.addEventListener('change', async e=>{ const f=e.target.files[0]; if(!f) return; const img=new Image(); const url=URL.createObjectURL(f); img.onload=async ()=>{ const code = await decodeImage(img); if(code) handleScanned(code); else alert('No code'); URL.revokeObjectURL(url); }; img.src=url; });

    // language & currency change
    langSel.addEventListener('change', ()=>{ translateUI(); renderAll(); });
    curSel.addEventListener('change', ()=>renderAll());

    // PWA registration (simple)
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
  })();

  /* ---------- small utilities ---------- */
  function debounce(fn,wait){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }
  function populateLanguages(){ Object.keys(translations).forEach(l=>{ const o = document.createElement('option'); o.value=l; o.textContent = l==='en'?'English':(l==='fr'?'Français':'العربية'); langSel.appendChild(o); }); }
  function populateCurrencies(){ currencies.forEach(c=>{ const o=document.createElement('option'); o.value=c.code; o.textContent = `${c.code} — ${c.name}`; curSel.appendChild(o); }); }
  function detectLang(){ try{ const nav=(navigator.language||'en').toLowerCase(); const code=nav.split('-')[0]; return translations[code]?code:'en'; }catch{return 'en'} }
  function detectCurrency(){ try{ const nav=(navigator.language||'en').toLowerCase(); const parts=nav.split('-'); const region=parts[1]?parts[1].toLowerCase():''; if(region && regionCurrencyMap[region]) return regionCurrencyMap[region]; const tz = Intl.DateTimeFormat().resolvedOptions().timeZone||''; if(tz){ const country = tz.split('/')[0].toLowerCase(); if(regionCurrencyMap[country]) return regionCurrencyMap[country]; } }catch{} return 'USD'; }

  /* ---------- image decode helper (for scanner fallback) ---------- */
  async function decodeImage(img){
    try{ if('BarcodeDetector' in window){ const det = new BarcodeDetector(); const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height; const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0); const res = await det.detect(canvas).catch(()=>[]); if(res && res.length) return res[0].rawValue; } }catch(e){} return null;
  }

  async function handleScanned(value){
    const items = await getAll();
    const found = items.find(i=> (i.sku||'').toLowerCase()===value.toLowerCase() || (i.id||'')===value || (i.name||'').toLowerCase()===value.toLowerCase());
    if(found) openSellModal(found); else if(confirm(`No product for "${value}". Create?`)) openProductModal({name:value,sku:value,category:'',qty:0,price:0});
  }

})();
