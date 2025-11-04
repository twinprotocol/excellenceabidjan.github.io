// -------------------------
// DATA
// -------------------------
let products=[], clients=[], invoices=[];

// -------------------------
// SETTINGS
// -------------------------
const currencies = [
  { code: 'DZD', name: 'Algerian Dinar' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'XOF', name: 'West African CFA Franc' }
];
const translations={
  en:{ title:'AtlasStock Pro', products:'Products', clients:'Clients', invoices:'Invoices' },
  fr:{ title:'AtlasStock Pro', products:'Produits', clients:'Clients', invoices:'Factures' },
  ar:{ title:'أطلس ستوك برو', products:'المنتجات', clients:'العملاء', invoices:'الفواتير' }
};

// -------------------------
// ELEMENTS
// -------------------------
const langSelect=document.getElementById('language-selector');
const currencySelect=document.getElementById('currency-selector');
const themeToggle=document.getElementById('theme-toggle');
const appTitle=document.getElementById('app-title');
const productCards=document.getElementById('product-cards');
const clientCards=document.getElementById('client-cards');
const invoiceList=document.getElementById('invoice-list');
const addProductBtn=document.getElementById('add-product-btn');
const addClientBtn=document.getElementById('add-client-btn');
const exportCSVBtn=document.getElementById('export-csv');
const modalOverlay=document.getElementById('modal-overlay');
const modalContent=document.getElementById('modal-content');

// -------------------------
// UTILITY
// -------------------------
function showModal(html){ modalContent.innerHTML=html; modalOverlay.classList.add('active'); }
function closeModal(){ modalOverlay.classList.remove('active'); }
modalOverlay.addEventListener('click', e=>{ if(e.target===modalOverlay) closeModal(); });

// -------------------------
// THEME & LANGUAGE
// -------------------------
themeToggle.addEventListener('click', ()=>document.body.classList.toggle('dark-mode'));
langSelect.addEventListener('change', ()=>{
  const lang=langSelect.value;
  appTitle.textContent=translations[lang].title;
});
currencies.forEach(c=>{ let opt=document.createElement('option'); opt.value=c.code; opt.textContent=`${c.code} — ${c.name}`; currencySelect.appendChild(opt); });

// -------------------------
// DASHBOARD
// -------------------------
function updateDashboard(){
  document.getElementById('total-products').textContent=products.length;
  let totalValue=products.reduce((s,p)=>s+p.quantity*p.purchasePrice,0);
  document.getElementById('total-value').textContent=totalValue.toFixed(2);
  let totalProfit=invoices.reduce((s,i)=>s+i.profit,0);
  document.getElementById('total-profit').textContent=totalProfit.toFixed(2);
}

// -------------------------
// PRODUCTS
// -------------------------
function renderProducts(){
  productCards.innerHTML='';
  products.forEach((p,i)=>{
    const card=document.createElement('div'); card.classList.add('card');
    card.innerHTML=`
      <strong>${p.name}</strong><br>
      ${p.photo?`<img src="${p.photo}">`:''}<br>
      Qty: ${p.quantity} ${p.unit}<br>
      Purchase: ${p.purchasePrice} ${currencySelect.value}<br>
      Sell: ${p.sellPrice} ${currencySelect.value}<br>
      <button onclick="sellProduct(${i})">Sell</button>
      <button onclick="editProduct(${i})">Edit</button>
      <button onclick="deleteProduct(${i})">Delete</button>
      <button onclick="printLabel(${i})">Print Label</button>
    `;
    productCards.appendChild(card);
  });
  updateDashboard();
}

addProductBtn.addEventListener('click', ()=>{
  showModal(`
    <h3>Add Product</h3>
    Name:<input id="prod-name"><br>
    Quantity:<input id="prod-qty" type="number"><br>
    Unit:<input id="prod-unit" value="piece"><br>
    Purchase Price:<input id="prod-purchase" type="number"><br>
    Sell Price:<input id="prod-sell" type="number"><br>
    Conversion Units(JSON):<input id="prod-conv" placeholder='{"box":12,"carton":120}'><br>
    Photo:<input id="prod-photo" type="file" accept="image/*"><br>
    <button id="save-product">Save</button>
  `);
  document.getElementById('save-product').addEventListener('click',()=>{
    const name=document.getElementById('prod-name').value;
    const qty=parseInt(document.getElementById('prod-qty').value);
    const unit=document.getElementById('prod-unit').value;
    const purchasePrice=parseFloat(document.getElementById('prod-purchase').value);
    const sellPrice=parseFloat(document.getElementById('prod-sell').value);
    let convUnits={}; try{ convUnits=JSON.parse(document.getElementById('prod-conv').value); }catch{}
    const photoInput=document.getElementById('prod-photo');
    const reader=new FileReader();
    reader.onload=function(e){ products.push({name,quantity:qty,unit,purchasePrice,sellPrice,photo:e.target.result,conversionUnits:convUnits}); renderProducts(); closeModal(); };
    if(photoInput.files[0]) reader.readAsDataURL(photoInput.files[0]);
    else { products.push({name,quantity:qty,unit,purchasePrice,sellPrice,photo:'',conversionUnits:convUnits}); renderProducts(); closeModal(); }
  });
});

