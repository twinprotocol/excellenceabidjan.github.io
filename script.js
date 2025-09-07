/* ---------- Data models in localStorage ----------
   products = [{id,name,category,supplier,price,cost,stock,discount,image}]
   stockLog = [{date,productId,productName,type,qty,price,clientId}]
   clients = [{id,name,phone,email,note}]
--------------------------------------------------*/

const $$ = sel => document.querySelector(sel);
const $$$ = sel => document.querySelectorAll(sel);

let products = JSON.parse(localStorage.getItem('ea_products')||'[]');
let stockLog = JSON.parse(localStorage.getItem('ea_stockLog')||'[]');
let clients = JSON.parse(localStorage.getItem('ea_clients')||'[]');

let editingProductIndex = -1;

// --- elements
const langSelect = $$('#langSelect');
const tabBtns = $$$('.tab-btn');
const tabs = $$$('.tab');

const prodForm = $$('#productForm');
const prodName = $$('#prodName'), prodCategory = $$('#prodCategory'), prodSupplier = $$('#prodSupplier');
const prodPrice = $$('#prodPrice'), prodCost = $$('#prodCost'), prodStock = $$('#prodStock'), prodDiscount = $$('#prodDiscount');
const prodImageFile = $$('#prodImageFile');
const saveProductBtn = $$('#saveProductBtn'), resetProductBtn = $$('#resetProductBtn');

const searchBox = $$('#searchBox'), filterCategory = $$('#filterCategory'), minPrice = $$('#minPrice'), maxPrice = $$('#maxPrice'), clearFilters = $$('#clearFilters');
const productsTableBody = $$('#productsTable tbody');

const moveProductSelect = $$('#moveProductSelect'), moveQty = $$('#moveQty'), moveType = $$('#moveType'), movePrice = $$('#movePrice'), moveClientSelect = $$('#moveClientSelect');
const doStockAdd = $$('#doStockAdd'), doStockSale = $$('#doStockSale');

const salesDateFilter = $$('#salesDateFilter'), applyDateFilter = $$('#applyDateFilter'), salesTableBody = $$('#salesTable tbody'), reportTotal = $$('#reportTotal');
const printReportBtn = $$('#printReport');

const clientForm = $$('#clientForm'), clientName = $$('#clientName'), clientPhone = $$('#clientPhone'), clientEmail = $$('#clientEmail'), clientNote = $$('#clientNote');
const clientsTableBody = $$('#clientsTable tbody'), unpaidTableBody = $$('#unpaidTable tbody'), clientSearch = $$('#clientSearch');

const exportProductsCSV = $$('#exportProductsCSV'), exportLogCSV = $$('#exportLogCSV'), exportExcel = $$('#exportExcel');
const importProductsFile = $$('#importProductsFile'), importProductsBtn = $$('#importProductsBtn');
const shareProductsBtn = $$('#shareProductsBtn'), shareReportBtn = $$('#shareReportBtn');

const fab = $$('#fab');

// --- Utilities
const uid = ()=>'id'+Math.random().toString(36).slice(2,9);
const saveAll = ()=>{ localStorage.setItem('ea_products',JSON.stringify(products)); localStorage.setItem('ea_stockLog',JSON.stringify(stockLog)); localStorage.setItem('ea_clients',JSON.stringify(clients)); refreshAll(); }
const formatCFA = n => Number(n||0).toLocaleString() + ' CFA';
const todayISO = ()=> (new Date()).toISOString().slice(0,10);

