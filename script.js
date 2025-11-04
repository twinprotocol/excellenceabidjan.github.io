/* AtlasStock app.js — separated file
   Features included:
   - IndexedDB storage for products
   - Multilingual (en/fr/ar) UI strings + RTL support
   - Currency selector with auto-detection fallback
   - Add/Edit/Delete products via a modal injected by JS
   - Import / Export CSV
   - Undo / Redo (simple stack)
   - Keyboard shortcuts (N new, / search, Ctrl/Cmd+Z undo, Ctrl/Cmd+Y redo)

   Place this file next to index.html and style.css and open index.html in a modern browser.
*/

(function () {
  'use strict';

  /* ---------- Translations & Currencies ---------- */
  const translations = {
    en: { title: 'AtlasStock', products: 'Products', name: 'Name', qty: 'Quantity', price: 'Price', add: 'Add', edit: 'Edit', del: 'Delete', import: 'Import CSV', export: 'Export CSV', total: 'Total items', low: 'Low stock', activity: 'Activity log', save: 'Save', cancel: 'Cancel', newproduct: 'New product', search: 'Search...' },
    fr: { title: 'AtlasStock', products: 'Produits', name: 'Nom', qty: 'Quantité', price: 'Prix', add: 'Ajouter', edit: 'Éditer', del: 'Supprimer', import: 'Importer CSV', export: 'Exporter CSV', total: 'Total', low: 'Stock faible', activity: 'Journal', save: 'Enregistrer', cancel: 'Annuler', newproduct: 'Produit', search: 'Rechercher...' },
    ar: { title: 'أطلس ستوك', products: 'المنتجات', name: 'الاسم', qty: 'الكمية', price: 'السعر', add: 'إضافة', edit: 'تعديل', del: 'حذف', import: 'استيراد CSV', export: 'تصدير CSV', total: 'إجمالي العناصر', low: 'نفاد المخزون', activity: 'سجل النشاط', save: 'حفظ', cancel: 'إلغاء', newproduct: 'منتج جديد', search: 'بحث...' }
  };

  const currencies = [
    { code: 'DZD', name: 'Algerian Dinar' },
    { code: 'XOF', name: 'West African CFA Franc' },
    { code: 'EUR', name: 'Euro' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'MAD', name: 'Moroccan Dirham' },
    { code: 'TND', name: 'Tunisian Dinar' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'AED', name: 'UAE Dirham' }
  ];

  /* ---------- DOM helpers & elements ---------- */
  const langSel = document.getElementById('language-selector');
  const curSel = document.getElementById('currency-selector');
  const productListTbody = document.getElementById('product-list');
  const qEl = document.getElementById('q');

  // We'll inject controls (Add / Import / Export) dynamically so index.html can stay minimal
  function injectControls() {
    const header = document.querySelector('header');
    const main = document.querySelector('main');

    // toolbar under header
    const toolbar = document.createElement('div');
    toolbar.className = 'injected-toolbar';
    toolbar.style.cssText = 'width:100%;max-width:900px;padding:8px;display:flex;gap:8px;align-items:center;justify-content:flex-start;margin-top:8px';

    const addBtn = document.createElement('button'); addBtn.textContent = i18n('add'); addBtn.id = 'injectedAdd';
    const importBtn = document.createElement('button'); importBtn.textContent = i18n('import'); importBtn.id = 'injectedImport';
    const exportBtn = document.createElement('button'); exportBtn.textContent = i18n('export'); exportBtn.id = 'injectedExport';

    toolbar.appendChild(addBtn); toolbar.appendChild(importBtn); toolbar.appendChild(exportBtn);
    // insert after header
    header.parentNode.insertBefore(toolbar, main);

    // hidden file input
    const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = 'text/csv'; fileInput.style.display = 'none'; fileInput.id = 'injectedFile'; document.body.appendChild(fileInput);

    // modal container
    const modal = document.createElement('div'); modal.id = 'injectedModal'; modal.className = 'modal'; modal.style.display = 'none';
    modal.innerHTML = `
      <div class="sheet">
        <div class="sheet-header"><h3 id="injectedModalTitle">${i18n('newproduct')}</h3><button id="injectedClose" class="btn ghost">${i18n('cancel')}</button></div>
        <form id="injectedForm" class="form-sheet">
          <label>${i18n('name')}<input id="in_name" required></label>
          <label>${i18n('qty')}<input id="in_qty" type="number" min="0" value="0"></label>
          <label>${i18n('price')}<input id="in_price" type="number" min="0" step="0.01" value="0"></label>
          <label>Category<input id="in_category"></label>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button type="submit" class="btn">${i18n('save')}</button><button type="button" id="in_cancel" class="btn ghost">${i18n('cancel')}</button></div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // wire events
    addBtn.addEventListener('click', openInjectedModal);
    document.getElementById('injectedClose').addEventListener('click', closeInjectedModal);
    document.getElementById('in_cancel').addEventListener('click', closeInjectedModal);
    document.getElementById('injectedForm').addEventListener('submit', onInjectedFormSubmit);
    importBtn.addEventListener('click', ()=>fileInput.click());
    fileInput.addEventListener('change', onInjectedFileChange);
    exportBtn.addEventListener('click', exportCSV);
  }

  /* ---------- i18n ---------- */
  function i18n(key) {
    const lang = (langSel && langSel.value) || detectLanguage();
    return (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
  }

  function translateUI() {
    // translate injected controls and table headers
    const titleEl = document.getElementById('title-products'); if (titleEl) titleEl.textContent = i18n('products');
    const thName = document.getElementById('th-name'); if (thName) thName.textContent = i18n('name');
    const thQty = document.getElementById('th-qty'); if (thQty) thQty.textContent = i18n('qty');
    const thPrice = document.getElementById('th-price'); if (thPrice) thPrice.textContent = i18n('price');
    // placeholders
    if (qEl) qEl.placeholder = i18n('search');
    // injected buttons if present
    const bAdd = document.getElementById('injectedAdd'); if (bAdd) bAdd.textContent = i18n('add');
    const bImport = document.getElementById('injectedImport'); if (bImport) bImport.textContent = i18n('import');
    const bExport = document.getElementById('injectedExport'); if (bExport) bExport.textContent = i18n('export');
    // modal
    const modalTitle = document.getElementById('injectedModalTitle'); if (modalTitle) modalTitle.textContent = i18n('newproduct');
  }

  /* ---------- IndexedDB (light wrapper) ---------- */
  const DB_NAME = 'atlasstock-v1'; const STORE = 'products'; const LOG = 'log';
  function openDB() { return new Promise((res, rej)=>{ const r = indexedDB.open(DB_NAME,1); r.onupgradeneeded = e => { const db = e.target.result; if(!db.objectStoreNames.contains(STORE)){ const os = db.createObjectStore(STORE,{ keyPath: 'id' }); os.createIndex('name','name'); os.createIndex('sku','sku'); os.createIndex('category','category'); os.createIndex('updated','updated'); } if(!db.objectStoreNames.contains(LOG)) db.createObjectStore(LOG,{autoIncrement:true}); }; r.onsuccess = ()=>res(r.result); r.onerror = ()=>rej(r.error); }); }

  function withTx(names, mode, fn) { return openDB().then(db => new Promise((res, rej)=>{ try{ const tx = db.transaction(names, mode); const stores = {}; names.forEach(n=>stores[n]=tx.objectStore(n)); tx.oncomplete = ()=>res(true); tx.onerror = ()=>rej(tx.error); fn(stores, tx); } catch(e) { rej(e); } })); }

  function addProductDB(p) { p.id = p.id || (crypto.randomUUID ? crypto.randomUUID() : ('id-'+Math.random().toString(36).slice(2,9))); p.updated = Date.now(); return withTx([STORE],'readwrite', s=>s[STORE].put(p)).then(()=>{ logEvent('Added '+(p.name||p.id)); pushUndo({type:'add', item: p}); renderAll(); }); }
  function updateProductDB(id, patch) { return getProduct(id).then(existing=>{ if(!existing) return; const next = Object.assign({}, existing, patch); next.updated = Date.now(); return withTx([STORE],'readwrite', s=>s[STORE].put(next)).then(()=>{ logEvent('Updated '+next.name); pushUndo({type:'update', before: existing, after: next}); renderAll(); }); }); }
  function deleteProductDB(id) { return getProduct(id).then(before=>{ if(!before) return; return withTx([STORE],'readwrite', s=>s[STORE].delete(id)).then(()=>{ logEvent('Deleted '+before.name); pushUndo({type:'delete', item: before}); renderAll(); }); }); }
  function getAll() { return openDB().then(db => new Promise((res, rej)=>{ const tx = db.transaction(STORE,'readonly'); const out = []; const cur = tx.objectStore(STORE).openCursor(); cur.onsuccess = e => { const c = e.target.result; if(c){ out.push(c.value); c.continue(); } }; tx.oncomplete = ()=>res(out); tx.onerror = ()=>rej(tx.error); })); }
  function getProduct(id) { return openDB().then(db => new Promise((res, rej)=>{ const tx = db.transaction(STORE,'readonly'); const req = tx.objectStore(STORE).get(id); req.onsuccess = ()=>res(req.result); req.onerror = ()=>rej(req.error); })); }

  function clearDB() { return withTx([STORE, LOG], 'readwrite', s => { s[STORE].clear(); s[LOG].clear(); }); }
  function logEvent(text){ withTx([LOG],'readwrite', s=>s[LOG].add({t:Date.now(), text})).catch(()=>{}); renderActivity(); }
  function getLog(){ return openDB().then(db => new Promise((res, rej)=>{ const tx = db.transaction(LOG,'readonly'); const out=[]; const cur = tx.objectStore(LOG).openCursor(null, 'prev'); cur.onsuccess = e => { const c = e.target.result; if(c){ out.push(c.value); c.continue(); } }; tx.oncomplete = ()=>res(out); tx.onerror = ()=>rej(tx.error); })); }

  /* ---------- Undo / Redo ---------- */
  const undoStack = []; const redoStack = [];
  function pushUndo(op){ undoStack.push(op); if(undoStack.length>200) undoStack.shift(); redoStack.length = 0; updateUndoUI(); }
  function updateUndoUI(){ const u=document.getElementById('undoBtn'); const r=document.getElementById('redoBtn'); if(u) u.disabled = undoStack.length===0; if(r) r.disabled = redoStack.length===0; }
  function doUndo(){ const op = undoStack.pop(); if(!op) return Promise.resolve(); if(op.type==='add') return deleteProductDB(op.item.id).then(()=>{ redoStack.push(op); updateUndoUI(); }); if(op.type==='delete') return addProductDB(op.item).then(()=>{ redoStack.push(op); updateUndoUI(); }); if(op.type==='update') return updateProductDB(op.before.id, op.before).then(()=>{ redoStack.push(op); updateUndoUI(); }); return Promise.resolve(); }
  function doRedo(){ const op = redoStack.pop(); if(!op) return Promise.resolve(); if(op.type==='add') return addProductDB(op.item).then(()=>{ undoStack.push(op); updateUndoUI(); }); if(op.type==='delete') return deleteProductDB(op.item.id).then(()=>{ undoStack.push(op); updateUndoUI(); }); if(op.type==='update') return updateProductDB(op.after.id, op.after).then(()=>{ undoStack.push(op); updateUndoUI(); }); return Promise.resolve(); }

  /* ---------- Rendering ---------- */
  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  async function renderAll(){ const items = await getAll(); const q = (qEl && qEl.value || '').trim().toLowerCase(); let list = items.filter(i=>{ if(!q) return true; return (i.name||'').toLowerCase().includes(q) || (i.sku||'').toLowerCase().includes(q) || (i.category||'').toLowerCase().includes(q); }); list.sort((a,b)=> (a.name||'').localeCompare(b.name||'')); // summary
    const totalCountEl = document.getElementById('totalCount'); const lowCountEl = document.getElementById('lowCount'); const stockValueEl = document.getElementById('stockValue'); const skuCountEl = document.getElementById('skuCount');
    if(totalCountEl) totalCountEl.textContent = list.length; if(lowCountEl) lowCountEl.textContent = list.filter(i=>Number(i.qty)<=Number(i.threshold||0)).length; if(stockValueEl) stockValueEl.textContent = list.reduce((s,i)=>s + (Number(i.qty)||0)*(Number(i.price)||0),0).toFixed(2) + ' ' + (curSel?curSel.value:''); if(skuCountEl) skuCountEl.textContent = new Set(list.map(i=>i.sku||i.id)).size;

    // populate table in index.html's structure
    if(productListTbody){ productListTbody.innerHTML = ''; list.forEach((it, idx)=>{ const tr = document.createElement('tr'); const tdName = document.createElement('td'); tdName.textContent = it.name || ''; const tdQty = document.createElement('td'); tdQty.textContent = Number(it.qty)||0; const tdPrice = document.createElement('td'); tdPrice.textContent = (Number(it.price)||0).toFixed(2) + ' ' + (curSel?curSel.value:''); tr.appendChild(tdName); tr.appendChild(tdQty); tr.appendChild(tdPrice);
        // add actions cell
        const tdActions = document.createElement('td'); const edit = document.createElement('button'); edit.textContent = i18n('edit'); edit.className = 'btn ghost'; edit.style.marginRight = '6px'; edit.addEventListener('click', ()=>openInjectedModalWith(it)); const del = document.createElement('button'); del.textContent = i18n('del'); del.className = 'btn ghost'; del.addEventListener('click', ()=>{ if(confirm(i18n('del')+'?')) deleteProductDB(it.id); }); tdActions.appendChild(edit); tdActions.appendChild(del); tr.appendChild(tdActions);
        productListTbody.appendChild(tr);
    }); }
    renderActivity();
  }

  async function renderActivity(){ const logs = await getLog(); const el = document.getElementById('activity'); if(!el) return; el.innerHTML = ''; logs.slice(0,60).forEach(l=>{ const d = document.createElement('div'); d.className = 'muted'; d.textContent = new Date(l.t).toLocaleString() + ' — ' + l.text; el.appendChild(d); }); }

  /* ---------- Injected modal actions ---------- */
  function openInjectedModal(){ const m = document.getElementById('injectedModal'); if(!m) return; document.getElementById('injectedModalTitle').textContent = i18n('newproduct'); m.style.display = 'block'; m.classList.add('open'); document.getElementById('in_name').focus(); editingInjected = null; }
  function openInjectedModalWith(item){ const m = document.getElementById('injectedModal'); if(!m) return; editingInjected = item.id; document.getElementById('injectedModalTitle').textContent = i18n('edit'); document.getElementById('in_name').value = item.name||''; document.getElementById('in_qty').value = item.qty||0; document.getElementById('in_price').value = item.price||0; document.getElementById('in_category').value = item.category||''; m.style.display = 'block'; m.classList.add('open'); document.getElementById('in_name').focus(); }
  function closeInjectedModal(){ const m = document.getElementById('injectedModal'); if(!m) return; m.style.display = 'none'; m.classList.remove('open'); editingInjected = null; }

  async function onInjectedFormSubmit(e){ e.preventDefault(); const p = { name: document.getElementById('in_name').value.trim(), qty: Number(document.getElementById('in_qty').value)||0, price: Number(document.getElementById('in_price').value)||0, category: document.getElementById('in_category').value.trim() || '' };
    if(editingInjected) { await updateProductDB(editingInjected, p); } else { await addProductDB(p); }
    closeInjectedModal(); }

  async function onInjectedFileChange(e){ const f = e.target.files[0]; if(!f) return; const text = await f.text(); const rows = text.split(/\r?\n/).filter(Boolean); if(rows.length<2){ alert('No data'); return; } const headers = rows[0].split(',').map(h=>h.trim().toLowerCase()); for(let i=1;i<rows.length;i++){ const cols = rows[i].split(','); const obj = {}; headers.forEach((h,idx)=>obj[h]=cols[idx]); const p = { name: obj.name||obj.title||'Unknown', sku: obj.sku||'', category: obj.category||'', qty: Number(obj.qty||0), price: Number(obj.price||0), threshold: Number(obj.threshold||5) }; await addProductDB(p); } e.target.value=''; alert(i18n('import')+' complete'); renderAll(); }

  function exportCSV(){ getAll().then(items=>{ const headers=['id','name','sku','category','qty','price','threshold','updated']; const csv = [headers.join(',')].concat(items.map(i=> headers.map(h=>'"'+String(i[h]||'').replace(/"/g,'""')+'"').join(',') )).join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'atlasstock-'+(new Date().toISOString().slice(0,10))+'.csv'; a.click(); URL.revokeObjectURL(url); }); }

  /* ---------- Keyboard shortcuts ---------- */
  document.addEventListener('keydown', function(e){ if(e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.shiftKey){ e.preventDefault(); openInjectedModal(); } if(e.key === '/' && document.activeElement.tagName !== 'INPUT'){ e.preventDefault(); if(qEl) qEl.focus(); } if((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)){ e.preventDefault(); doUndo(); } if((e.key === 'y' || e.key === 'Y') && (e.ctrlKey || e.metaKey)){ e.preventDefault(); doRedo(); } });

  /* ---------- language & currency population & auto-detect ---------- */
  function populateLanguages(){ if(!langSel) return; langSel.innerHTML = ''; Object.keys(translations).forEach(l=>{ const o = document.createElement('option'); o.value = l; o.textContent = l === 'en' ? 'English' : (l==='fr' ? 'Français' : 'العربية'); langSel.appendChild(o); }); }
  function populateCurrencies(){ if(!curSel) return; curSel.innerHTML = ''; currencies.forEach(c=>{ const o = document.createElement('option'); o.value = c.code; o.textContent = c.code + ' — ' + c.name; curSel.appendChild(o); }); }

  function detectLanguage(){ try{ const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase(); const code = nav.split('-')[0]; return translations[code] ? code : 'en'; } catch(e){ return 'en'; } }
  const regionCurrencyMap = { 'dz':'DZD','ci':'XOF','fr':'EUR','us':'USD','gb':'GBP','ma':'MAD','tn':'TND','sa':'SAR','ae':'AED' };
  function detectCurrency(){ try{ const nav = (navigator.language || 'en').toLowerCase(); const parts = nav.split('-'); const region = parts[1] ? parts[1].toLowerCase() : ''; if(region && regionCurrencyMap[region]) return regionCurrencyMap[region]; const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; if(tz){ const country = tz.split('/')[0].toLowerCase(); if(regionCurrencyMap[country]) return regionCurrencyMap[country]; } } catch(e){} return 'USD'; }

  /* ---------- init & seed ---------- */
  let editingInjected = null;
  (async function init(){ // inject controls
    injectControls(); populateLanguages(); populateCurrencies(); const lang = detectLanguage(); if(langSel) langSel.value = lang; const cur = detectCurrency(); if(curSel) curSel.value = cur; translateUI(); // listeners
    if(langSel) langSel.addEventListener('change', ()=>{ translateUI(); document.documentElement.lang = langSel.value; document.body.dir = (langSel.value === 'ar') ? 'rtl' : 'ltr'; renderAll(); });
    if(curSel) curSel.addEventListener('change', renderAll);
    // undo/redo/clear buttons wiring (optional if present in DOM)
    const ubtn = document.getElementById('undoBtn'); if(ubtn) ubtn.addEventListener('click', doUndo); const rbtn = document.getElementById('redoBtn'); if(rbtn) rbtn.addEventListener('click', doRedo); const cbtn = document.getElementById('clearBtn'); if(cbtn) cbtn.addEventListener('click', ()=>{ if(confirm('Clear ALL local data?')){ clearDB().then(()=>{ logEvent('Database cleared'); renderAll(); }); } });
    // seed if DB empty
    const items = await getAll(); if(items.length === 0){ await addProductDB({ name:'Apple iPhone 15 Pro', sku:'IP15P-128', category:'Phones', qty:40, price:999.99, threshold:5 }); await addProductDB({ name:'Samsung Galaxy A35', sku:'SGA35-64', category:'Phones', qty:120, price:249.5, threshold:10 }); await addProductDB({ name:'Logitech Mouse M325', sku:'LOG-M325', category:'Accessories', qty:240, price:19.99, threshold:20 }); }
    renderAll(); updateUndoUI(); renderActivity();
  })();

  // expose small debug on window
  window.AtlasStock = { renderAll, addProductDB, updateProductDB, deleteProductDB, getAll };

})();