// -------------------------
// CLIENTS
// -------------------------
function renderClients(){
  clientCards.innerHTML='';
  clients.forEach((c,i)=>{
    const card=document.createElement('div'); card.classList.add('card');
    card.innerHTML=`
      ${c.photo?`<img src="${c.photo}">`:''}
      <strong>${c.name}</strong><br>
      <button onclick="editClient(${i})">Edit</button>
      <button onclick="deleteClient(${i})">Delete</button>
      <button onclick="scanID(${i})">Scan ID</button>
    `;
    clientCards.appendChild(card);
  });
}

addClientBtn.addEventListener('click', ()=>{
  showModal(`
    <h3>Add Client</h3>
    Name:<input id="client-name"><br>
    Photo:<input id="client-photo" type="file" accept="image/*"><br>
    <button id="save-client">Save</button>
  `);
  document.getElementById('save-client').addEventListener('click',()=>{
    const name=document.getElementById('client-name').value;
    const photoInput=document.getElementById('client-photo');
    const reader=new FileReader();
    reader.onload=function(e){ clients.push({name,photo:e.target.result,idData:{}}); renderClients(); closeModal(); };
    if(photoInput.files[0]) reader.readAsDataURL(photoInput.files[0]);
    else { clients.push({name,photo:'',idData:{}}); renderClients(); closeModal(); }
  });
});

// -------------------------
// SELL / INVOICES
// -------------------------
function sellProduct(i){
  const p=products[i];
  if(clients.length===0){ alert('Add a client first'); return; }
  let clientOptions=clients.map((c,idx)=>`<option value="${idx}">${c.name}</option>`).join('');
  showModal(`
    <h3>Sell Product</h3>
    Client:<select id="sell-client">${clientOptions}</select><br>
    Quantity:<input id="sell-qty" type="number" value="1"><br>
    Unit:<input id="sell-unit" value="${p.unit}"><br>
    <button id="confirm-sell">Sell</button>
  `);
  document.getElementById('confirm-sell').addEventListener('click',()=>{
    const clientIdx=parseInt(document.getElementById('sell-client').value);
    const qty=parseInt(document.getElementById('sell-qty').value);
    const unit=document.getElementById('sell-unit').value;
    let qtyInBase=qty;
    if(unit!==p.unit && p.conversionUnits[unit]) qtyInBase*=p.conversionUnits[unit];
    if(qtyInBase>p.quantity){ alert('Not enough stock'); return; }
    p.quantity-=qtyInBase;
    const profit=qtyInBase*(p.sellPrice-p.purchasePrice);
    invoices.push({ client:clients[clientIdx].name, product:p.name, qty, unit, price:p.sellPrice, profit, date:new Date(), paid:false });
    renderProducts(); renderInvoices(); closeModal();
  });
}

function renderInvoices(){
  invoiceList.innerHTML='';
  invoices.forEach(inv=>{
    const card=document.createElement('div'); card.classList.add('card');
    card.innerHTML=`
      ${inv.date.toLocaleString()}<br>
      Client: ${inv.client}<br>
      ${inv.product} x ${inv.qty} ${inv.unit} = ${inv.qty*inv.price} ${currencySelect.value}<br>
      Profit: ${inv.profit} ${currencySelect.value}<br>
      Paid: <input type="checkbox" ${inv.paid?'checked':''} onclick="togglePaid('${inv.date}')">
    `;
    invoiceList.appendChild(card);
  });
}

function togglePaid(dateStr){
  const inv=invoices.find(i=>i.date.toString()===dateStr);
  if(inv) inv.paid=!inv.paid;
}

// -------------------------
// CSV EXPORT
// -------------------------
exportCSVBtn.addEventListener('click', ()=>{
  let csv='Type,Name,Quantity,Unit,Price,Profit,Client,Date,Paid\n';
  invoices.forEach(inv=>{
    csv+=`Invoice,${inv.product},${inv.qty},${inv.unit},${inv.price},${inv.profit},${inv.client},${inv.date.toLocaleString()},${inv.paid}\n`;
  });
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='invoices.csv'; a.click(); URL.revokeObjectURL(url);
});

// -------------------------
// LABEL / OCR / BARCODE PLACEHOLDER
// -------------------------
function printLabel(i){
  const p=products[i];
  const win=window.open('','','width=300,height=200');
  win.document.write(`<h3>${p.name}</h3>Qty: ${p.quantity} ${p.unit}<br>Sell: ${p.sellPrice} ${currencySelect.value}`);
  win.print();
}

function scanID(i){
  alert('OCR ID scan not implemented in this demo. Use Tesseract.js or other library.');
}

// -------------------------
// INITIAL RENDER
// -------------------------
renderProducts(); renderClients(); renderInvoices();
