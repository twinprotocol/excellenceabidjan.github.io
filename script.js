/* script.js - Cyberpunk edition
   - Keeps all original functionality and IDs
   - Adds neon UI behaviors, smooth electric tab animation, toasts, ripple
   - Languages: en, fr, ar, es
*/

(() => {
  "use strict";

  /* ----------------------
     Data
     ---------------------- */
  let products = JSON.parse(localStorage.getItem("products")) || [];
  let stockLog = JSON.parse(localStorage.getItem("stockLog")) || [];
  let cameraData = null;
  let currentLang = localStorage.getItem('tp_lang') || 'en';

  /* ----------------------
     Elements
     ---------------------- */
  const el = id => document.getElementById(id);
  const productForm = el('productForm');
  const productTableBody = el('productTableBody');
  const searchInput = el('searchInput');
  const stockProductSelect = el('stockProductSelect');
  const stockQuantity = el('stockQuantity');
  const soldPriceInput = el('soldPriceInput');
  const addStockBtn = el('addStock');
  const sellStockBtn = el('sellStock');
  const filterDate = el('filterDate');
  const filterBtn = el('filterBtn');
  const salesTableBody = el('salesTableBody');
  const printSalesBtn = el('printSalesBtn');
  const takePhotoBtn = el('takePhotoBtn');
  const fabAddProduct = el('fabAddProduct');
  const exportCSVBtn = el('exportCSVBtn');
  const exportExcelBtn = el('exportExcelBtn');
  const importCSVBtn = el('importCSVBtn');
  const importCSVFile = el('importCSVFile');
  const shareWhatsAppBtn = el('shareWhatsAppBtn');
  const exportAllBtn = el('exportAllBtn');
  const importAllBtn = el('importAllBtn');
  const importAllFile = el('importAllFile');
  const totalProductsEl = el('totalProducts');
  const totalStockCFAEl = el('totalStockCFA');
  const totalSalesCFAEl = el('totalSalesCFA');
  const totalStockCFA_text = el('totalStockCFA');
  const totalSalesCFA_text = el('totalSalesCFA');
  const totalStockEl = el('totalStockCFA');
  const topProductsEl = el('topProducts');
  const lowStockEl = el('lowStock');
  const dailyTotalEl = el('dailyTotal');
  const langButtons = document.querySelectorAll('.lang-btn');

  /* ----------------------
     Translations
     ---------------------- */
  const translations = {
    en: {
      tab1: "Products", tab2: "Stock & Sales", tab3: "Export / Share",
      productFormTitle: "Add a product", productName: "Product name", productPrice: "Sale price (CFA)",
      productCost: "Cost price (CFA)", productStock: "Initial stock", productDiscount: "Discount (%)",
      productSupplier: "Supplier name", takePhotoBtn: "📷 Capture Photo", addProductBtn: "Add product",
      searchInput: "Search product...", dashboardTitle: "Dashboard",
      totalSales: "Total Sales", totalStock: "Stock Value", topProducts: "Top Products",
      lowStock: "Low Stock", manageStock: "Manage stock & sales", stockQuantity: "Quantity",
      soldPriceInput: "Sold price (if sale)", addStockBtn: "Add stock", sellStockBtn: "Sell",
      salesByDate: "Sales by date", filterBtn: "Filter", dailyTotal: "Daily total", printBtn: "🖨️ Print",
      exportCSVBtn: "Export CSV", exportExcelBtn: "Export Excel", importCSVBtn: "Import CSV",
      shareWhatsAppBtn: "Share WhatsApp", exportAllBtn: "Export ALL (JSON)", importAllBtn: "Import JSON"
    },
    fr: {
      tab1: "Produits", tab2: "Stock & Ventes", tab3: "Exporter / Partager",
      productFormTitle: "Ajouter un produit", productName: "Nom du produit", productPrice: "Prix de vente (CFA)",
      productCost: "Prix de revient (CFA)", productStock: "Stock initial", productDiscount: "Ristourne (%)",
      productSupplier: "Nom du fournisseur", takePhotoBtn: "📷 Prendre une photo", addProductBtn: "Ajouter produit",
      searchInput: "Rechercher produit...", dashboardTitle: "Tableau de bord",
      totalSales: "Total Ventes", totalStock: "Valeur Stock", topProducts: "Top Produits",
      lowStock: "Alertes Stock", manageStock: "Gestion du stock et ventes", stockQuantity: "Quantité",
      soldPriceInput: "Prix vendu (si vente)", addStockBtn: "Ajouter Stock", sellStockBtn: "Vendre",
      salesByDate: "Ventes par date", filterBtn: "Filtrer", dailyTotal: "Total du jour", printBtn: "🖨️ Imprimer",
      exportCSVBtn: "Exporter CSV", exportExcelBtn: "Exporter Excel", importCSVBtn: "Importer CSV",
      shareWhatsAppBtn: "Partager WhatsApp", exportAllBtn: "Exporter toutes les données (JSON)", importAllBtn: "Importer JSON"
    },
    es: {
      tab1: "Productos", tab2: "Stock y Ventas", tab3: "Exportar / Compartir",
      productFormTitle: "Agregar producto", productName: "Nombre del producto", productPrice: "Precio (CFA)",
      productCost: "Precio coste (CFA)", productStock: "Stock inicial", productDiscount: "Descuento (%)",
      productSupplier: "Proveedor", takePhotoBtn: "📷 Tomar foto", addProductBtn: "Agregar producto",
      searchInput: "Buscar producto...", dashboardTitle: "Tablero",
      totalSales: "Ventas totales", totalStock: "Valor stock", topProducts: "Top Productos",
      lowStock: "Stock bajo", manageStock: "Gestionar stock y ventas", stockQuantity: "Cantidad",
      soldPriceInput: "Precio vendido (si venta)", addStockBtn: "Agregar stock", sellStockBtn: "Vender",
      salesByDate: "Ventas por fecha", filterBtn: "Filtrar", dailyTotal: "Total del día", printBtn: "🖨️ Imprimir",
      exportCSVBtn: "Exportar CSV", exportExcelBtn: "Exportar Excel", importCSVBtn: "Importar CSV",
      shareWhatsAppBtn: "Compartir WhatsApp", exportAllBtn: "Exportar TODO (JSON)", importAllBtn: "Importar JSON"
    },
    ar: {
      tab1: "المنتجات", tab2: "المخزون و المبيعات", tab3: "تصدير / مشاركة",
      productFormTitle: "إضافة منتج", productName: "اسم المنتج", productPrice: "سعر البيع (CFA)",
      productCost: "سعر التكلفة (CFA)", productStock: "المخزون الأولي", productDiscount: "الخصم (%)",
      productSupplier: "اسم المورد", takePhotoBtn: "📷 التقط صورة", addProductBtn: "إضافة منتج",
      searchInput: "بحث عن المنتج...", dashboardTitle: "لوحة التحكم",
      totalSales: "إجمالي المبيعات", totalStock: "قيمة المخزون", topProducts: "أفضل المنتجات",
      lowStock: "تنبيهات المخزون", manageStock: "إدارة المخزون والمبيعات", stockQuantity: "الكمية",
      soldPriceInput: "سعر البيع (إذا بيع)", addStockBtn: "إضافة مخزون", sellStockBtn: "بيع",
      salesByDate: "المبيعات حسب التاريخ", filterBtn: "تصفية", dailyTotal: "إجمالي اليوم", printBtn: "🖨️ طباعة",
      exportCSVBtn: "تصدير CSV", exportExcelBtn: "تصدير Excel", importCSVBtn: "استيراد CSV",
      shareWhatsAppBtn: "مشاركة WhatsApp", exportAllBtn: "تصدير الكل (JSON)", importAllBtn: "استيراد JSON"
    }
  };

  /* ----------------------
     UI Utilities
     ---------------------- */

  function showToast(message, type = 'info') {
    const already = document.querySelector('.toast');
    if (already) already.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    if (type === 'success') t.classList.add('success');
    if (type === 'error') t.classList.add('error');
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(()=>t.remove(), 320); }, 2800);
  }

  // Replace native alert with toast (keeps compatibility)
  window.alert = (msg) => showToast(String(msg), 'info');

  function attachRipples() {
    document.querySelectorAll('button').forEach(btn => {
      if (btn.dataset.ripple) return;
      btn.dataset.ripple = "1";
      btn.addEventListener('click', function (e) {
        const r = document.createElement('span');
        r.className = 'ripple';
        const rect = this.getBoundingClientRect();
        r.style.left = (e.clientX - rect.left - 50) + 'px';
        r.style.top = (e.clientY - rect.top - 50) + 'px';
        this.appendChild(r);
        setTimeout(()=> r.remove(), 700);
      });
    });
  }

  /* Electric tab animation */
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.tab');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // electric flash effect
        tabBtns.forEach(b => b.classList.remove('active','electric'));
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active', 'electric');
        const id = btn.dataset.tab;
        const target = document.getElementById(id);
        // animate: fade and electric spark
        if (target) {
          // small electric overlay
          const spark = document.createElement('div');
          spark.style.position = 'absolute';
          spark.style.inset = 0;
          spark.style.pointerEvents = 'none';
          spark.style.background = 'linear-gradient(90deg, rgba(0,240,255,0.08), rgba(255,63,184,0.06))';
          spark.style.mixBlendMode = 'screen'; spark.style.opacity = '0';
          target.appendChild(spark);
          requestAnimationFrame(()=> { spark.style.transition = 'opacity .45s ease'; spark.style.opacity = '1'; });
          setTimeout(()=> { spark.style.opacity = '0'; setTimeout(()=> spark.remove(), 500); }, 260);
        }
        // show
        target && target.classList.add('active');
      });
    });
  }

  /* ----------------------
     Data Rendering
     ---------------------- */

  function renderProducts(filter = '') {
    productTableBody.innerHTML = '';
    products.forEach((p, i) => {
      if (filter && !p.name.toLowerCase().includes(filter.toLowerCase())) return;
      const tr = document.createElement('tr');
      const img = p.image ? `<img src="${p.image}" alt="${p.name}">` : '';
      tr.innerHTML = `
        <td>${img}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.price}</td>
        <td>${p.cost}</td>
        <td>${p.stock}</td>
        <td>${p.discount||0}%</td>
        <td>${escapeHtml(p.supplier||'')}</td>
        <td>${(p.stock*(p.cost||0))} CFA</td>
        <td><button class="btn-ghost delete-btn" data-i="${i}">Delete</button></td>
      `;
      productTableBody.appendChild(tr);
    });

    // Attach delete handlers
    productTableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.i);
        if (!Number.isFinite(idx)) return;
        const name = products[idx]?.name || 'Product';
        if (confirm(`Delete ${name} ?`)) {
          products.splice(idx,1); persistProducts(); showToast('Product deleted','success'); refreshAll();
        }
      });
    });

    // fill stock select
    stockProductSelect.innerHTML = '';
    products.forEach((p,i) => {
      const o = document.createElement('option'); o.value = i; o.textContent = p.name; stockProductSelect.appendChild(o);
    });

    totalProductsEl && (totalProductsEl.textContent = products.length);
    totalStockCFAEl && (totalStockCFAEl.textContent = products.reduce((s,p)=>s + (p.stock*(p.cost||0)),0) + ' CFA');

    attachRipples();
  }

  function renderSales(date = '') {
    salesTableBody.innerHTML = '';
    let total = 0;
    stockLog.forEach(s => {
      if (date && s.date !== date) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(s.name)}</td><td>${s.type}</td><td>${s.qty}</td><td>${s.price}</td><td>${s.date}</td><td>${s.qty*s.price}</td>`;
      salesTableBody.appendChild(tr);
      total += s.qty*s.price;
    });
    dailyTotalEl && (dailyTotalEl.textContent = total + ' CFA');
  }

  function updateDashboard() {
    // total sales
    const totalSales = stockLog.reduce((s,x)=> s + (x.qty*x.price), 0);
    totalSalesCFAEl && (totalSalesCFAEl.textContent = totalSales + ' CFA');

    // stock value
    const totalStockValue = products.reduce((s,p)=> s + (p.stock*(p.cost||0)), 0);
    totalStockCFA_text && (totalStockCFA_text.textContent = totalStockValue + ' CFA');

    // top products
    const counts = {};
    stockLog.forEach(s => { if (s.type === 'vente' || s.type === 'sale' || s.type === 'venta') counts[s.name] = (counts[s.name]||0) + s.qty; });
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(t=>`${t[0]}(${t[1]})`).join(', ');
    topProductsEl && (topProductsEl.textContent = top || '-');

    // low stock
    const low = products.filter(p => p.stock < 5).map(p => p.name).join(', ');
    lowStockEl && (lowStockEl.textContent = low || '-');
  }

  /* ----------------------
     Persistence
     ---------------------- */
  function persistProducts(){ localStorage.setItem('products', JSON.stringify(products)); }
  function persistStockLog(){ localStorage.setItem('stockLog', JSON.stringify(stockLog)); }
  function refreshAll(){ renderProducts(searchInput.value); renderSales(filterDate.value); updateDashboard(); persistProducts(); persistStockLog(); }

  /* ----------------------
     Add product
     ---------------------- */
  productForm && productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = el('productName').value.trim();
    const price = Number(el('productPrice').value);
    const cost = Number(el('productCost').value);
    const stock = Number(el('productStock').value);
    const discount = Number(el('productDiscount').value || 0);
    const supplier = el('productSupplier').value.trim();
    const fileEl = el('productImage');

    let image = cameraData || '';
    if (!image && fileEl && fileEl.files && fileEl.files[0]) {
      image = URL.createObjectURL(fileEl.files[0]);
    }

    products.push({name, price, cost, stock, discount, supplier, image});
    cameraData = null;
    productForm.reset();
    persistProducts();
    refreshAll();
    showToast('Product added','success');
  });

  /* ----------------------
     Search (debounced)
     ---------------------- */
  let debounce = null;
  if (searchInput) searchInput.addEventListener('input', ()=>{
    clearTimeout(debounce);
    debounce = setTimeout(()=> renderProducts(searchInput.value), 160);
  });

  /* ----------------------
     Stock add / sell
     ---------------------- */
  addStockBtn && addStockBtn.addEventListener('click', ()=>{
    const i = Number(stockProductSelect.value);
    const qty = Number(stockQuantity.value);
    if (!products[i]) { showToast('Invalid product','error'); return; }
    if (!Number.isFinite(qty) || qty <= 0) { showToast('Invalid quantity','error'); return; }
    products[i].stock = (Number(products[i].stock) || 0) + qty;
    persistProducts(); refreshAll(); showToast('Stock added','success');
  });

  sellStockBtn && sellStockBtn.addEventListener('click', ()=>{
    const i = Number(stockProductSelect.value);
    const qty = Number(stockQuantity.value);
    const price = Number(soldPriceInput.value);
    if (!products[i]) { showToast('Invalid product','error'); return; }
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) { showToast('Invalid qty or price','error'); return; }
    if (products[i].stock < qty) { showToast('Insufficient stock','error'); return; }
    products[i].stock -= qty;
    const entry = {name: products[i].name, type: 'vente', qty, price, date: new Date().toISOString().split('T')[0]};
    stockLog.push(entry);
    persistStockLog(); persistProducts(); refreshAll(); showToast('Sale recorded','success');
  });

  /* ----------------------
     Sales rendering and filter
     ---------------------- */
  filterBtn && filterBtn.addEventListener('click', ()=> { renderSales(filterDate.value); showToast('Filtered','info'); });

  /* ----------------------
     Print current tab
     ---------------------- */
  printSalesBtn && printSalesBtn.addEventListener('click', ()=>{
    const active = document.querySelector('.tab.active');
    if (!active) { showToast('Nothing to print','error'); return; }
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Report</title><style>body{font-family:Roboto,Helvetica;padding:10px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:6px;text-align:center}</style></head><body>${active.innerHTML}</body></html>`);
    w.document.close(); w.print();
  });

  /* ----------------------
     Export CSV
     ---------------------- */
  exportCSVBtn && exportCSVBtn.addEventListener('click', ()=>{
    let csv = 'Name,Type,Qty,Price,Date,Total\n';
    stockLog.forEach(s => csv += `${csvEscape(s.name)},${s.type},${s.qty},${s.price},${s.date},${s.qty*s.price}\n`);
    downloadBlob(csv, 'stock_log.csv', 'text/csv');
    showToast('CSV exported','success');
  });

  function csvEscape(t){ if (typeof t !== 'string') return t; if (t.includes(',')||t.includes('"')) return `"${t.replace(/"/g,'""')}"`; return t; }

  /* ----------------------
     Export Excel
     ---------------------- */
  exportExcelBtn && exportExcelBtn.addEventListener('click', ()=>{
    try {
      const ws = XLSX.utils.json_to_sheet(stockLog.map(s=>({Name:s.name, Type:s.type, Qty:s.qty, Price:s.price, Date:s.date, Total:s.qty*s.price})));
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'StockLog'); XLSX.writeFile(wb, 'stock_log.xlsx');
      showToast('Excel exported','success');
    } catch (err) { console.error(err); showToast('Excel export failed','error'); }
  });

  /* ----------------------
     Import CSV
     ---------------------- */
  importCSVBtn && importCSVBtn.addEventListener('click', ()=> importCSVFile.click());
  importCSVFile && importCSVFile.addEventListener('change', (e)=>{
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) { showToast('CSV empty or invalid','error'); return; }
      lines.shift();
      lines.forEach(line => {
        const cells = parseCsvLine(line);
        if (cells.length < 5) return;
        const [name,type,qty,price,date] = cells;
        stockLog.push({name,type,qty:Number(qty),price:Number(price),date});
      });
      persistStockLog(); renderSales(); showToast('CSV imported','success');
    };
    fr.readAsText(f);
    importCSVFile.value = '';
  });

  function parseCsvLine(line) {
    const out = []; let cur = ''; let inQ = false;
    for (let i=0;i<line.length;i++){
      const ch = line[i];
      if (ch === '"' ) { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { out.push(cur); cur=''; continue; }
      cur += ch;
    }
    if (cur) out.push(cur);
    return out.map(s=>s.trim());
  }

  /* ----------------------
     Export/Import ALL JSON
     ---------------------- */
  exportAllBtn && exportAllBtn.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify({products,stockLog},null,2)], {type:'application/json'});
    downloadBlob(blob, 'twin_protocol_data.json');
    showToast('All data exported','success');
  });

  importAllBtn && importAllBtn.addEventListener('click', ()=> importAllFile.click());
  importAllFile && importAllFile.addEventListener('change', (e)=>{
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = (ev)=>{
      try {
        const obj = JSON.parse(ev.target.result);
        if (Array.isArray(obj.products)) products = obj.products;
        if (Array.isArray(obj.stockLog)) stockLog = obj.stockLog;
        persistProducts(); persistStockLog(); refreshAll(); showToast('Data imported','success');
      } catch (err) { showToast('Invalid JSON file','error'); }
    };
    fr.readAsText(f); importAllFile.value = '';
  });

  function downloadBlob(blob, filename, type){
    const data = (blob instanceof Blob) ? blob : new Blob([blob], {type: type || 'application/octet-stream'});
    const url = URL.createObjectURL(data);
    const a = document.createElement('a'); a.href = url; a.download = filename || 'download';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  /* ----------------------
     WhatsApp Share
     ---------------------- */
  shareWhatsAppBtn && shareWhatsAppBtn.addEventListener('click', ()=>{
    let text = 'Stock & Sales Report:%0A';
    stockLog.forEach(s => text += `${s.date}: ${s.name} ${s.type} ${s.qty} x ${s.price} = ${s.qty*s.price} CFA%0A`);
    const url = 'https://wa.me/?text=' + encodeURIComponent(decodeURIComponent(text));
    window.open(url, '_blank');
  });

  /* ----------------------
     Camera capture (ImageCapture or fallback file)
     ---------------------- */
  takePhotoBtn && takePhotoBtn.addEventListener('click', async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video:true});
        const track = stream.getVideoTracks()[0];
        if (window.ImageCapture) {
          try {
            const ic = new ImageCapture(track);
            const blob = await ic.takePhoto();
            const fr = new FileReader();
            fr.onload = (e) => { cameraData = e.target.result; showToast('Photo captured','success'); };
            fr.readAsDataURL(blob);
          } catch (err) {
            // fallback frame capture
            const v = document.createElement('video'); v.srcObject = stream; await v.play().catch(()=>{});
            const c = document.createElement('canvas'); c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
            c.getContext('2d').drawImage(v,0,0); cameraData = c.toDataURL('image/png'); showToast('Photo captured','success');
            v.pause();
          }
        } else {
          const v = document.createElement('video'); v.srcObject = stream; await v.play().catch(()=>{});
          const c = document.createElement('canvas'); c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
          c.getContext('2d').drawImage(v,0,0); cameraData = c.toDataURL('image/png'); showToast('Photo captured','success');
          v.pause();
        }
        stream.getTracks().forEach(t=>t.stop());
      } catch (err) {
        // fallback to file input
        const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.capture='environment';
        inp.onchange = () => {
          const f = inp.files[0]; if (!f) return;
          const fr = new FileReader(); fr.onload = e => { cameraData = e.target.result; showToast('Photo captured','success'); };
          fr.readAsDataURL(f);
        };
        inp.click();
      }
    } else {
      // fallback
      const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.capture='environment';
      inp.onchange = () => {
        const f = inp.files[0]; if (!f) return;
        const fr = new FileReader(); fr.onload = e => { cameraData = e.target.result; showToast('Photo captured','success'); };
        fr.readAsDataURL(f);
      };
      inp.click();
    }
  });

  /* ----------------------
     FAB behavior
     ---------------------- */
  fabAddProduct && fabAddProduct.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=> { if (b.dataset.tab === 'tab1') b.click(); });
    const t = document.getElementById('tab1'); t && t.scrollIntoView({behavior:'smooth'});
  });

  /* ----------------------
     Helpers & init
     ---------------------- */
  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function refreshAll(){ renderProducts(searchInput.value); renderSales(filterDate.value); updateDashboard(); persistProducts(); persistStockLog(); }

  /* ----------------------
     Language handling (supports rtl)
     ---------------------- */
  function setLanguage(lang) {
    currentLang = lang; localStorage.setItem('tp_lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    const t = translations[lang] || translations.en;

    // Tabs
    document.querySelector('.tab-btn[data-tab="tab1"]').textContent = t.tab1;
    document.querySelector('.tab-btn[data-tab="tab2"]').textContent = t.tab2;
    document.querySelector('.tab-btn[data-tab="tab3"]').textContent = t.tab3;

    // Form & placeholders
    document.getElementById('productFormTitle').textContent = t.productFormTitle;
    el('productName').placeholder = t.productName;
    el('productPrice').placeholder = t.productPrice;
    el('productCost').placeholder = t.productCost;
    el('productStock').placeholder = t.productStock;
    el('productDiscount').placeholder = t.productDiscount;
    el('productSupplier').placeholder = t.productSupplier;
    el('takePhotoBtn').textContent = t.takePhotoBtn;
    document.querySelector('#productForm button[type="submit"]').textContent = t.addProductBtn;

    // Search
    searchInput.placeholder = t.searchInput;

    // Dashboard title (if exists)
    // Stock & sales texts
    document.querySelector('#tab2 .panel h2') && (document.querySelector('#tab2 .panel h2').textContent = t.dashboardTitle);
    // Manage stock section placeholders and buttons
    el('stockQuantity').placeholder = t.stockQuantity;
    el('soldPriceInput').placeholder = t.soldPriceInput;
    el('addStock').textContent = t.addStockBtn;
    el('sellStock').textContent = t.sellStockBtn;

    // Sales filters
    el('filterBtn').textContent = t.filterBtn;
    el('printSalesBtn').textContent = t.printBtn;

    // Exports
    el('exportCSVBtn').textContent = t.exportCSVBtn;
    el('exportExcelBtn').textContent = t.exportExcelBtn;
    el('importCSVBtn').textContent = t.importCSVBtn;
    el('shareWhatsAppBtn').textContent = t.shareWhatsAppBtn;
    el('exportAllBtn').textContent = t.exportAllBtn;
    el('importAllBtn').textContent = t.importAllBtn;

    // Direction
    if (lang === 'ar') { document.documentElement.dir = 'rtl'; document.body.dir = 'rtl'; } else { document.documentElement.dir = 'ltr'; document.body.dir = 'ltr'; }
  }

  document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', ()=> setLanguage(b.dataset.lang)));
  setLanguage(currentLang);

  /* ----------------------
     Attach ripples, tabs, initial render
     ---------------------- */
  attachRipples(); initTabs(); refreshAll();

  /* Keep ripples attached on DOM changes */
  new MutationObserver(()=> attachRipples()).observe(document.body, {childList:true, subtree:true});

  /* Save products/stockLog globally if needed */
  window.saveProducts = persistProducts;
  window._twin_protocol = { products, stockLog };

  /* Respond to storage events (if multiple tabs) */
  window.addEventListener('storage', (e) => {
    if (e.key === 'products') products = JSON.parse(e.newValue || '[]');
    if (e.key === 'stockLog') stockLog = JSON.parse(e.newValue || '[]');
    refreshAll();
  });

})();
