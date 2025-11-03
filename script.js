/* Excellence Abidjan - single-page client-side app
   Features:
   - products CRUD (localStorage)
   - image upload / mobile camera via input capture
   - stock entries & sales (log)
   - sales filter by date + print report (only the report)
   - clients with unpaid debt marking
   - export CSV / Excel import (SheetJS)
   - WhatsApp share of report
   - multilingual UI (fr/en/ar)
*/
(() => {
  // ---------- helpers ----------
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const uid = ()=> 'id'+Math.random().toString(36).slice(2,9);
  const fmtCFA = n => (Number(n)||0).toLocaleString() + ' CFA';
  const todayISO = ()=> (new Date()).toISOString().slice(0,10);

  // ---------- storage keys ----------
  const LS_P = 'ea_products_v1';
  const LS_L = 'ea_log_v1';
  const LS_C = 'ea_clients_v1';

  // ---------- state ----------
  let products = JSON.parse(localStorage.getItem(LS_P) || '[]');
  let log = JSON.parse(localStorage.getItem(LS_L) || '[]'); // {date, productId, name, type, qty, price, client, paid}
  let clients = JSON.parse(localStorage.getItem(LS_C) || '[]');

  // ---------- UI refs ----------
  const tabs = $$('.tab'), panels = $$('.panel');
  const search = $('#search'), catFilter = $('#catFilter'), productGrid = $('#productGrid'), statCount = $('#statCount'), statValue = $('#statValue'), statTop = $('#statTop');
  const newProductBtn = $('#newProductBtn'), fab = $('#fab');

  // add tab controls
  tabs.forEach(t=> t.addEventListener('click', ()=> {
    tabs.forEach(x=> x.classList.remove('active'));
    panels.forEach(p=> p.classList.remove('active'));
    t.classList.add('active');
    const id = t.dataset.target;
    $('#' + id).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }));

  // ---------- products UI & CRUD ----------
  const pForm = $('#productForm'), pName = $('#p_name'), pCat = $('#p_category'), pSupplier = $('#p_supplier');
  const pPrice = $('#p_price'), pCost = $('#p_cost'), pStock = $('#p_stock'), pDiscount = $('#p_discount'), pImage = $('#p_image');
  const saveProductBtn = $('#saveProduct'), cancelEdit = $('#cancelEdit');
  let editingId = null;

  function persist(){
    localStorage.setItem(LS_P, JSON.stringify(products));
    localStorage.setItem(LS_L, JSON.stringify(log));
    localStorage.setItem(LS_C, JSON.stringify(clients));
  }

  function readFileAsDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(file); }); }

  async function saveProduct(e){
    if(e) e.preventDefault();
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
      const prev = products.find(x=>x.id===editingId);
      if(prev) obj.image = prev.image || '';
    }
    if(editingId){
      products = products.map(p => p.id===editingId ? obj : p);
    } else products.push(obj);
    editingId = null;
    pForm.reset();
    persist(); renderProducts(); showTab('tab-products');
  }

  function editProduct(id){
    const p = products.find(x=>x.id===id); if(!p) return;
    editingId = id;
    pName.value = p.name; pCat.value = p.category; pSupplier.value = p.supplier;
    pPrice.value = p.price; pCost.value = p.cost; pStock.value = p.stock; pDiscount.value = p.discount;
    showTab('tab-add'); window.scrollTo({top:0,behavior:'smooth'});
  }

  function deleteProduct(id){
    if(!confirm('Supprimer produit ?')) return;
    products = products.filter(p=>p.id!==id);
    // remove related logs (optional: keep)
    log = log.filter(l=> l.productId !== id);
    persist(); renderProducts(); renderLog(); renderClients();
  }

  async function renderProducts(){
    // filters
    const q = (search.value||'').toLowerCase();
    const cat = catFilter.value;
    // populate categories
    const cats = Array.from(new Set(products.map(p=>p.category).filter(Boolean)));
    catFilter.innerHTML = '<option value="">Toutes catégories</option>';
    cats.forEach(c=> catFilter.appendChild(Object.assign(document.createElement('option'),{value:c,textContent:c})));

    // grid
    productGrid.innerHTML = '';
    let totalStockValue=0;
    const counts = {};
    products.filter(p=>{
      if(q && !(p.name.toLowerCase().includes(q) || (p.supplier||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q))) return false;
      if(cat && p.category !== cat) return false;
      return true;
    }).forEach(p=>{
      totalStockValue += (p.stock * (p.cost||0));
      counts[p.name] = counts[p.name] ? counts[p.name] + 0 : 0;
      const card = document.createElement('div'); card.className='card product';
      card.innerHTML = `
        ${p.image?`<img src="${p.image}" alt="">`: `<div style="height:140px;background:#f2f6fb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9aa8c7">No image</div>`}
        <div><b>${escapeHtml(p.name)}</b></div>
        <div class="muted">${escapeHtml(p.category||'')}</div>
        <div>Prix: ${Number(p.price).toLocaleString()} CFA</div>
        <div>Stock: ${p.stock}</div>
        <div class="card-actions">
          <button class="edit" data-id="${p.id}">✏️</button>
          <button class="del" data-id="${p.id}">🗑️</button>
        </div>`;
      productGrid.appendChild(card);
    });
    statCount.textContent = products.length;
    statValue.textContent = fmtCFA(totalStockValue);

    // attach edit/delete
    $$('.edit').forEach(b=> b.onclick = ()=> editProduct(b.dataset.id));
    $$('.del').forEach(b=> b.onclick = ()=> deleteProduct(b.dataset.id));
    populateMoveProduct();
    updateDashboard();
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ---------- stock / sales ----------
  const moveProduct = $('#moveProduct'), moveQty = $('#moveQty'), moveType = $('#moveType'), movePrice = $('#movePrice'), moveClient = $('#moveClient'), moveCredit = $('#moveCredit');
  const applyMoveBtn = $('#applyMove'), doSellBtn = $('#doSell');

  function populateMoveProduct(){
    moveProduct.innerHTML = '';
    products.forEach((p, i) => moveProduct.appendChild(Object.assign(document.createElement('option'), { value: p.id, textContent: `${p.name} (${p.stock})` })));
  }

  function recordMove(isSale){
    const pid = moveProduct.value; if(!pid) return alert('Choisir produit');
    const qty = Number(moveQty.value); if(!qty || qty<=0) return alert('Quantité invalide');
    const p = products.find(x=>x.id===pid); if(!p) return alert('Produit introuvable');
    const price = Number(movePrice.value) || p.price;
    const client = moveClient.value.trim() || null;

    if(isSale){
      if(p.stock < qty) return alert('Stock insuffisant');
      p.stock -= qty;
      log.push({ id: uid(), date: todayISO(), productId: pid, name: p.name, type:'Vente', qty, price, client, paid: !moveCredit.checked });
      if(moveCredit.checked && client){
        addClientCredit(client, p.name, qty*price);
      }
    } else {
      p.stock += qty;
      log.push({ id: uid(), date: todayISO(), productId: pid, name: p.name, type:'Entrée', qty, price, client:null, paid:true });
    }
    moveQty.value=''; movePrice.value=''; moveClient.value='';
    persist(); renderProducts(); renderLog(); renderClients();
  }

  applyMoveBtn.addEventListener('click', ()=> recordMove(false));
  doSellBtn.addEventListener('click', ()=> recordMove(true));

  // ---------- log rendering & reports ----------
  const logTableBody = $('#logTable tbody'), reportSum = $('#reportSum'), reportDate = $('#reportDate');
  const applyFilter = $('#applyFilter'), printReport = $('#printReport'), shareWA = $('#shareWA');

  function renderLog(filterDate){
    logTableBody.innerHTML = '';
    let total = 0;
    log.filter(item => !filterDate || item.date === filterDate).forEach(item=>{
      const row = document.createElement('tr');
      const tot = item.qty * (item.price||0);
      total += tot;
      row.innerHTML = `<td>${item.date}</td><td>${escapeHtml(item.name)}</td><td>${item.type}</td><td>${item.qty}</td><td>${Number(item.price).toLocaleString()}</td><td>${Number(tot).toLocaleString()}</td><td>${escapeHtml(item.client||'-')}</td>`;
      logTableBody.appendChild(row);
    });
    reportSum.textContent = fmtCFA(total);
  }
  applyFilter.addEventListener('click', ()=> renderLog(reportDate.value || ''));

  printReport.addEventListener('click', ()=>{
    const d = reportDate.value || todayISO();
    renderLog(d);
    const w = window.open('','_blank');
    const html = `<html><head><title>Rapport ${d}</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:6px}</style></head><body><h3>Rapport ${d}</h3>${$('#logTable').outerHTML}<p>Total: ${reportSum.textContent}</p></body></html>`;
    w.document.write(html); w.document.close(); w.print();
  });

  shareWA.addEventListener('click', ()=>{
    const d = reportDate.value || todayISO();
    const items = log.filter(l=> l.date===d);
    let txt = `Rapport ${d}:%0A`;
    items.forEach(i=> txt += `${i.name} ${i.type} ${i.qty} x ${i.price} = ${i.qty*i.price} CFA%0A`);
    window.open(`https://wa.me/?text=${txt}`, '_blank');
  });

  // ---------- clients ----------
  const clientFormBtn = $('#addClient'), clientNameInput = $('#c_name'), clientPhoneInput = $('#c_phone'), clientsTableBody = $('#clientsTable tbody');

  function addClientCredit(name, product, amount){
    if(!name) return;
    let c = clients.find(x=> x.name === name);
    if(!c){ c = { id: uid(), name, phone:'', balance:0 }; clients.push(c); }
    c.balance = (c.balance || 0) + Number(amount||0);
    persist();
  }

  clientFormBtn.addEventListener('click', ()=>{
    const name = clientNameInput.value.trim(); if(!name) return alert('Nom client requis');
    const phone = clientPhoneInput.value.trim();
    if(clients.find(x=>x.name===name)) return alert('Client existe déjà');
    clients.push({ id: uid(), name, phone, balance:0 });
    clientNameInput.value=''; clientPhoneInput.value='';
    persist(); renderClients();
  });

  function renderClients(){
    clientsTableBody.innerHTML = '';
    clients.forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(c.name)}</td><td>${fmtCFA(c.balance)}</td><td><button data-id="${c.id}" class="pay">Marquer payé</button></td>`;
      clientsTableBody.appendChild(tr);
    });
    $$('.pay').forEach(b=> b.onclick = ()=> {
      const id = b.dataset.id;
      if(confirm('Marquer tout payé pour ce client ?')){
        clients = clients.map(x=> x.id===id ? Object.assign({},x,{ balance:0 }) : x);
        persist(); renderClients();
      }
    });
  }

  // ---------- dashboard ----------
  const dashSales = $('#dashSales'), dashStock = $('#dashStock'), dashLow = $('#dashLow');

  function updateDashboard(){
    const totalSales = log.filter(l=> l.type==='Vente').reduce((s,i)=> s + (i.qty*(i.price||0)),0);
    dashSales.textContent = fmtCFA(totalSales);
    const stockValue = products.reduce((s,p)=> s + (p.stock*(p.cost||0)),0);
    dashStock.textContent = fmtCFA(stockValue);
    const low = products.filter(p=> p.stock < 5).map(p=> p.name).join(', ');
    dashLow.textContent = low || '-';
    // top: by qty sold
    const top = {};
    log.filter(l=> l.type==='Vente').forEach(l=> top[l.name] = (top[l.name]||0) + l.qty);
    const topArr = Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=> `${x[0]}(${x[1]})`).join(', ');
    statTop.textContent = topArr || '-';
  }

  // ---------- export / import ----------
  const exportCSV = $('#exportCSV'), exportXLSX = $('#exportXLSX'), importFile = $('#importFile');

  // CSV helpers
  function downloadFile(content, name, mime='text/csv'){
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }

  // export products CSV
  $('#exportCSV').addEventListener('click', ()=>{
    const header = 'name,category,supplier,price,cost,stock,discount\n';
    const lines = products.map(p=> [
      `"${(p.name||'').replace(/"/g,'""')}"`,
      `"${(p.category||'').replace(/"/g,'""')}"`,
      `"${(p.supplier||'').replace(/"/g,'""')}"`,
      p.price, p.cost, p.stock, p.discount
    ].join(',')).join('\n');
    downloadFile(header + lines, 'products.csv');
  });

  // export XLSX (SheetJS)
  $('#exportXLSX').addEventListener('click', ()=>{
    if(window.XLSX){
      const ws1 = XLSX.utils.json_to_sheet(products);
      const ws2 = XLSX.utils.json_to_sheet(log);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws1, 'Products');
      XLSX.utils.book_append_sheet(wb, ws2, 'Log');
      XLSX.writeFile(wb, 'excellence_export.xlsx');
    } else alert('SheetJS non disponible');
  });

  // import CSV for products (simple)
  $('#importFile').addEventListener('change', e=>{
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = evt=>{
      const rows = evt.target.result.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
      rows.slice(1).forEach(line=>{
        const parts = parseCSVLine(line);
        if(parts.length>=7){
          products.push({ id: uid(), name: parts[0], category: parts[1], supplier: parts[2], price: Number(parts[3]||0), cost: Number(parts[4]||0), stock: Number(parts[5]||0), discount: Number(parts[6]||0), image:'' });
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
      if(ch === '"' ){ if(inQ && line[i+1]==='"'){ cur+='"'; i++; } else { inQ=!inQ; } continue; }
      if(ch===',' && !inQ){ out.push(cur); cur=''; continue; }
      cur+=ch;
    }
    out.push(cur); return out.map(x=>x.trim().replace(/^"|"$/g,''));
  }

  // ---------- search / filters ----------
  search.addEventListener('input', renderProducts);
  catFilter.addEventListener('change', renderProducts);
  newProductBtn.addEventListener('click', ()=> { editingId = null; pForm.reset(); showTab('tab-add'); });

  // ---------- misc UI ----------
  fab.addEventListener('click', ()=> { showTab('tab-add'); window.scrollTo({top:0,behavior:'smooth'}); });

  function showTab(id){
    tabs.forEach(t=> t.classList.toggle('active', t.dataset.target===id));
    panels.forEach(p=> p.classList.toggle('active', p.id===id));
  }

  // ---------- language (basic labels) ----------
  const lang = $('#lang');
  const i18n = {
    fr: { products:'Produits', add:'Ajouter', stock:'Stock & Ventes', clients:'Clients', export:'Export', new:'Nouveau', save:'Enregistrer' },
    en: { products:'Products', add:'Add', stock:'Stock & Sales', clients:'Clients', export:'Export', new:'New', save:'Save' },
    ar: { products:'المنتجات', add:'إضافة', stock:'المخزون والمبيعات', clients:'العملاء', export:'تصدير', new:'جديد', save:'حفظ' }
  };
  function applyLang(){
    const L = i18n[lang.value] || i18n.fr;
    const tabEls = $$('.tab');
    tabEls[0].textContent = L.products; tabEls[1].textContent = L.add; tabEls[2].textContent = L.stock; tabEls[3].textContent = L.clients; tabEls[4].textContent = L.export;
    $('#newProductBtn').textContent = L.new;
    $('#saveProduct').textContent = L.save;
    // rtl for arabic
    document.documentElement.dir = (lang.value === 'ar') ? 'rtl' : 'ltr';
  }
  lang.addEventListener('change', applyLang);
  applyLang();

  // ---------- initial data & render ----------
  function initSample(){
    if(products.length === 0){
      products.push({ id: uid(), name:'Bouteille Eau', category:'Boissons', supplier:'Fournisseur A', price:300, cost:150, stock:50, discount:0, image:''});
      products.push({ id: uid(), name:'Pain', category:'Boulangerie', supplier:'Boulangerie X', price:200, cost:100, stock:20, discount:0, image:''});
      persist();
    }
  }
  initSample();
  renderProducts();
  renderLog();
  renderClients();
  updateDashboard();

  // ---------- event bindings ----------
  pForm.addEventListener('submit', saveProduct);
  cancelEdit.addEventListener('click', ()=> { editingId=null; pForm.reset(); showTab('tab-products'); });
  applyFilter.click(); // init
})();