// --- Tabs logic
tabBtns.forEach(btn=>{
  btn.addEventListener('click', ()=> {
    tabBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    tabs.forEach(t=>t.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// fab -> open products
fab.addEventListener('click', ()=> { $$('#btn-products').click(); prodName.focus(); window.scrollTo({top:0,behavior:'smooth'}); });

// Language
const translations = {
  fr: {
    products:'Produits', stock:'Stock & Ventes', clients:'Clients', export:'Export / Paramètres',
    addProduct:'Ajouter un produit', searchPlaceholder:'Recherche (nom/fournisseur/catégorie)',
    qtyInvalid:'Quantité invalide', priceInvalid:'Prix invalide', stockInsuff:'Stock insuffisant',
    addClient:'Ajouter client', unpaid:'Non payés', exportNote:'Format CSV: name,category,supplier,price,cost,stock,discount'
  },
  en: {
    products:'Products', stock:'Stock & Sales', clients:'Clients', export:'Export / Settings',
    addProduct:'Add product', searchPlaceholder:'Search (name/supplier/category)',
    qtyInvalid:'Invalid quantity', priceInvalid:'Invalid price', stockInsuff:'Insufficient stock',
    addClient:'Add client', unpaid:'Unpaid', exportNote:'CSV format: name,category,supplier,price,cost,stock,discount'
  },
  ar: {
    products:'المنتجات', stock:'المخزون والمبيعات', clients:'العملاء', export:'تصدير / إعدادات',
    addProduct:'إضافة منتج', searchPlaceholder:'بحث (الاسم/المورد/الفئة)',
    qtyInvalid:'كمية غير صالحة', priceInvalid:'سعر غير صالح', stockInsuff:'المخزون غير كاف',
    addClient:'إضافة عميل', unpaid:'غير مدفوعة', exportNote:'صيغة CSV: name,category,supplier,price,cost,stock,discount'
  }
};
function applyLanguage(lang){
  langSelect.value = lang;
  const t = translations[lang] || translations.fr;
  $$('#btn-products').textContent = t.products;
  $$('#btn-stock').textContent = t.stock;
  $$('#btn-clients').textContent = t.clients;
  $$('#btn-export').textContent = t.export;
  $$('#searchBox').placeholder = t.searchPlaceholder;
  $$('#clientName').placeholder = t.addClient;
  $$('#importProductsFile').previousElementSibling && ($$('#importProductsFile').previousElementSibling.textContent = t.exportNote);
}
langSelect.addEventListener('change', e=> applyLanguage(e.target.value));
applyLanguage('fr');

// --- Products rendering & management
function populateCategoryFilters(){
  const cats = Array.from(new Set(products.map(p=>p.category).filter(Boolean)));
  filterCategory.innerHTML = '<option value="">Toutes catégories</option>';
  cats.forEach(c=>{ const o = document.createElement('option'); o.value=c; o.textContent=c; filterCategory.appendChild(o); });
}
function renderProducts(){
  productsTableBody.innerHTML='';
  const s = searchBox.value.trim().toLowerCase();
  const fc = filterCategory.value;
  const min = parseFloat(minPrice.value)||-Infinity, max = parseFloat(maxPrice.value)||Infinity;
  products.forEach((p, idx)=>{
    if(s && !(p.name.toLowerCase().includes(s) || (p.supplier||'').toLowerCase().includes(s) || (p.category||'').toLowerCase().includes(s))) return;
    if(fc && p.category !== fc) return;
    if(p.price < min || p.price > max) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.image?'<img src="'+p.image+'" />':''}</td>
      <td>${p.name}</td>
      <td>${p.category||''}</td>
      <td>${p.supplier||''}</td>
      <td>${Number(p.price).toLocaleString()}</td>
      <td>${Number(p.cost).toLocaleString()}</td>
      <td>${p.stock}</td>
      <td>${p.discount||0}%</td>
      <td>
        <button data-edit="${idx}">✏️</button>
        <button data-del="${idx}" class="danger">🗑️</button>
      </td>`;
    productsTableBody.appendChild(tr);
  });
  // attach events
  $$$('[data-edit]').forEach(btn=> btn.addEventListener('click', e=> {
    const i = Number(btn.getAttribute('data-edit')); editProduct(i);
  }));
  $$$('[data-del]').forEach(btn=> btn.addEventListener('click', e=> {
    const i = Number(btn.getAttribute('data-del'));
    if(confirm('Supprimer ce produit ?')) { products.splice(i,1); saveAll(); }
  }));
  populateCategoryFilters();
  populateMoveSelect();
}

// add/edit product
prodForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const name = prodName.value.trim();
  if(!name) return alert('Nom requis');
  const obj = {
    id: editingProductIndex>-1 ? products[editingProductIndex].id : uid(),
    name,
    category: prodCategory.value.trim(),
    supplier: prodSupplier.value.trim(),
    price: Number(prodPrice.value)||0,
    cost: Number(prodCost.value)||0,
    stock: Number(prodStock.value)||0,
    discount: Number(prodDiscount.value)||0,
    image: ''
  };
  // image handling
  if(prodImageFile.files && prodImageFile.files[0]) {
    obj.image = await readFileAsDataURL(prodImageFile.files[0]);
  } else if (editingProductIndex>-1 && products[editingProductIndex].image) {
    obj.image = products[editingProductIndex].image;
  }
  if(editingProductIndex>-1) { products[editingProductIndex] = obj; editingProductIndex=-1; }
  else products.push(obj);
  prodForm.reset(); saveAll();
});

resetProductBtn.addEventListener('click', ()=>{ editingProductIndex=-1; prodForm.reset(); });

// edit
function editProduct(i){
  const p = products[i];
  editingProductIndex = i;
  prodName.value = p.name; prodCategory.value = p.category; prodSupplier.value = p.supplier;
  prodPrice.value = p.price; prodCost.value = p.cost; prodStock.value = p.stock; prodDiscount.value = p.discount;
}

// helper read file to data url
function readFileAsDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(file); }); }

// --- Stock move / sales handling
function populateMoveSelect(){
  moveProductSelect.innerHTML='';
  products.forEach((p,idx)=>{
    const opt = document.createElement('option'); opt.value = idx; opt.textContent = `${p.name} (${p.stock})`; moveProductSelect.appendChild(opt);
  });
}
doStockAdd.addEventListener('click', ()=> handleStockMove('Entrée') );
doStockSale.addEventListener('click', ()=> handleStockMove('Vente') );

function handleStockMove(defaultType='Entrée'){
  const idx = Number(moveProductSelect.value);
  if(isNaN(idx)) return alert('Choisir un produit');
  const qty = Number(moveQty.value);
  if(!qty || qty<=0) return alert(translations[langSelect.value].qtyInvalid || 'Quantité invalide');
  const type = defaultType === 'Vente' ? 'Vente' : (moveType.value || defaultType);
  const price = Number(movePrice.value) || products[idx].price;
  const clientId = moveClientSelect.value || null;
  if(type === 'Vente') {
    if(products[idx].stock < qty) return alert(translations[langSelect.value].stockInsuff || 'Stock insuffisant');
    products[idx].stock -= qty;
    // record sale
    stockLog.push({date: todayISO(), productId: products[idx].id, productName: products[idx].name, type:'Vente', qty, price, clientId});
    if(clientId){
      const c = clients.find(x=>x.id===clientId);
      if(c){ c.balance = (c.balance||0) + qty*price; } // add credit
    }
  } else {
    products[idx].stock += qty;
    stockLog.push({date: todayISO(), productId: products[idx].id, productName: products[idx].name, type:'Entrée', qty, price, clientId});
  }
  moveQty.value=''; movePrice.value='';
  saveAll();
}

// --- Sales rendering (by date filter)
function renderSales(date=''){
  salesTableBody.innerHTML='';
  let total = 0;
  const filtered = stockLog.filter(s => !date || s.date === date);
  filtered.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.date}</td><td>${s.productName}</td><td>${s.type}</td><td>${s.qty}</td><td>${Number(s.price).toLocaleString()}</td><td>${Number(s.qty*s.price).toLocaleString()}</td><td>${s.clientId? (clients.find(c=>c.id===s.clientId)||{}).name : '-'}</td>`;
    salesTableBody.appendChild(tr);
    total += s.qty*s.price;
  });
  reportTotal.textContent = formatCFA(total);
}

// print report: prints only sales table for selected date
printReportBtn.addEventListener('click', ()=>{
  const date = salesDateFilter.value || todayISO();
  renderSales(date);
  // use print stylesheet already set: only salesTable visible
  window.print();
});

// --- Clients management
clientForm.addEventListener('submit', e=>{
  e.preventDefault();
  const obj = { id: uid(), name: clientName.value.trim(), phone: clientPhone.value.trim(), email: clientEmail.value.trim(), note: clientNote.value.trim(), balance: 0 };
  clients.push(obj); clientForm.reset(); saveAll();
});
function renderClients(){
  clientsTableBody.innerHTML=''; unpaidTableBody.innerHTML='';
  clients.forEach((c, idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.name}</td><td>${c.phone||''}</td><td>${c.email||''}</td><td>${formatCFA(c.balance)}</td><td><button data-pay="${c.id}">Marquer payé</button></td>`;
    clientsTableBody.appendChild(tr);
  });
  // unpaid entries from stockLog with clientId
  stockLog.filter(s=>s.clientId && s.type==='Vente').forEach((s, i)=>{
    const client = clients.find(c=>c.id===s.clientId);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.date}</td><td>${client?client.name:'-'}</td><td>${s.productName}</td><td>${s.qty}</td><td>${s.price}</td><td>${s.qty*s.price}</td><td><button data-mark="${i}">Règler</button></td>`;
    unpaidTableBody.appendChild(tr);
  });
  // attach pay events
  $$$('[data-pay]').forEach(b=> b.addEventListener('click', ()=> {
    const id = b.getAttribute('data-pay');
    const c = clients.find(x=>x.id===id);
    if(c){ if(confirm('Réinitialiser le solde du client ?')){ c.balance=0; saveAll(); } }
  }));
  $$$('[data-mark]').forEach(b=> b.addEventListener('click', ()=>{
    const idx = Number(b.getAttribute('data-mark'));
    const entry = stockLog.filter(s=>s.clientId && s.type==='Vente')[idx];
    if(!entry) return;
    // mark as paid by removing clientId and reducing client's balance
    const c = clients.find(x=>x.id===entry.clientId);
    if(c){ c.balance = Math.max(0, c.balance - entry.qty*entry.price); }
    entry.clientId = null;
    saveAll();
  }));
}

// --- Exports / Imports
exportProductsCSV.addEventListener('click', ()=>{
  const csv = ['name,category,supplier,price,cost,stock,discount'].concat(products.map(p=>`${csvSafe(p.name)},${csvSafe(p.category)},${csvSafe(p.supplier)},${p.price},${p.cost},${p.stock},${p.discount}`)).join('\n');
  downloadBlob(csv, 'products.csv', 'text/csv');
});
exportLogCSV.addEventListener('click', ()=>{
  const csv = ['date,productName,type,qty,price,client'].concat(stockLog.map(l=>`${l.date},${csvSafe(l.productName)},${l.type},${l.qty},${l.price},${l.clientId||''}`)).join('\n');
  downloadBlob(csv, 'stocklog.csv', 'text/csv');
});
exportExcel.addEventListener('click', ()=>{
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(products);
  const ws2 = XLSX.utils.json_to_sheet(stockLog);
  XLSX.utils.book_append_sheet(wb, ws1, 'Products');
  XLSX.utils.book_append_sheet(wb, ws2, 'StockLog');
  XLSX.writeFile(wb, 'excellence_export.xlsx');
});
importProductsBtn.addEventListener('click', ()=> importProductsFile.click());
importProductsFile.addEventListener('change', e=>{
  const f = e.target.files[0]; if(!f) return;
  const rdr = new FileReader();
  rdr.onload = evt=>{
    const lines = evt.target.result.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    lines.slice(1).forEach(l=>{
      const parts = csvLineToArray(l);
      if(parts.length>=7){
        const [name,category,supplier,price,cost,stock,discount] = parts;
        products.push({id:uid(),name,category,supplier,price:Number(price),cost:Number(cost),stock:Number(stock),discount:Number(discount),image:''});
      }
    });
    saveAll();
  };
  rdr.readAsText(f);
});
shareProductsBtn.addEventListener('click', ()=>{
  let text = 'Produits:\\n';
  products.forEach(p=> text += `${p.name} - ${p.stock}pcs - ${p.price} CFA\\n`);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
});
shareReportBtn.addEventListener('click', ()=>{
  const date = salesDateFilter.value || todayISO();
  const items = stockLog.filter(s=>s.date===date);
  let text = `Rapport ${date}:\\n`;
  items.forEach(i=> text += `${i.productName} ${i.type} ${i.qty} x ${i.price} = ${i.qty*i.price} CFA\\n`);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
});

// --- helpers
function downloadBlob(content, name, type){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
function csvSafe(s){ if(!s) return ''; return `"${String(s).replace(/"/g,'""')}"`; }
function csvLineToArray(line){
  // simple CSV parse supporting quoted values
  const res = []; let cur='', inQuotes=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='\"'){ if(inQuotes && line[i+1]==='\"'){ cur+='"'; i++; } else inQuotes=!inQuotes; continue; }
    if(ch===',' && !inQuotes){ res.push(cur); cur=''; continue; }
    cur+=ch;
  }
  res.push(cur); return res.map(x=>x.trim());
}

// --- Dashboard & refresh
function updateDashboard(){
  const totalSales = stockLog.filter(s=>s.type==='Vente').reduce((a,b)=>a+b.qty*b.price,0);
  $$('#dashTotalSales').textContent = formatCFA(totalSales);
  const stockValue = products.reduce((a,b)=>a + (b.cost*b.stock), 0);
  $$('#dashStockValue').textContent = formatCFA(stockValue);
  const top = {};
  stockLog.filter(s=>s.type==='Vente').forEach(s=> top[s.productName] = (top[s.productName]||0) + s.qty);
  const topArr = Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]+'('+x[1]+')').join(', ');
  $$('#dashTop').textContent = topArr || '-';
  const low = products.filter(p=>p.stock<5).map(p=>p.name).slice(0,5).join(', ');
  $$('#dashLow').textContent = low || '-';
  // populate client select
  moveClientSelect.innerHTML = '<option value="">Client (optionnel)</option>';
  clients.forEach(c=> moveClientSelect.appendChild(Object.assign(document.createElement('option'), {value:c.id, textContent:c.name})));
  // update clients table
  renderClients();
}

