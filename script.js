/* Excellence Abidjan - front-end replica
   - Mock login -> localStorage-based app
   - Products CRUD (with image DataURL)
   - Stock entries & sales logs (Entrée/Vente)
   - Clients & credit tracking
   - Reviews/messages
   - Export CSV / Excel (SheetJS)
   - WhatsApp share & print reports
   - Multilingual labels (basic)
*/
(() => {
  // helpers
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const uid = () => 'id'+Math.random().toString(36).slice(2,9);
  const todayISO = ()=> new Date().toISOString().slice(0,10);
  const fmtCFA = n => (Number(n)||0).toLocaleString() + ' CFA';
  const readFileAsDataURL = file => new Promise((res,reject)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=reject; r.readAsDataURL(file); });

  // storage keys
  const LS_PRODUCTS = 'ex_prod_v1';
  const LS_LOG = 'ex_log_v1';
  const LS_CLIENTS = 'ex_clients_v1';
  const LS_REVIEWS = 'ex_reviews_v1';

  // state
  let products = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
  let log = JSON.parse(localStorage.getItem(LS_LOG) || '[]'); // {id,date,productId,name,type,qty,price,client,paid}
  let clients = JSON.parse(localStorage.getItem(LS_CLIENTS) || '[]');
  let reviews = JSON.parse(localStorage.getItem(LS_REVIEWS) || '[]');

  // initial sample
  if(!products.length){
    products = [
      { id: uid(), name:'Eau minérale 1.5L', category:'Boissons', supplier:'Fournisseur A', price:300, cost:150, stock:120, discount:0, image:'' },
      { id: uid(), name:'Pain baguette', category:'Boulangerie', supplier:'Boulangerie X', price:200, cost:90, stock:45, discount:0, image:'' }
    ];
    persist();
  }

  // UI refs
  const loginScreen = $('#loginScreen'), appScreen = $('#app');
  const loginForm = $('#loginForm'), loginBtn = $('#loginBtn'), logoutBtn = $('#logout');
  const langSelect = $('#langSelect');

  const navBtns = $$('.nav-btn'), panels = $$('.panel');
  const prodSearch = $('#prodSearch'), prodCategoryFilter = $('#prodCategoryFilter'), productsGrid = $('#productsGrid'), btnNewProduct = $('#btnNewProduct');
  const pForm = $('#productForm'), pName = $('#p_name'), pCat = $('#p_category'), pSupplier = $('#p_supplier'), pPrice = $('#p_price'), pCost = $('#p_cost'), pStock = $('#p_stock'), pDiscount = $('#p_discount'), pImage = $('#p_image'), btnSaveProduct = $('#saveProduct'), btnCancel = $('#cancelEdit');
  const moveProduct = $('#moveProduct'), moveQty = $('#moveQty'), moveType = $('#moveType'), movePrice = $('#movePrice'), moveClient = $('#moveClient'), moveCredit = $('#moveCredit'), applyMove = $('#applyMove'), applySell = $('#applySell');
  const logTableBody = $('#logTable tbody'), reportDate = $('#reportDate'), filterLogBtn = $('#filterLog'), reportTotal = $('#reportTotal'), printLogBtn = $('#printLog'), shareWABtn = $('#shareWA');
  const clientsTableBody = $('#clientsTable tbody'), addClientBtn = $('#addClient'), clientName = $('#clientName'), clientPhone = $('#clientPhone');
  const reviewText = $('#reviewText'), saveReviewBtn = $('#saveReview'), reviewsTableBody = $('#reviewsTable tbody'), clearReviewsBtn = $('#clearReviews');
  const exportProductsCSV = $('#exportProductsCSV'), exportLogCSV = $('#exportLogCSV'), exportXLSX = $('#exportXLSX'), importFile = $('#importFile');

  // persist
  function persist(){
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
    localStorage.setItem(LS_LOG, JSON.stringify(log));
    localStorage.setItem(LS_CLIENTS, JSON.stringify(clients));
    localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews));
  }

  // simple login (mock)
  loginForm.addEventListener('submit', e=>{
    e.preventDefault();
    // simple mock: accept any credentials
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    renderAll();
  });
  logoutBtn.addEventListener('click', ()=> {
    appScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
  });

  // nav
  navBtns.forEach(btn => btn.addEventListener('click', ()=>{
    navBtns.forEach(b=>b.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.dataset.panel;
    $('#' + id).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }));

  // product render
  function populateCategoryFilter(){
    const cats = Array.from(new Set(products.map(p=>p.category).filter(Boolean)));
    prodCategoryFilter.innerHTML = '<option value="">Toutes catégories</option>';
    cats.forEach(c=> prodCategoryFilter.appendChild(Object.assign(document.createElement('option'), { value:c, textContent:c })));
  }

  async function renderProducts(){
    populateCategoryFilter();
    productsGrid.innerHTML = '';
    const q = (prodSearch.value||'').toLowerCase();
    const cat = prodCategoryFilter.value;
    products.filter(p=>{
      if(q && !(p.name.toLowerCase().includes(q) || (p.supplier||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q))) return false;
      if(cat && p.category !== cat) return false;
      return true;
    }).forEach(p=>{
      const el = document.createElement('div'); el.className='product card';
      el.innerHTML = `
        ${p.image ? `<img src="${p.image}" alt="">` : `<div style="height:140px;background:#f3f7fb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9aa8c7">No image</div>`}
        <h4>${escapeHtml(p.name)}</h4>
        <div class="muted">${escapeHtml(p.category||'')}</div>
        <div>Fournisseur: ${escapeHtml(p.supplier||'')}</div>
        <div>Prix: ${Number(p.price).toLocaleString()} CFA</div>
        <div>Stock: ${p.stock}</div>
        <div class="card-actions">
          <button class="edit" data-id="${p.id}">✏️</button>
          <button class="del" data-id="${p.id}">🗑️</button>
        </div>`;
      productsGrid.appendChild(el);
    });
    // attach events
    $$('.product .edit').forEach(b => b.onclick = ()=> loadProductToForm(b.dataset.id));
    $$('.product .del').forEach(b => b.onclick = ()=> { if(confirm('Supprimer produit ?')) deleteProduct(b.dataset.id); });
    populateMoveProduct();
    updateDashboard();
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // product form save / edit
  let editingId = null;
  btnSaveProduct.addEventListener('click', async (e) => {
    e.preventDefault();
    const name = pName.value.trim(); if(!name) return alert('Nom requis');
    const obj = {
      id: editingId || uid(),
      name,
      category: pCat.value.trim(),
      supplier: pSupplier.value.trim(),
      price: Number(pPrice.value)||0,
      cost: Number(pCost.value)||0,
      stock: Number(pStock.value)||0,
      discount: Number(pDiscount.value)||0,
      image: ''
    };
    if(pImage.files && pImage.files[0]) obj.image = await readFileAsDataURL(pImage.files[0]);
    else if(editingId){
      const prev = products.find(x=>x.id===editingId); if(prev) obj.image = prev.image || '';
    }
    if(editingId) products = products.map(p => p.id===editingId ? obj : p);
    else products.push(obj);
    editingId = null; pForm.reset();
    persist(); renderProducts(); showPanel('panel-products');
  });
  btnCancel.addEventListener('click', ()=> { editingId=null; pForm.reset(); showPanel('panel-products'); });

  function loadProductToForm(id){
    const p = products.find(x=>x.id===id); if(!p) return;
    editingId = id; pName.value = p.name; pCat.value = p.category; pSupplier.value = p.supplier;
    pPrice.value = p.price; pCost.value = p.cost; pStock.value = p.stock; pDiscount.value = p.discount;
    showPanel('panel-add');
  }

  function deleteProduct(id){
    products = products.filter(p=>p.id!==id);
    log = log.filter(l=> l.productId !== id);
    persist(); renderProducts(); renderLog(); renderClients();
  }

  btnNewProduct.addEventListener('click', ()=> { editingId=null; pForm.reset(); showPanel('panel-add'); });

  // move product
  function populateMoveProduct(){
    moveProduct.innerHTML = '';
    products.forEach(p => moveProduct.appendChild(Object.assign(document.createElement('option'), { value:p.id, textContent:`${p.name} (${p.stock})` })));
  }

  async function recordMove(isSale){
    const pid = moveProduct.value; if(!pid) return alert('Choisir produit');
    const qty = Number(moveQty.value); if(!qty || qty<=0) return alert('Quantité invalide');
    const p = products.find(x=>x.id===pid); if(!p) return alert('Produit introuvable');
    const price = Number(movePrice.value) || p.price;
    const client = moveClient.value.trim() || null;
    if(isSale){
      if(p.stock < qty) return alert('Stock insuffisant');
      p.stock -= qty;
      log.push({ id: uid(), date: todayISO(), productId: pid, name: p.name, type:'Vente', qty, price, client, paid: !moveCredit.checked });
      if(moveCredit.checked && client) addClientDebt(client, p.name, qty*price);
    } else {
      p.stock += qty;
      log.push({ id: uid(), date: todayISO(), productId: pid, name: p.name, type:'Entrée', qty, price, client:null, paid:true });
    }
    moveQty.value=''; movePrice.value=''; moveClient.value='';
    persist(); renderProducts(); renderLog(); renderClients();
  }
  applyMove.addEventListener('click', ()=> recordMove(false));
  applySell.addEventListener('click', ()=> recordMove(true));

  // log render & report
  function renderLog(filterDate){
    logTableBody.innerHTML = '';
    const rows = log.filter(item => !filterDate || item.date === filterDate);
    let total = 0;
    rows.forEach(item=>{
      const tot = item.qty * (item.price||0); total += tot;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${item.date}</td><td>${escapeHtml(item.name)}</td><td>${item.type}</td><td>${item.qty}</td><td>${Number(item.price).toLocaleString()}</td><td>${Number(tot).toLocaleString()}</td><td>${escapeHtml(item.client||'-')}</td>`;
      logTableBody.appendChild(tr);
    });
    reportTotal.textContent = fmtCFA(total);
  }
  filterLogBtn.addEventListener('click', ()=> renderLog(reportDate.value || ''));

  printLogBtn.addEventListener('click', ()=>{
    const d = reportDate.value || todayISO();
    renderLog(d);
    const w = window.open('','_blank');
    const html = `<html><head><title>Rapport ${d}</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:6px}</style></head><body><h3>Rapport ${d}</h3>${$('#logTable').outerHTML}<p>Total: ${reportTotal.textContent}</p></body></html>`;
    w.document.write(html); w.document.close(); w.print();
  });

  shareWABtn.addEventListener('click', ()=>{
    const d = reportDate.value || todayISO();
    const rows = log.filter(l=> l.date === d);
    let txt = `Rapport ${d}:\n`;
    rows.forEach(r=> txt += `${r.name} ${r.type} ${r.qty} x ${r.price} = ${r.qty*r.price} CFA\n`);
    window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
  });

  // clients
  function addClientDebt(name, product, amount){
    if(!name) return;
    let c = clients.find(x=> x.name === name);
    if(!c){ c = { id: uid(), name, phone:'', balance: 0 }; clients.push(c); }
    c.balance = (c.balance || 0) + Number(amount||0);
  }
  addClientBtn.addEventListener('click', ()=> {
    const name = clientName.value.trim(); if(!name) return alert('Nom required');
    const phone = clientPhone.value.trim();
    if(clients.find(c=>c.name===name)) return alert('Client existe');
    clients.push({ id: uid(), name, phone, balance:0 });
    clientName.value=''; clientPhone.value='';
    persist(); renderClients();
  });
  function renderClients(){
    clientsTableBody.innerHTML = '';
    clients.forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(c.name)}</td><td>${fmtCFA(c.balance)}</td><td><button data-id="${c.id}" class="payBtn">Marquer payé</button></td>`;
      clientsTableBody.appendChild(tr);
    });
    $$('.payBtn').forEach(b=> b.onclick = ()=> {
      const id = b.dataset.id;
      if(confirm('Marquer comme payé ?')) {
        clients = clients.map(cc=> cc.id===id ? Object.assign({},cc,{ balance:0 }) : cc);
        persist(); renderClients();
      }
    });
  }

  // reviews
  saveReviewBtn.addEventListener('click', ()=> {
    const t = reviewText.value.trim(); if(!t) return alert('Message vide');
    reviews.push({ id: uid(), date: todayISO(), text: t });
    reviewText.value=''; persist(); renderReviews();
  });
  clearReviewsBtn.addEventListener('click', ()=> { if(confirm('Effacer tous les messages ?')) { reviews=[]; persist(); renderReviews(); } });
  function renderReviews(){
    reviewsTableBody.innerHTML='';
    reviews.forEach(r=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.date}</td><td>${escapeHtml(r.text)}</td>`;
      reviewsTableBody.appendChild(tr);
    });
  }

  // export / import
  function download(content, name, type='text/csv'){ const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
  exportProductsCSV.addEventListener('click', ()=> {
    const header = 'name,category,supplier,price,cost,stock,discount\n';
    const lines = products.map(p=> [`"${(p.name||'').replace(/"/g,'""')}"`, `"${(p.category||'').replace(/"/g,'""')}"`, `"${(p.supplier||'').replace(/"/g,'""')}"`, p.price, p.cost, p.stock, p.discount].join(',')).join('\n');
    download(header + lines, 'products.csv');
  });
  exportLogCSV.addEventListener('click', ()=> {
    const header = 'date,productName,type,qty,price,client\n';
    const lines = log.map(l=> [l.date, `"${(l.name||'').replace(/"/g,'""')}"`, l.type, l.qty, l.price, `"${(l.client||'').replace(/"/g,'""')}"`].join(',')).join('\n');
    download(header + lines, 'log.csv');
  });
  exportXLSX.addEventListener('click', ()=> {
    if(window.XLSX){
      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(products);
      const ws2 = XLSX.utils.json_to_sheet(log);
      XLSX.utils.book_append_sheet(wb, ws1, 'Products');
      XLSX.utils.book_append_sheet(wb, ws2, 'Log');
      XLSX.writeFile(wb, 'excellence_export.xlsx');
    } else alert('SheetJS needed for Excel export');
  });

  importFile.addEventListener('change', e=>{
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = evt => {
      const text = evt.target.result;
      // naive CSV parser: skip header
      const rows = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
      rows.slice(1).forEach(line=>{
        const parts = parseCSVLine(line);
        if(parts.length >= 7) {
          products.push({ id: uid(), name: parts[0], category: parts[1], supplier: parts[2], price: Number(parts[3]||0), cost: Number(parts[4]||0), stock: Number(parts[5]||0), discount: Number(parts[6]||0), image: ''});
        }
      });
      persist(); renderProducts();
    };
    r.readAsText(f);
  });
  function parseCSVLine(line){
    const out=[]; let cur='', inQ=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch === '"'){ if(inQ && line[i+1]==='"'){ cur+='"'; i++; } else { inQ=!inQ; } continue; }
      if(ch === ',' && !inQ){ out.push(cur); cur=''; continue; }
      cur+=ch;
    }
    out.push(cur); return out.map(x=> x.replace(/^"|"$/g,'').trim());
  }

  // dashboard
  function updateDashboard(){
    const totalSales = log.filter(l=> l.type==='Vente').reduce((s,l)=> s + (l.qty*(l.price||0)),0);
    $('#dash_total_sales').textContent = fmtCFA(totalSales);
    const stockValue = products.reduce((s,p)=> s + (p.stock * (p.cost||0)),0);
    $('#dash_stock_value').textContent = fmtCFA(stockValue);
    const top = {};
    log.filter(l=> l.type==='Vente').forEach(l=> top[l.name] = (top[l.name]||0) + l.qty);
    const topArr = Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=> `${x[0]}(${x[1]})`).join(', ');
    $('#dash_top').textContent = topArr || '-';

    // show last 8 log items
    const tBody = $('#dashLogTable tbody'); tBody.innerHTML = '';
    log.slice(-8).reverse().forEach(l=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${l.date}</td><td>${escapeHtml(l.name)}</td><td>${l.type}</td><td>${l.qty}</td><td>${Number(l.qty*(l.price||0)).toLocaleString()}</td>`;
      tBody.appendChild(tr);
    });
  }

  function renderAll(){
    renderProducts(); renderLog(); renderClients(); renderReviews(); updateDashboard();
  }

  // utilities
  function showPanel(id){
    panels.forEach(p=> p.classList.toggle('active', p.id === id));
    navBtns.forEach(b=> b.classList.toggle('active', b.dataset.panel === id));
  }

  function renderLog(filterDate){
    const tb = $('#logTable tbody'); tb.innerHTML = '';
    let total = 0;
    log.filter(l=> !filterDate || l.date === filterDate).forEach(l=>{
      const tot = l.qty * (l.price||0); total += tot;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${l.date}</td><td>${escapeHtml(l.name)}</td><td>${l.type}</td><td>${l.qty}</td><td>${Number(l.price).toLocaleString()}</td><td>${Number(tot).toLocaleString()}</td><td>${escapeHtml(l.client||'-')}</td>`;
      tb.appendChild(tr);
    });
    $('#reportTotal').textContent = fmtCFA(total);
  }

  function renderClients(){
    clientsTableBody.innerHTML = '';
    clients.forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(c.name)}</td><td>${fmtCFA(c.balance||0)}</td><td><button data-id="${c.id}" class="markPaid">Régler</button></td>`;
      clientsTableBody.appendChild(tr);
    });
    $$('.markPaid').forEach(b=> b.onclick = ()=> {
      const id = b.dataset.id;
      if(confirm('Marquer payé ?')){ clients = clients.map(cc=> cc.id===id ? Object.assign({},cc,{ balance:0 }) : cc); persist(); renderClients(); }
    });
  }

  function renderReviews(){
    reviewsTableBody.innerHTML = '';
    reviews.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.date}</td><td>${escapeHtml(r.text)}</td>`;
      reviewsTableBody.appendChild(tr);
    });
  }

  saveReviewBtn.addEventListener('click', ()=> {
    const t = reviewText.value.trim(); if(!t) return alert('Message vide');
    reviews.push({ id: uid(), date: todayISO(), text: t }); reviewText.value=''; persist(); renderReviews();
  });

  clearReviewsBtn.addEventListener('click', ()=> {
    if(confirm('Effacer tous ?')){ reviews = []; persist(); renderReviews(); }
  });

  // language basic (changes nav & some labels)
  const i18n = {
    fr: { dashboard:'Dashboard', products:'Produits', stock:'Stock & Ventes', clients:'Clients', reviews:'Reviews', export:'Export' },
    en: { dashboard:'Dashboard', products:'Products', stock:'Stock & Sales', clients:'Clients', reviews:'Reviews', export:'Export'},
    ar: { dashboard:'لوحة', products:'المنتجات', stock:'المخزون', clients:'العملاء', reviews:'المراجعات', export:'تصدير' }
  };
  function applyLang(){
    const L = i18n[langSelect.value] || i18n.fr;
    const btns = $$('.nav-btn');
    btns[0].textContent = L.dashboard; btns[1].textContent = L.products; btns[2].textContent = L.stock; btns[3].textContent = L.clients; btns[4].textContent = L.reviews; btns[5].textContent = L.export;
    // direction:
    document.documentElement.dir = (langSelect.value === 'ar') ? 'rtl' : 'ltr';
  }
  langSelect.addEventListener('change', applyLang);

  // utility: delete by id
  function deleteById(arr, id){ return arr.filter(x=>x.id !== id); }

  // helper: delete product & related logs
  function deleteProduct(id){
    products = deleteById(products, id);
    log = log.filter(l=> l.productId !== id);
    persist(); renderAll();
  }

  // escape helper
  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // initial render
  renderAll();
  applyLang();

  // wire up render calls
  prodSearch.addEventListener('input', renderProducts);
  prodCategoryFilter.addEventListener('change', renderProducts);
  filterLogBtn.addEventListener('click', ()=> renderLog(reportDate.value || ''));
  $('#btnNewProduct').addEventListener('click', ()=> { editingId = null; pForm.reset(); showPanel('panel-add'); });

})();
