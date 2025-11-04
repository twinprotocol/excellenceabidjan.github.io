// app.js
(() => {
  'use strict';

  /* ---------- translations & currencies ---------- */
  const translations = {
    en: { title: 'AtlasStock', add: 'Add', edit: 'Edit', del: 'Delete', import: 'Import', export: 'Export', total: 'Total', low: 'Low', value: 'Value', activity: 'Activity', name: 'Name', sku: 'SKU', category: 'Category', qty: 'Qty', price: 'Price', save: 'Save', cancel: 'Cancel', newproduct: 'New product', search: 'Search...', actions: 'Actions', threshold: 'Low threshold', sell: 'Sell', sellQty: 'Quantity to sell' },
    fr: { title: 'AtlasStock', add: 'Ajouter', edit: 'Éditer', del: 'Supprimer', import: 'Importer', export: 'Exporter', total: 'Total', low: 'Faible', value: 'Valeur', activity: 'Journal', name: 'Nom', sku: 'SKU', category: 'Catégorie', qty: 'Quantité', price: 'Prix', save: 'Enregistrer', cancel: 'Annuler', newproduct: 'Produit', search: 'Rechercher...', actions: 'Actions', threshold: 'Seuil', sell: 'Vendre', sellQty: 'Quantité à vendre' },
    ar: { title: 'أطلس ستوك', add: 'إضافة', edit: 'تعديل', del: 'حذف', import: 'استيراد', export: 'تصدير', total: 'الإجمالي', low: 'منخفض', value: 'القيمة', activity: 'النشاط', name: 'الاسم', sku: 'رمز', category: 'الفئة', qty: 'الكمية', price: 'السعر', save: 'حفظ', cancel: 'إلغاء', newproduct: 'منتج جديد', search: 'بحث...', actions: 'الإجراءات', threshold: 'عند النفاذ', sell: 'بيع', sellQty: 'كمية للبيع' }
  };

  const currencies = [
    { code: 'DZD', name: 'Algerian Dinar' }, { code: 'XOF', name: 'CFA Franc (XOF)' }, { code: 'EUR', name: 'Euro' },
    { code: 'USD', name: 'US Dollar' }, { code: 'GBP', name: 'British Pound' }, { code: 'MAD', name: 'Moroccan Dirham' },
    { code: 'TND', name: 'Tunisian Dinar' }, { code: 'SAR', name: 'Saudi Riyal' }, { code: 'AED', name: 'UAE Dirham' }
  ];

  /* ---------- DOM ---------- */
  const langSel = el('language-selector'), curSel = el('currency-selector'), qEl = el('q'), tbody = el('tbody');
  const activityEl = el('activity'), totalCountEl = el('totalCount'), lowCountEl = el('lowCount'), stockValueEl = el('stockValue');
  const modal = el('modal'), modalTitle = el('modalTitle'), modalClose = el('modalClose'), modalCancel = el('modalCancel'), productForm = el('productForm');
  const sellModal = el('sellModal'), sellForm = el('sellForm'), sellInfo = el('sellInfo'), sellClose = el('sellClose'), sellCancel = el('sellCancel');
  const fileInput = el('fileInput');

  function el(id){ return document.getElementById(id); }

  /* ---------- DB (IndexedDB with localStorage fallback) ---------- */
  const DB = { name: 'atlasstock-v1', store: 'products', log: 'log' };

  function openDB(){
    return new Promise((res, rej) => {
      if (!window.indexedDB) return res(null);
      const req = indexedDB.open(DB.name, 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB.store)) {
          const os = db.createObjectStore(DB.store, { keyPath: 'id' });
          os.createIndex('name', 'name'); os.createIndex('sku', 'sku'); os.createIndex('category', 'category'); os.createIndex('updated', 'updated');
        }
        if (!db.objectStoreNames.contains(DB.log)) db.createObjectStore(DB.log, { autoIncrement: true });
      };
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  async function idbTx(storeNames, mode, task){
    const db = await openDB();
    if (!db) throw new Error('no-idb');
    return new Promise((res, rej) => {
      try {
        const tx = db.transaction(storeNames, mode);
        const stores = {}; storeNames.forEach(n => stores[n] = tx.objectStore(n));
        tx.oncomplete = () => res(true);
        tx.onerror = () => rej(tx.error);
        task(stores, tx);
      } catch (e){ rej(e); }
    });
  }

  async function addProduct(p){
    p.id = p.id || (crypto?.randomUUID ? crypto.randomUUID() : 'id-'+Math.random().toString(36).slice(2,9));
    p.updated = Date.now();
    try {
      await idbTx([DB.store], 'readwrite', s => s[DB.store].put(p));
    } catch {
      const arr = lsGet('atlas-products') || []; arr.push(p); lsSet('atlas-products', arr);
    }
    logEvent(`Added ${p.name}`);
    pushUndo({type:'add', item:p});
    await renderAll();
  }

  async function updateProduct(id, patch){
    try {
      const existing = await getProduct(id);
      if (!existing) return;
      const next = Object.assign({}, existing, patch); next.updated = Date.now();
      await idbTx([DB.store], 'readwrite', s => s[DB.store].put(next));
      pushUndo({type:'update', before: existing, after: next});
    } catch {
      let arr = lsGet('atlas-products') || []; arr = arr.map(a => a.id === id ? Object.assign({}, a, patch, {updated:Date.now()}) : a); lsSet('atlas-products', arr);
    }
    logEvent(`Updated ${patch.name || id}`);
    await renderAll();
  }

  async function deleteProduct(id){
    try { await idbTx([DB.store], 'readwrite', s => s[DB.store].delete(id)); } catch { let arr = lsGet('atlas-products') || []; arr = arr.filter(a => a.id !== id); lsSet('atlas-products', arr); }
    pushUndo({type:'delete', item:{id}});
    logEvent(`Deleted ${id}`);
    await renderAll();
  }

  async function getAll(){
    try {
      const db = await openDB();
      if (!db) throw new Error('no-idb');
      return new Promise((res, rej) => {
        const out = []; const tx = db.transaction(DB.store, 'readonly'); const cur = tx.objectStore(DB.store).openCursor();
        cur.onsuccess = e => { const c = e.target.result; if (c){ out.push(c.value); c.continue(); } };
        tx.oncomplete = () => res(out); tx.onerror = () => rej(tx.error);
      });
    } catch {
      return Promise.resolve(lsGet('atlas-products') || []);
    }
  }

  async function getProduct(id){
    try {
      const db = await openDB(); if (!db) throw new Error('no-idb');
      return new Promise((res, rej) => {
        const tx = db.transaction(DB.store, 'readonly'); const req = tx.objectStore(DB.store).get(id);
        req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error);
      });
    } catch {
      return Promise.resolve((lsGet('atlas-products')||[]).find(p=>p.id===id));
    }
  }

  function clearAll(){
    idbTx([DB.store, DB.log], 'readwrite', s => { s[DB.store].clear(); s[DB.log].clear(); }).catch(()=>{});
    lsSet('atlas-products', []); lsSet('atlas-log', []);
    renderAll();
  }

  function logEvent(text){
    idbTx([DB.log], 'readwrite', s => s[DB.log].add({t:Date.now(), text})).catch(()=>{ const l=lsGet('atlas-log')||[]; l.unshift({t:Date.now(), text}); lsSet('atlas-log', l); });
    renderActivity();
  }

  function getLog(){
    return openDB().then(db => new Promise((res, rej)=>{
      const tx = db.transaction(DB.log, 'readonly'); const out=[]; const cur = tx.objectStore(DB.log).openCursor(null,'prev');
      cur.onsuccess = e => { const c = e.target.result; if(c){ out.push(c.value); c.continue(); } }; tx.oncomplete = () => res(out); tx.onerror = () => rej(tx.error);
    })).catch(()=>Promise.resolve(lsGet('atlas-log')||[]));
  }

  /* ---------- localStorage helpers ---------- */
  function lsGet(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){return null;} }
  function lsSet(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }

  /* ---------- undo/redo ---------- */
  const undoStack = [], redoStack = [];
  function pushUndo(op){ undoStack.push(op); if(undoStack.length>200) undoStack.shift(); redoStack.length=0; updateUndoUI(); }
  function updateUndoUI(){ const u = document.getElementById('undoBtn'); const r = document.getElementById('redoBtn'); if(u) u.disabled = undoStack.length===0; if(r) r.disabled = redoStack.length===0; }
  function doUndo(){ const op = undoStack.pop(); if(!op) return; if(op.type==='add') deleteProduct(op.item.id).then(()=>{redoStack.push(op); updateUndoUI();}); if(op.type==='delete') addProduct(op.item).then(()=>{redoStack.push(op); updateUndoUI();}); if(op.type==='update') updateProduct(op.before.id, op.before).then(()=>{redoStack.push(op); updateUndoUI();}); }
  function doRedo(){ const op = redoStack.pop(); if(!op) return; if(op.type==='add') addProduct(op.item).then(()=>{undoStack.push(op); updateUndoUI();}); if(op.type==='delete') deleteProduct(op.item.id).then(()=>{undoStack.push(op); updateUndoUI();}); if(op.type==='update') updateProduct(op.after.id, op.after).then(()=>{undoStack.push(op); updateUndoUI();}); }

  /* ---------- rendering ---------- */
  async function renderAll(){
    const items = await getAll();
    const q = (qEl.value||'').trim().toLowerCase();
    let list = items.filter(i => { if(!q) return true; return (i.name||'').toLowerCase().includes(q) || (i.sku||'').toLowerCase().includes(q) || (i.category||'').toLowerCase().includes(q); });
    list.sort((a,b)=> (a.name||'').localeCompare(b.name||''));
    totalCountEl.textContent = list.length;
    lowCountEl.textContent = list.filter(i=>Number(i.qty)<=Number(i.threshold||0)).length;
    stockValueEl.textContent = formatMoney(list.reduce((s,i)=>s + (Number(i.qty)||0)*(Number(i.price)||0), 0));
    tbody.innerHTML = '';
    list.forEach((it, idx) => {
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${idx+1}</td><td>${escape(it.name)}</td><td>${escape(it.sku||'')}</td><td>${escape(it.category||'')}</td><td class="${Number(it.qty)<=Number(it.threshold||0)?'low':''}">${Number(it.qty)||0}</td><td>${formatMoney(Number(it.price)||0)}</td><td>${it.updated?new Date(it.updated).toLocaleString():''}</td><td></td>`;
      const actionsTd = tr.querySelector('td:last-child');
      const edit = mk('button', {class:'btn ghost', text: i18n('edit')}); edit.onclick = ()=>openProductModal(it);
      const sell = mk('button', {class:'btn ghost', text: i18n('sell')}); sell.onclick = ()=>openSellModal(it);
      const del = mk('button', {class:'btn ghost', text: i18n('del')}); del.onclick = ()=>{ if(confirm(i18n('del')+'?')) deleteProduct(it.id); };
      actionsTd.appendChild(edit); actionsTd.appendChild(sell); actionsTd.appendChild(del);
      tbody.appendChild(tr);
    });
    renderActivity(); drawChart(list);
  }

  async function renderActivity(){
    const logs = await getLog(); activityEl.innerHTML = ''; (logs||[]).slice(0,60).forEach(l=>{ const d=document.createElement('div'); d.className='muted'; d.textContent = new Date(l.t).toLocaleString() + ' — ' + l.text; activityEl.appendChild(d); });
  }

  /* ---------- modals ---------- */
  let editingId = null;
  function openProductModal(p){
    editingId = p ? p.id : null;
    modalTitle.textContent = p ? i18n('edit') : i18n('newproduct');
    el('p_name').value = p ? p.name : '';
    el('p_sku').value = p ? p.sku : '';
    el('p_category').value = p ? p.category : '';
    el('p_qty').value = p ? p.qty : 0;
    el('p_price').value = p ? p.price : 0;
    el('p_threshold').value = p ? (p.threshold||5) : 5;
    show(modal);
  }
  function show(m){ if(!m) return; m.classList.add('open'); m.style.display='flex'; m.setAttribute('aria-hidden','false'); }
  function hide(m){ if(!m) return; m.classList.remove('open'); m.style.display='none'; m.setAttribute('aria-hidden','true'); }

  productForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const p={ name: el('p_name').value.trim(), sku: el('p_sku').value.trim(), category: el('p_category').value.trim(), qty: Number(el('p_qty').value)||0, price: Number(el('p_price').value)||0, threshold: Number(el('p_threshold').value)||5 }; if(!p.name) return alert(i18n('name')+' required'); if(editingId) await updateProduct(editingId, p); else await addProduct(p); hide(modal); });

  modalClose.addEventListener('click', ()=>hide(modal)); modalCancel.addEventListener('click', ()=>hide(modal));

  /* ---------- sell ---------- */
  let sellingId = null;
  function openSellModal(item){ sellingId = item.id; sellInfo.textContent = `${item.name} — ${item.qty} ${i18n('qty')}`; el('sell_qty').value = 1; show(sellModal); }
  sellForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const q = Number(el('sell_qty').value)||0; if(!sellingId || q<=0) return; const prod = await getProduct(sellingId); if(!prod) return alert('Item not found'); if(q > Number(prod.qty||0)) return alert('Not enough stock'); await updateProduct(sellingId, { qty: (Number(prod.qty)||0) - q }); logEvent(`Sold ${q} × ${prod.name}`); hide(sellModal); });
  sellClose.addEventListener('click', ()=>hide(sellModal)); sellCancel.addEventListener('click', ()=>hide(sellModal));

  /* ---------- import/export/backup ---------- */
  el('btn-import').addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', async (e)=>{ const f = e.target.files[0]; if(!f) return; const text = await f.text(); if(f.name.endsWith('.json')){ try{ const data = JSON.parse(text); if(Array.isArray(data)){ for(const p of data) await addProduct(p); alert('Import OK'); } }catch(e){ alert('Invalid JSON'); } } else { const rows = text.split(/\r?\n/).filter(Boolean); const headers = rows[0].split(',').map(h=>h.trim().toLowerCase()); for(let i=1;i<rows.length;i++){ const cols = rows[i].split(','); const obj={}; headers.forEach((h,idx)=>obj[h]=cols[idx]); const p={ name: obj.name||obj.title||'Unknown', sku: obj.sku||'', category: obj.category||'', qty: Number(obj.qty||0), price: Number(obj.price||0), threshold: Number(obj.threshold||5) }; await addProduct(p); } alert('Import OK'); } e.target.value=''; renderAll(); });

  el('btn-export').addEventListener('click', ()=>{ getAll().then(items=>{ const headers=['id','name','sku','category','qty','price','threshold','updated']; const csv=[headers.join(',')].concat(items.map(i=>headers.map(h=>'"'+String(i[h]||'').replace(/"/g,'""')+'"').join(','))).join('\n'); downloadBlob(csv, 'text/csv', 'atlasstock-'+(new Date().toISOString().slice(0,10))+'.csv'); }); });
  el('btn-backup').addEventListener('click', ()=>{ getAll().then(items=>{ downloadBlob(JSON.stringify(items, null, 2), 'application/json', 'atlasstock-backup-'+Date.now()+'.json'); }); });
  el('btn-reset').addEventListener('click', ()=>{ if(confirm('Reset all local data?')) clearAll(); });

  function downloadBlob(content, type, name){ const blob = new Blob([content], {type}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }

  /* ---------- scanner (BarcodeDetector API fallback to file input) ---------- */
  const scanModal = el('scanModal'), video = el('video'), scanFile = el('scanFile'), scanClose = el('scanClose'), scanStop = el('scanStop');
  el('btn-scan').addEventListener('click', openScanner);
  scanClose.addEventListener('click', stopScanner);
  scanStop.addEventListener('click', stopScanner);
  scanFile.addEventListener('change', async (e)=>{ const f = e.target.files[0]; if(!f) return; const url = URL.createObjectURL(f); const img = new Image(); img.onload = async ()=>{ try{ const code = await decodeImageFromCanvas(img); if(code) handleScanned(code); else alert('No code found'); }catch(e){ alert('Scan error'); } URL.revokeObjectURL(url); }; img.src = url; });

  let stream=null, detect=null, scanning=false;
  async function openScanner(){
    show(scanModal);
    if('BarcodeDetector' in window){ const formats = await BarcodeDetector.getSupportedFormats().catch(()=>[]); detect = new BarcodeDetector({formats}); try{ stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); video.srcObject = stream; scanning = true; tickBarcode(); }catch(e){ alert('Camera access denied'); } } else {
      // no BarcodeDetector: just open video and attempt periodic frames with simple detection (limited)
      try{ stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); video.srcObject = stream; scanning = true; tickBarcode(); }catch(e){ alert('Camera not available'); }
    }
  }
  async function tickBarcode(){
    if(!scanning) return;
    try{
      const track = stream.getVideoTracks()[0];
      const image = await captureFrame(video);
      if(detect){
        const codes = await detect.detect(image);
        if(codes && codes.length){ handleScanned(codes[0].rawValue); stopScanner(); return; }
      } else {
        // fallback: try to decode as QR by reading text via OCR not available; skip
      }
    }catch(e){}
    setTimeout(tickBarcode, 500);
  }
  function stopScanner(){ scanning=false; if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } hide(scanModal); }
  async function captureFrame(videoEl){
    const c = document.createElement('canvas'); c.width = videoEl.videoWidth; c.height = videoEl.videoHeight; const ctx = c.getContext('2d'); ctx.drawImage(videoEl,0,0); return c;
  }
  async function decodeImageFromCanvas(img){
    const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; const ctx=c.getContext('2d'); ctx.drawImage(img,0,0); if('BarcodeDetector' in window){ const detector = new BarcodeDetector(); const codes = await detector.detect(c); if(codes && codes.length) return codes[0].rawValue; } return null;
  }
  async function handleScanned(value){
    // try to find product by SKU
    const items = await getAll();
    const found = items.find(i => (i.sku||'').toLowerCase() === value.toLowerCase() || (i.id||'') === value || (i.name||'').toLowerCase() === value.toLowerCase());
    if(found) openSellModal(found);
    else if(confirm('No product found for "'+value+'". Create new?')){ openProductModal({name:value, sku:value, category:'', qty:0, price:0}); }
  }

  /* ---------- charts (simple canvas bar by category) ---------- */
  function drawChart(items){
    const canvas = el('chartCanvas'); if(!canvas) return;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height);
    const byCat = {}; (items||[]).forEach(i=>{ const c = i.category||'Uncategorized'; byCat[c] = (byCat[c]||0) + (Number(i.qty||0)*(Number(i.price||0)||0)); });
    const entries = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,8);
    if(entries.length===0){ ctx.fillStyle='#9aa4b2'; ctx.font='14px sans-serif'; ctx.fillText('No data for charts',20,30); return; }
    const w = canvas.width, h = canvas.height, pad=40; const barW = (w - pad*2) / entries.length * 0.7;
    const max = Math.max(...entries.map(e=>e[1]));
    entries.forEach((e,i)=>{ const x = pad + i * ((w-pad*2)/entries.length) + ((w - pad*2)/entries.length - barW)/2; const barH = (e[1]/max) * (h - pad*2); ctx.fillStyle = '#00b3ff'; ctx.fillRect(x, h - pad - barH, barW, barH); ctx.fillStyle='#e6eef6'; ctx.font='12px sans-serif'; ctx.fillText(e[0], x, h - pad + 14); });
  }

  /* ---------- utils ---------- */
  function mk(tag, opts={}){ const el=document.createElement(tag); if(opts.class) el.className=opts.class; if(opts.text) el.textContent=opts.text; return el; }
  function escape(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function formatMoney(num){ const code = curSel.value || 'USD'; try{ return new Intl.NumberFormat(undefined, { style:'currency', currency: code }).format(Number(num||0)); }catch(e){ return Number(num||0).toFixed(2) + ' ' + code; } }
  function i18n(key){ const lang = langSel.value || detectLanguage(); return (translations[lang] && translations[lang][key]) || translations['en'][key] || key; }

  /* ---------- init UI ---------- */
  function populateLanguages(){ Object.keys(translations).forEach(l=>{ const o=document.createElement('option'); o.value=l; o.textContent = l==='en'?'English':(l==='fr'?'Français':'العربية'); langSel.appendChild(o); }); }
  function populateCurrencies(){ currencies.forEach(c=>{ const o=document.createElement('option'); o.value=c.code; o.textContent = `${c.code} — ${c.name}`; curSel.appendChild(o); }); }

  function detectLanguage(){ try{ const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase(); const code = nav.split('-')[0]; return translations[code]?code:'en'; }catch(e){ return 'en'; } }
  const regionCurrencyMap = { dz:'DZD', ci:'XOF', fr:'EUR', us:'USD', gb:'GBP', ma:'MAD', tn:'TND', sa:'SAR', ae:'AED' };
  function detectCurrency(){ try{ const nav = (navigator.language||'en').toLowerCase(); const parts = nav.split('-'); const region = parts[1]?parts[1].toLowerCase():''; if(region && regionCurrencyMap[region]) return regionCurrencyMap[region]; const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; if(tz){ const country = tz.split('/')[0].toLowerCase(); if(regionCurrencyMap[country]) return regionCurrencyMap[country]; } }catch(e){} return 'USD'; }

  /* ---------- events ---------- */
  el('btn-add').addEventListener('click', ()=>openProductModal(null));
  el('btn-export').addEventListener('click', ()=>el('btn-export').blur() || el('btn-export'));
  el('undoBtn')?.addEventListener('click', doUndo);
  el('redoBtn')?.addEventListener('click', doRedo);
  el('clearBtn')?.addEventListener('click', ()=>{ if(confirm('Clear ALL local data?')) clearAll(); });

  qEl.addEventListener('input', debounce(renderAll, 180));
  langSel.addEventListener('change', ()=>{ translatePage(); renderAll(); });
  curSel.addEventListener('change', ()=>renderAll());

  /* ---------- PWA runtime: manifest + service worker (generated dynamically) ---------- */
  (function setupPWA(){
    // manifest
    const man = { name: 'AtlasStock', short_name: 'AtlasStock', start_url: '.', display: 'standalone', background_color:'#071224', theme_color:'#071224', icons: [{src:'data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192"><rect width="100%" height="100%" rx="24" fill="#00ffd6"/><text x="50%" y="55%" font-size="72" text-anchor="middle" font-family="sans-serif" fill="#021">AS</text></svg>') , sizes:'192x192', type:'image/svg+xml'}] };
    const manBlob = new Blob([JSON.stringify(man)], {type:'application/manifest+json'});
    const manURL = URL.createObjectURL(manBlob);
    let l = document.querySelector('link[rel="manifest"]'); if(!l){ l = document.createElement('link'); l.rel='manifest'; document.head.appendChild(l); } l.href = manURL;

    // service worker (simple cache-first)
    if('serviceWorker' in navigator){
      const swCode = `
        const CACHE = 'atlasstock-cache-v1';
        const FILES = ['/', '/index.html', '/style.css'];
        self.addEventListener('install', e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES).catch(()=>{}))); });
        self.addEventListener('fetch', e=>{ e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request).catch(()=>r))); });
      `;
      const swBlob = new Blob([swCode], {type:'text/javascript'}); const swUrl = URL.createObjectURL(swBlob);
      navigator.serviceWorker.register(swUrl).catch(()=>{});
    }
  })();

  /* ---------- startup ---------- */
  (async function init(){
    populateLanguages(); populateCurrencies();
    langSel.value = detectLanguage(); curSel.value = detectCurrency();
    translatePage();
    // create undo/redo buttons if missing (for compatibility)
    if(!el('undoBtn')){ const b = mk('button',{class:'btn ghost', text:'Undo'}); b.id='undoBtn'; document.querySelector('.controls').appendChild(b); b.addEventListener('click', doUndo); }
    if(!el('redoBtn')){ const b = mk('button',{class:'btn ghost', text:'Redo'}); b.id='redoBtn'; document.querySelector('.controls').appendChild(b); b.addEventListener('click', doRedo); }
    if(!el('clearBtn')){ const b = mk('button',{class:'btn danger', text:'Reset'}); b.id='clearBtn'; document.querySelector('.controls').appendChild(b); b.addEventListener('click', ()=>{ if(confirm('Clear ALL local data?')) clearAll(); }); }

    // seed data if empty
    const items = await getAll();
    if(!items || items.length===0){
      await addProduct({name:'iPhone 15 Pro', sku:'IP15P', category:'Phones', qty:30, price:999.99, threshold:5});
      await addProduct({name:'Galaxy A35', sku:'SGA35', category:'Phones', qty:120, price:249.5, threshold:10});
      await addProduct({name:'Logitech Mouse', sku:'LOG-M325', category:'Accessories', qty:240, price:19.99, threshold:20});
    }
    renderAll(); updateUndoUI();
  })();

  /* ---------- helpers ---------- */
  function debounce(fn, wait){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }
  function mk(tag, opts={}){ const e=document.createElement(tag); if(opts.class) e.className=opts.class; if(opts.text) e.textContent=opts.text; return e; }

  // expose for debugging
  window.AtlasStock = { renderAll, addProduct, updateProduct, deleteProduct, getAll };

  // translate UI labels
  function translatePage(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{ const k = el.getAttribute('data-i18n'); if(k) el.textContent = i18n(k); });
    el('app-title').textContent = i18n('title'); el('app-sub').textContent = i18n('activity') + ' • offline';
    if(qEl) qEl.placeholder = i18n('search');
    document.documentElement.lang = langSel.value; document.body.dir = (langSel.value==='ar')?'rtl':'ltr';
  }

})();