function renderClients(){
  clientsTableBody.innerHTML=''; unpaidTableBody.innerHTML='';
  clients.forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.name}</td><td>${c.phone||''}</td><td>${c.email||''}</td><td>${formatCFA(c.balance||0)}</td><td><button data-clear="${c.id}">Effacer dette</button></td>`;
    clientsTableBody.appendChild(tr);
  });
  $$$('[data-clear]').forEach(btn=> btn.addEventListener('click', ()=>{
    const id = btn.getAttribute('data-clear'); const c = clients.find(x=>x.id===id);
    if(c && confirm('Marquer comme payé ?')){ c.balance = 0; saveAll(); }
  }));
  // unpaid entries
  stockLog.filter(s=>s.clientId && s.type==='Vente').forEach((s,i)=>{
    const client = clients.find(c=>c.id===s.clientId);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.date}</td><td>${client?client.name:'-'}</td><td>${s.productName}</td><td>${s.qty}</td><td>${s.price}</td><td>${s.qty*s.price}</td><td><button data-setpaid="${i}">Marquer payé</button></td>`;
    unpaidTableBody.appendChild(tr);
  });
  $$$('[data-setpaid]').forEach(btn=> btn.addEventListener('click', ()=>{
    const idx = Number(btn.getAttribute('data-setpaid'));
    const list = stockLog.filter(s=>s.clientId && s.type==='Vente');
    const entry = list[idx];
    if(!entry) return;
    const client = clients.find(c=>c.id===entry.clientId);
    if(client){ client.balance = Math.max(0, client.balance - entry.qty*entry.price); }
    entry.clientId = null;
    saveAll();
  }));
}

function refreshAll(){
  renderProducts(); renderSales(salesDateFilter.value||''); updateDashboard();
}
function saveAll(){ localStorage.setItem('ea_products',JSON.stringify(products)); localStorage.setItem('ea_stockLog',JSON.stringify(stockLog)); localStorage.setItem('ea_clients',JSON.stringify(clients)); refreshAll(); }

// initial
refreshAll();
