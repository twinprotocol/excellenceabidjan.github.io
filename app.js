/* app.js - FIXED: wait DOMContentLoaded, defensive selectors, debug logs */
(() => {
  'use strict';

  // --- small helpers ---
  const $ = id => document.getElementById(id);
  const q = s => document.querySelector(s);
  const on = (el, ev, fn) => { if (!el) return console.warn('missing element for event', ev); el.addEventListener(ev, fn); };

  // --- translations & currencies (kept small) ---
  const translations = {
    en:{title:'AtlasStock', add:'Add', edit:'Edit', del:'Delete', import:'Import', export:'Export', total:'Total', low:'Low', value:'Value', activity:'Activity', name:'Name', sku:'SKU', category:'Category', qty:'Qty', price:'Price', save:'Save', cancel:'Cancel', newproduct:'New product', search:'Search...', sell:'Sell', sellQty:'Quantity to sell'},
    fr:{title:'AtlasStock', add:'Ajouter', edit:'Éditer', del:'Supprimer', import:'Importer', export:'Exporter', total:'Total', low:'Faible', value:'Valeur', activity:'Journal', name:'Nom', sku:'SKU', category:'Catégorie', qty:'Quantité', price:'Prix', save:'Enregistrer', cancel:'Annuler', newproduct:'Produit', search:'Rechercher...', sell:'Vendre', sellQty:'Quantité à vendre'},
    ar:{title:'أطلس ستوك', add:'إضافة', edit:'تعديل', del:'حذف', import:'استيراد', export:'تصدير', total:'الإجمالي', low:'منخفض', value:'القيمة', activity:'النشاط', name:'الاسم', sku:'رمز', category:'الفئة', qty:'الكمية', price:'السعر', save:'حفظ', cancel:'إلغاء', newproduct:'منتج جديد', search:'بحث...', sell:'بيع', sellQty:'كمية للبيع'}
  };
  const currencies = [{code:'USD',name:'US Dollar'},{code:'EUR',name:'Euro'},{code:'DZD',name:'Algerian Dinar'},{code:'XOF',name:'CFA Franc'}];

  // --- basic DB helpers (IndexedDB minimal wrapper) ---
  const DB_NAME = 'atlasstock-v1', STORE = 'products', LOG = 'log';
  function openDB(){
    return new Promise((res,rej)=>{
      if(!window.indexedDB) return res(null);
      const req = indexedDB.open(DB_NAME,1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains(STORE)){
          const s = db.createObjectStore(STORE,{keyPath:'id'});
          s.createIndex('name','name'); s.createIndex('sku','sku');
        }
        if(!db.objectStoreNames.contains(LOG)) db.createObjectStore(LOG,{autoIncrement:true});
      };
      req.onsuccess = ()=>res(req.result);
      req.onerror = ()=>rej(req.error);
    });
  }
  async function safeTx(names, mode, fn){
    try {
      const db = await openDB();
      if(!db) throw new Error('no-idb');
      return new Promise((res,rej)=>{
        try{
          const tx = db.transaction(names, mode);
          const stores = {}; names.forEach(n=>stores[n]=tx.objectStore(n));
          tx.oncomplete = ()=>res(true);
          tx.onerror = ()=>rej(tx.error);
          fn(stores, tx);
        } catch(e){ rej(e); }
      });
    } catch(e){
      // fail silently to fallback to localStorage approaches in other functions
      console.warn('IndexedDB not available or error:', e);
      throw e;
    }
  }

  // fallback localStorage simple
  const ls = {
    get(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch{return null} },
    set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){ console.warn('ls.set failed',e); } }
  };

  // CRUD using IDB fallback to LS
  async function addProduct(p){
    p.id = p.id || (crypto?.randomUUID ? crypto.randomUUID() : 'id-'+Math.random().toString(36).slice(2,9));
    p.updated = Date.now();
    try {
      await safeTx([STORE], 'readwrite', s => s[STORE].put(p));
    } catch (e) {
      const arr = ls.get('products') || []; arr.push(p); ls.set('products', arr);
    }
    await renderAll();
  }
  async function updateProduct(id, patch){
    try {
      const db = await openDB();
      if(db){
        const tx = db.transaction(STORE,'readwrite'); const store = tx.objectStore(STORE);
        const req = store.get(id);
        req.onsuccess = async () => { const existing = req.result; if(!existing) return; const next = Object.assign({}, existing, patch, {updated:Date.now()}); store.put(next); await renderAll(); };
      } else throw new Error('no-idb');
    } catch {
      let arr = ls.get('products') || []; arr = arr.map(a => a.id===id ? Object.assign({}, a, patch, {updated:Date.now()}) : a); ls.set('products', arr); await renderAll();
    }
  }
  async function deleteProduct(id){
    try { await safeTx([STORE],'readwrite', s => s[STORE].delete(id)); } catch { let arr = ls.get('products')||[]; arr=arr.filter(a=>a.id!==id); ls.set('products',arr); }
    await renderAll();
  }
  async function getAll(){
    try {
      const db = await openDB();
      if(!db) throw new Error('no-idb');
      return new Promise((res,rej)=>{
        const out=[]; const cur = db.transaction(STORE,'readonly').objectStore(STORE).openCursor();
        cur.onsuccess = e => { const c = e.target.result; if(c){ out.push(c.value); c.continue(); } };
        cur.onerror = ()=>rej(cur.error);
        cur.transaction.oncomplete = ()=>res(out);
      });
    } catch {
      return ls.get('products') || [];
    }
  }
  async function getProduct(id){
    try {
      const db = await openDB();
      if(!db) throw new Error('no-idb');
      return new Promise((res,rej)=>{
        const req = db.transaction(STORE,'readonly').objectStore(STORE).get(id);
        req.onsuccess = ()=>res(req.result);
        req.onerror = ()=>rej(req.error);
      });
    } catch {
      return (ls.get('products')||[]).find(p=>p.id===id) || null;
    }
  }

  // --- UI wiring after DOM ready ---
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // cache references (defensively)
      const menuBtns = Array.from(document.querySelectorAll('.menu-btn'));
      const bottomBtns = Array.from(document.querySelectorAll('.bnav'));
      const views = Array.from(document.querySelectorAll('.view'));
      const topTitle = $('topTitle');
      const sidebar = document.querySelector('.sidebar');

      // utility functions
      const setView = (name) => {
        views.forEach(v => v.classList.toggle('hidden', v.dataset.view !== name));
        menuBtns.forEach(b => b.classList.toggle('active', b.dataset.view === name));
        bottomBtns.forEach(b => b.classList.toggle('active', b.dataset.view === name));
        if(topTitle) topTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        if(window.innerWidth <= 900 && sidebar) sidebar.classList.remove('open');
      };

      // attach menu events
      menuBtns.forEach(b => on(b, 'click', () => setView(b.dataset.view)));
      bottomBtns.forEach(b => on(b, 'click', () => setView(b.dataset.view)));

      // sidebar toggle
      const menuToggle = $('menuToggle');
      if(menuToggle) on(menuToggle, 'click', () => { if(sidebar) sidebar.classList.toggle('open'); });

      // search input
      const qEl = $('q');
      if(qEl) qEl.addEventListener('input', debounce(renderAll, 200));

      // buttons: defensive attachments
      on($('btn-add'), 'click', ()=> openProductModal(null));
      on($('btn-add-side'), 'click', ()=> { setView('inventory'); openProductModal(null); });
      on($('btn-import'), 'click', ()=> { const f = $('fileInput'); if(f) f.click(); });
      on($('btn-export'), 'click', async ()=> { const items = await getAll(); const csv = toCSV(items); download(csv, 'text/csv', 'atlasstock.csv'); });
      on($('btn-backup'), 'click', async ()=> { const items = await getAll(); download(JSON.stringify(items,null,2),'application/json','atlas-backup.json'); });
      on($('btn-reset'), 'click', ()=> { if(confirm('Reset all local data?')) { ls.set('products',[]); renderAll(); } });
      on($('btn-scan'), 'click', ()=> { const scanBtn = $('btn-scan'); if(!scanBtn) return; // open scanner modal if exists
        const scanModal = $('scanModal'); if(scanModal) scanModal.classList.add('open'); /* scanner handled elsewhere */ });

      // product modal handlers
      const productForm = $('productForm');
      if(productForm){
        let editingId = null;
        // expose helper to open modal
        window.__openProductModal = async function(p){
          editingId = p ? p.id : null;
          $('modalTitle').textContent = p ? (translations[getSelectedLang()]?.edit || 'Edit') : (translations[getSelectedLang()]?.newproduct || 'New product');
          $('p_name').value = p ? p.name : '';
          $('p_sku').value = p ? p.sku : '';
          $('p_category').value = p ? p.category : '';
          $('p_qty').value = p ? p.qty : 0;
          $('p_price').value = p ? p.price : 0;
          $('p_threshold').value = p ? (p.threshold||5) : 5;
          const modal = $('modal'); if(modal){ modal.classList.add('open'); modal.style.display='flex'; modal.setAttribute('aria-hidden','false'); }
        };

        productForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const p = {
            name: $('p_name').value.trim(),
            sku: $('p_sku').value.trim(),
            category: $('p_category').value.trim(),
            qty: Number($('p_qty').value) || 0,
            price: Number($('p_price').value) || 0,
            threshold: Number($('p_threshold').value) || 5
          };
          if(!p.name){ alert('Name required'); return; }
          if(editingId) await updateProduct(editingId, p); else await addProduct(p);
          const modalEl = $('modal'); if(modalEl){ modalEl.classList.remove('open'); modalEl.style.display='none'; modalEl.setAttribute('aria-hidden','true'); }
        });
      }

      // wire modal close buttons
      on($('modalClose'), 'click', ()=> { const m=$('modal'); if(m){ m.classList.remove('open'); m.style.display='none'; } });
      on($('modalCancel'), 'click', ()=> { const m=$('modal'); if(m){ m.classList.remove('open'); m.style.display='none'; } });

      // file input import
      const fileInput = $('fileInput');
      if(fileInput){
        fileInput.addEventListener('change', async (ev) => {
          const f = ev.target.files[0];
          if(!f) return;
          const text = await f.text();
          if(f.name.endsWith('.json')){
            try { const data = JSON.parse(text); if(Array.isArray(data)){ for(const p of data) await addProduct(p); alert('Import JSON OK'); } }
            catch(e){ alert('JSON invalid'); console.error(e); }
          } else {
            // naive CSV
            const rows = text.split(/\r?\n/).filter(Boolean);
            if(rows.length < 2){ alert('CSV has no data'); return; }
            const headers = rows[0].split(',').map(h=>h.trim().toLowerCase());
            for(let i=1;i<rows.length;i++){
              const cols = rows[i].split(',');
              const obj = {}; headers.forEach((h,idx)=>obj[h]=cols[idx]);
              const p = { name: obj.name||obj.title||'Unknown', sku: obj.sku||'', category: obj.category||'', qty: Number(obj.qty||0), price: Number(obj.price||0), threshold: Number(obj.threshold||5) };
              await addProduct(p);
            }
            alert('Import CSV OK');
          }
          ev.target.value = '';
          await renderAll();
        });
      }

      // bottom nav and responsive startup view
      setView('dashboard');

      // populate selects
      populateLangCur();

      // attach language/currency change
      on($('language-selector'), 'change', ()=>{ translateAll(); renderAll(); });
      on($('currency-selector'), 'change', ()=> renderAll());

      // initial seed + render
      (async () => {
        const items = await getAll();
        if(!items || items.length===0){
          await addProduct({ name:'iPhone 15 Pro', sku:'IP15P', category:'Phones', qty:30, price:999.99, threshold:5 });
          await addProduct({ name:'Galaxy A35', sku:'SGA35', category:'Phones', qty:120, price:249.5, threshold:10 });
        }
        await renderAll();
      })();

      console.log('app.js: initialized successfully');
    } catch (err) {
      console.error('Initialization error:', err);
      alert('Erreur lors de l\'initialisation — voir la console (F12).');
    }
  });

  // --- utility functions used above ---
  function debounce(fn, wait=150){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }
  function toCSV(items){
    const headers = ['id','name','sku','category','qty','price','threshold','updated'];
    return [headers.join(',')].concat(items.map(i => headers.map(h => `"${String(i[h]||'').replace(/"/g,'"\"')}"`).join(','))).join('\n');
  }
  function download(content, type, filename){
    const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }

  // UI helpers: populate language & currency, i18n
  function populateLangCur(){
    try {
      const langSel = $('language-selector'), curSel = $('currency-selector');
      if(langSel && langSel.options.length === 0){
        Object.keys(translations).forEach(l => { const o = document.createElement('option'); o.value = l; o.textContent = l==='en'?'English':(l==='fr'?'Français':'العربية'); langSel.appendChild(o); });
        langSel.value = detectLang();
      }
      if(curSel && curSel.options.length === 0){
        currencies.forEach(c => { const o = document.createElement('option'); o.value = c.code; o.textContent = `${c.code} — ${c.name}`; curSel.appendChild(o); });
        curSel.value = detectCurrency();
      }
      translateAll();
    } catch(e){ console.warn('populateLangCur error', e); }
  }
  function getSelectedLang(){ const v = $('language-selector') ? $('language-selector').value : detectLang(); return v || 'en'; }
  function detectLang(){ try{ const nav = (navigator.language||'en').toLowerCase(); const code = nav.split('-')[0]; return translations[code] ? code : 'en'; } catch(e){ return 'en'; } }
  function detectCurrency(){ try{ const nav = (navigator.language||'en').toLowerCase(); const parts = nav.split('-'); const region = parts[1] ? parts[1].toLowerCase() : ''; const map = { dz:'DZD', ci:'XOF', fr:'EUR', us:'USD', gb:'GBP', ma:'MAD', tn:'TND', sa:'SAR', ae:'AED' }; if(region && map[region]) return map[region]; return 'USD'; } catch { return 'USD'; } }
  function translateAll(){
    try {
      const lang = getSelectedLang();
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(key && translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
      });
      // title/sub etc.
      const title = $('app-title'); if(title) title.textContent = translations[lang]?.title || 'AtlasStock';
      document.documentElement.lang = lang;
      document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    } catch(e){ console.warn('translateAll error', e); }
  }

  // --- renderAll used in init, minimal to ensure UI actions respond ---
  async function renderAll(){
    try {
      const items = await getAll();
      const qv = ($('q') ? $('q').value : '').trim().toLowerCase();
      const list = (items||[]).filter(i => {
        if(!qv) return true;
        return (i.name||'').toLowerCase().includes(qv) || (i.sku||'').toLowerCase().includes(qv) || (i.category||'').toLowerCase().includes(qv);
      }).sort((a,b)=> (a.name||'').localeCompare(b.name||''));
      // totals
      if($('totalCount')) $('totalCount').textContent = list.length;
      if($('lowCount')) $('lowCount').textContent = list.filter(i=>Number(i.qty)<=Number(i.threshold||0)).length;
      if($('stockValue')) $('stockValue').textContent = formatMoney(list.reduce((s,i)=>s + (Number(i.qty)||0)*(Number(i.price)||0), 0));
      // table
      const tbody = $('tbody');
      if(tbody){
        tbody.innerHTML = '';
        list.forEach((it, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${idx+1}</td><td>${escapeHtml(it.name)}</td><td>${escapeHtml(it.sku||'')}</td><td>${escapeHtml(it.category||'')}</td><td class="${Number(it.qty)<=Number(it.threshold||0)?'low':''}">${Number(it.qty)||0}</td><td>${formatMoney(Number(it.price)||0)}</td><td>${it.updated?new Date(it.updated).toLocaleString():''}</td><td></td>`;
          const actionsTd = tr.querySelector('td:last-child');
          const edit = document.createElement('button'); edit.className='btn ghost'; edit.textContent = 'Edit'; edit.onclick = ()=> window.__openProductModal ? window.__openProductModal(it) : null;
          const sell = document.createElement('button'); sell.className='btn ghost'; sell.textContent = 'Sell'; sell.onclick = async ()=>{ /* quick sell: decrement 1 */ const prod = await getProduct(it.id); if(prod) updateProduct(it.id, { qty: Math.max(0, (Number(prod.qty)||0)-1) }); };
          const del = document.createElement('button'); del.className='btn ghost'; del.textContent = 'Delete'; del.onclick = ()=> { if(confirm('Delete?')) deleteProduct(it.id); };
          actionsTd.appendChild(edit); actionsTd.appendChild(sell); actionsTd.appendChild(del);
          tbody.appendChild(tr);
        });
      }
    } catch (e) { console.error('renderAll error', e); }
  }

  // small helpers
  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function formatMoney(n){ const cur = ($('currency-selector') ? $('currency-selector').value : 'USD') || 'USD'; try{ return new Intl.NumberFormat(undefined, { style:'currency', currency: cur }).format(Number(n||0)); }catch{ return Number(n||0).toFixed(2) + ' ' + cur; } }

})();
