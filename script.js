/* Complete app script
   - stable tab switching
   - translations FR/EN/AR
   - responsive scaling
   - products, stock moves, sales by date
   - clients, unpaid sales
   - CSV/Excel export & import
   - WhatsApp share & print report
*/
document.addEventListener('DOMContentLoaded', ()=>{

  /* ---------- quick helpers ---------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const uid = ()=> 'id'+Math.random().toString(36).slice(2,9);
  const fmt = n => Number(n||0).toLocaleString() + ' CFA';
  const todayISO = ()=> (new Date()).toISOString().slice(0,10);
  const readFileAsDataURL = file => new Promise((res,rej)=>{
    const fr = new FileReader(); fr.onload = e=>res(e.target.result); fr.onerror=rej; fr.readAsDataURL(file);
  });

  /* ---------- storage keys ---------- */
  const LS_PRODUCTS = 'ea_products_v2';
  const LS_LOG = 'ea_stocklog_v2';
  const LS_CLIENTS = 'ea_clients_v2';

  /* ---------- data ---------- */
  let products = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
  let stockLog = JSON.parse(localStorage.getItem(LS_LOG) || '[]');
  let clients = JSON.parse(localStorage.getItem(LS_CLIENTS) || '[]');

  /* ---------- elements ---------- */
  const langSelect = $('#langSelect');
  const tabBtns = $$('.tab-btn');
  const tabs = $$('.tab');
  const fab = $('#fab');

  // Products form
  const productForm = $('#productForm');
  const p_name = $('#p_name'), p_category = $('#p_category'), p_supplier = $('#p_supplier');
  const p_price = $('#p_price'), p_cost = $('#p_cost'), p_stock = $('#p_stock'), p_discount = $('#p_discount');
  const p_image = $('#p_image');
  const saveProductBtn = $('#saveProduct'), cancelProductBtn = $('#cancelProduct');
  const productsTbody = $('#productsTable tbody');
  const searchBox = $('#searchBox'), filterCategory = $('#filterCategory'), minPrice = $('#minPrice'), maxPrice = $('#maxPrice'), clearFilters = $('#clearFilters');

  // Stock / sales
  const selProduct = $('#selProduct'), moveQty = $('#moveQty'), moveType = $('#moveType'), movePrice = $('#movePrice'), selClient = $('#selClient'), creditSaleChk = $('#creditSale');
  const btnRecord = $('#btnRecord'), btnSell = $('#btnSell');

  // Reports
  const reportDate = $('#reportDate'), applyFilter = $('#applyFilter'), reportTableBody = $('#reportTable tbody'), reportSum = $('#reportSum'), btnPrint = $('#btnPrint');

  // Clients
  const clientForm = $('#clientForm'), c_name = $('#c_name'), c_phone = $('#c_phone'), c_email = $('#c_email'), c_note = $('#c_note');
  const clientsTbody = $('#clientsTable tbody'), unpaidTbody = $('#unpaidTable tbody'), clientSearch = $('#clientSearch');

  // Export/import/share
  const exportProdCSV = $('#exportProdCSV'), exportLogCSV = $('#exportLogCSV'), exportExcel = $('#exportExcel');
  const importProdFile = $('#importProdFile'), importProducts = $('#importProducts');
  const shareProducts = $('#shareProducts'), shareDaily = $('#shareDaily');

  /* ---------- translations ---------- */
  const translations = {
    fr: {
      tab_products:'Produits', tab_stock:'Stock & Ventes', tab_clients:'Clients', tab_export:'Export',
      add_product_title:'Ajouter un produit', ph_name:'Nom du produit', ph_category:'Catégorie', ph_supplier:'Fournisseur',
      ph_price:'Prix vente (CFA)', ph_cost:'Prix de revient (CFA)', ph_stock:'Stock initial', ph_discount:'Ristourne (%)',
      note_camera:'Ou choisissez une image / utilisez la caméra',
      btn_add:'Ajouter', btn_cancel:'Annuler', ph_search:'Recherche (nom,fournisseur,catégorie)', btn_clear:'Réinitialiser',
      col_name:'Nom', col_cat:'Catégorie', col_supplier:'Fournisseur', col_price:'Prix', col_cost:'Coût', col_stock:'Stock', col_discount:'Rist.', col_actions:'Actions',
      dashboard_title:'Tableau de bord', dash_total_sales:'Total ventes:', dash_stock_value:'Valeur stock:', dash_top:'Top ventes:', dash_low:'Alertes stock:',
      manage_stock_title:'Gestion stock & vente', label_credit:'Vente à crédit', note_stock:'Utilisez Entrée pour ajouter stock, Vente pour retirer. Pour vente: saisir prix si différent.',
      btn_record:'Enregistrer', btn_sell:'Vendre', sales_by_date:'Ventes & entrées par date', btn_filter:'Afficher', btn_print:'Imprimer rapport',
      clients_title:'Clients', clients_accounts:'Comptes & créances', unpaid_sales:'Ventes non payées', btn_add_client:'Ajouter client',
      export_title:'Export / Import', btn_export_products:'Exporter produits (CSV)', btn_export_log:'Exporter mouvements (CSV)', btn_export_excel:'Exporter Excel',
      btn_import_products:'Importer produits (CSV)', note_csv:'CSV: name,category,supplier,price,cost,stock,discount',
      btn_share_products:'Partager produits (WhatsApp)', btn_share_report:'Partager rapport', label_qty_invalid:'Quantité invalide', label_price_invalid:'Prix invalide', label_stock_insuff:'Stock insuffisant'
    },
    en: {
      tab_products:'Products', tab_stock:'Stock & Sales', tab_clients:'Clients', tab_export:'Export',
      add_product_title:'Add product', ph_name:'Product name', ph_category:'Category', ph_supplier:'Supplier',
      ph_price:'Sale price (CFA)', ph_cost:'Cost price (CFA)', ph_stock:'Initial stock', ph_discount:'Discount (%)',
      note_camera:'Or pick an image / use camera', btn_add:'Add', btn_cancel:'Cancel', ph_search:'Search (name,supplier,category)', btn_clear:'Clear',
      col_name:'Name', col_cat:'Category', col_supplier:'Supplier', col_price:'Price', col_cost:'Cost', col_stock:'Stock', col_discount:'Disc.', col_actions:'Actions',
      dashboard_title:'Dashboard', dash_total_sales:'Total sales:', dash_stock_value:'Stock value:', dash_top:'Top sales:', dash_low:'Low stock:',
      manage_stock_title:'Manage stock & sales', label_credit:'Credit sale', note_stock:'Use Entry to add stock, Sale to remove. For sales: enter price when different.',
      btn_record:'Record', btn_sell:'Sell', sales_by_date:'Sales & entries by date', btn_filter:'Show', btn_print:'Print report',
      clients_title:'Clients', clients_accounts:'Accounts & Credits', unpaid_sales:'Unpaid sales', btn_add_client:'Add client',
      export_title:'Export / Import', btn_export_products:'Export products (CSV)', btn_export_log:'Export logs (CSV)', btn_export_excel:'Export Excel',
      btn_import_products:'Import products (CSV)', note_csv:'CSV: name,category,supplier,price,cost,stock,discount',
      btn_share_products:'Share products (WhatsApp)', btn_share_report:'Share report', label_qty_invalid:'Invalid quantity', label_price_invalid:'Invalid price', label_stock_insuff:'Insufficient stock'
    },
    ar: {
      tab_products:'المنتجات', tab_stock:'المخزون والمبيعات', tab_clients:'العملاء', tab_export:'تصدير',
      add_product_title:'إضافة منتج', ph_name:'اسم المنتج', ph_category:'الفئة', ph_supplier:'المورد',
      ph_price:'سعر البيع (CFA)', ph_cost:'سعر التكلفة (CFA)', ph_stock:'المخزون الابتدائي', ph_discount:'الخصم (%)',
      note_camera:'أو اختر صورة / استخدم الكاميرا', btn_add:'إضافة', btn_cancel:'إلغاء', ph_search:'بحث (الاسم/المورد/الفئة)', btn_clear:'إعادة تعيين',
      col_name:'الاسم', col_cat:'الفئة', col_supplier:'المورد', col_price:'السعر', col_cost:'التكلفة', col_stock:'المخزون', col_discount:'الخصم', col_actions:'إجراءات',
      dashboard_title:'لوحة التحكم', dash_total_sales:'إجمالي المبيعات:', dash_stock_value:'قيمة المخزون:', dash_top:'الأكثر مبيعاً:', dash_low:'تنبيهات المخزون:',
      manage_stock_title:'إدارة المخزون والمبيعات', label_credit:'بيع بالدين', note_stock:'استخدم إدخال لإضافة المخزون، بيع لإزالته. للمبيعات: أدخل السعر لو اختلف.',
      btn_record:'حفظ', btn_sell:'بيع', sales_by_date:'المبيعات حسب التاريخ', btn_filter:'عرض', btn_print:'طباعة التقرير',
      clients_title:'العملاء', clients_accounts:'الحسابات والديون', unpaid_sales:'مبيعات غير مسددة', btn_add_client:'إضافة عميل',
      export_title:'تصدير / استيراد', btn_export_products:'تصدير المنتجات (CSV)', btn_export_log:'تصدير السجلات (CSV)', btn_export_excel:'تصدير Excel',
      btn_import_products:'استيراد منتجات (CSV)', note_csv:'صيغة CSV: name,category,supplier,price,cost,stock,discount',
      btn_share_products:'مشاركة المنتجات (واتساب)', btn_share_report:'مشاركة التقرير', label_qty_invalid:'كمية غير صالحة', label_price_invalid:'سعر غير صالح', label_stock_insuff:'المخزون غير كاف'
    }
  };

  function applyTranslations(lang){
    const t = translations[lang] || translations.fr;
    // elements with data-i18n (text) and data-i18n-placeholder (placeholders)
    $$('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(t[key]) el.textContent = t[key];
    });
    $$('[data-i18n-placeholder]').forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder');
      if(t[key]) el.placeholder = t[key];
    });
    // update direction
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    // adjust language-specific elements placeholders that don't use data attributes
    // buttons:
    $('#saveProduct') && ( $('#saveProduct').textContent = t.btn_add );
    $('#cancelProduct') && ( $('#cancelProduct').textContent = t.btn_cancel );
    $('#clearFilters') && ( $('#clearFilters').textContent = t.btn_clear );
    $('#btnRecord') && ( $('#btnRecord').textContent = t.btn_record );
    $('#btnSell') && ( $('#btnSell').textContent = t.btn_sell );
    $('#applyFilter') && ( $('#applyFilter').textContent = t.btn_filter );
    $('#btnPrint') && ( $('#btnPrint').textContent = t.btn_print );
    $('#saveClient') && ( $('#saveClient').textContent = t.btn_add_client );
    $('#exportProdCSV') && ( $('#exportProdCSV').textContent = t.btn_export_products );
    $('#exportLogCSV') && ( $('#exportLogCSV').textContent = t.btn_export_log );
    $('#exportExcel') && ( $('#exportExcel').textContent = t.btn_export_excel );
    $('#importProducts') && ( $('#importProducts').textContent = t.btn_import_products );
    $('#shareProducts') && ( $('#shareProducts').textContent = t.btn_share_products );
    $('#shareDaily') && ( $('#shareDaily').textContent = t.btn_share_report );
    // some notes
    $$('[data-i18n="note_csv"]').forEach(el => el.textContent = t.note_csv);
  }

  // initialize language
  applyTranslations(langSelect.value || 'fr');
  langSelect.addEventListener('change', ()=> applyTranslations(langSelect.value));

  /* ---------- UI behaviour: tabs ---------- */
  tabBtns.forEach(btn=>{
    btn.addEventListener('click', ()=> {
      tabBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      tabs.forEach(t=>t.classList.remove('active'));
      const id = btn.getAttribute('data-tab');
      document.getElementById(id).classList.add('active');
      // scroll to top of content
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  /* ---------- auto scale for Android screens ---------- */
  function adjustScale(){
    // design base 360 width => adjust root font-size
    const w = Math.max(320, Math.min(window.innerWidth, 1080));
    const scale = w / 360;
    const base = 16;
    const newSize = Math.max(13, Math.min(20, base * scale));
    document.documentElement.style.fontSize = newSize + 'px';
  }
  window.addEventListener('resize', adjustScale);
  window.addEventListener('orientationchange', adjustScale);
  adjustScale();

  /* ---------- render helpers ---------- */
  function saveAll(){
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
    localStorage.setItem(LS_LOG, JSON.stringify(stockLog));
    localStorage.setItem(LS_CLIENTS, JSON.stringify(clients));
    refreshAll();
  }

  function refreshAll(){
    renderProducts();
    populateProductSelectors();
    renderSalesTable(reportDate.value || '');
    renderClients();
    updateDashboard();
  }

  /* ---------- PRODUCTS ---------- */
  let editingIndex = -1;
  async function readImageInput(fileInput){
    if(fileInput.files && fileInput.files[0]){
      return await readFileAsDataURL(fileInput.files[0]);
    }
    return '';
  }

  productForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = p_name.value.trim();
    if(!name) { alert('Name required'); return; }
    const entry = {
      id: editingIndex > -1 ? products[editingIndex].id : uid(),
      name,
      category: p_category.value.trim(),
      supplier: p_supplier.value.trim(),
      price: Number(p_price.value) || 0,
      cost: Number(p_cost.value) || 0,
      stock: Number(p_stock.value) || 0,
      discount: Number(p_discount.value) || 0,
      image: ''
    };
    // image
    if(p_image.files && p_image.files[0]) entry.image = await readFileAsDataURL(p_image.files[0]);
    else if(editingIndex > -1) entry.image = products[editingIndex].image || '';

    if(editingIndex > -1){
      products[editingIndex] = entry;
      editingIndex = -1;
    } else products.push(entry);

    productForm.reset();
    saveAll();
  });

  $('#cancelProduct').addEventListener('click', ()=>{ editingIndex=-1; productForm.reset(); });

  function renderProducts(){
    productsTbody.innerHTML = '';
    // gather filters
    const q = (searchBox.value||'').toLowerCase();
    const cat = filterCategory.value;
    const min = Number(minPrice.value) || -Infinity;
    const max = Number(maxPrice.value) || Infinity;
    products.forEach((p, idx)=>{
      if(q && !(p.name.toLowerCase().includes(q) || (p.supplier||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q))) return;
      if(cat && p.category !== cat) return;
      if(p.price < min || p.price > max) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.image?`<img src="${p.image}" />`:''}</td>
        <td>${p.name}</td>
        <td>${p.category||''}</td>
        <td>${p.supplier||''}</td>
        <td>${Number(p.price).toLocaleString()}</td>
        <td>${Number(p.cost).toLocaleString()}</td>
        <td>${p.stock}</td>
        <td>${p.discount||0}%</td>
        <td>
          <button class="edit" data-i="${idx}">✏️</button>
          <button class="del danger" data-i="${idx}">🗑️</button>
        </td>`;
      productsTbody.appendChild(tr);
    });
    // attach edit/delete handlers
    $$('.edit').forEach(b=> b.addEventListener('click', e=>{
      const i = Number(b.getAttribute('data-i')); loadEditProduct(i);
    }));
    $$('.del').forEach(b=> b.addEventListener('click', e=>{
      const i = Number(b.getAttribute('data-i'));
      if(confirm('Supprimer ce produit ?')) { products.splice(i,1); saveAll(); }
    }));

    // update categories filter
    const cats = Array.from(new Set(products.map(p=>p.category).filter(Boolean)));
    filterCategory.innerHTML = '<option value="">Toutes catégories</option>';
    cats.forEach(c=> { const o = document.createElement('option'); o.value=c; o.textContent=c; filterCategory.appendChild(o); });
  }

  function loadEditProduct(i){
    const p = products[i];
    editingIndex = i;
    p_name.value = p.name; p_category.value = p.category; p_supplier.value = p.supplier;
    p_price.value = p.price; p_cost.value = p.cost; p_stock.value = p.stock; p_discount.value = p.discount;
    // image left to file input selection if user wants to update
    $('html').scrollTop = 0;
  }

  searchBox.addEventListener('input', renderProducts);
  filterCategory.addEventListener('change', renderProducts);
  minPrice.addEventListener('input', renderProducts);
  maxPrice.addEventListener('input', renderProducts);
  clearFilters.addEventListener('click', ()=>{ searchBox.value=''; filterCategory.value=''; minPrice.value=''; maxPrice.value=''; renderProducts(); });

  /* ---------- product selectors & clients ---------- */
  function populateProductSelectors(){
    selProduct.innerHTML = '';
    $('#selClient').innerHTML = '<option value="">Client (optionnel)</option>';
    products.forEach((p,idx)=>{
      const o = document.createElement('option'); o.value = idx; o.textContent = `${p.name} (${p.stock})`; selProduct.appendChild(o);
    });
    clients.forEach(c=>{
      const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; $('#selClient').appendChild(o);
    });
  }

  /* ---------- Stock moves (entry / sale) ---------- */
  function handleMove(isSale=false){
    const pi = Number(selProduct.value);
    if(isNaN(pi)) return alert('Choisir produit');
    const qty = Number(moveQty.value);
    if(!qty || qty <= 0) return alert(translations[langSelect.value].label_qty_invalid || 'Quantité invalide');
    const price = Number(movePrice.value) || products[pi].price;
    const clientId = selClient.value || null;
    if(isSale){
      if(products[pi].stock < qty) return alert(translations[langSelect.value].label_stock_insuff || 'Stock insuffisant');
      products[pi].stock -= qty;
      stockLog.push({ date: todayISO(), productId: products[pi].id, productName: products[pi].name, type:'Vente', qty, price, clientId: creditSaleChk.checked ? clientId : null, paid: !creditSaleChk.checked});
      if(creditSaleChk.checked && clientId){
        const c = clients.find(x=>x.id===clientId); if(c) c.balance = (c.balance||0) + qty*price;
      }
    } else {
      products[pi].stock += qty;
      stockLog.push({ date: todayISO(), productId: products[pi].id, productName: products[pi].name, type:'Entrée', qty, price, clientId:null, paid:true});
    }
    moveQty.value=''; movePrice.value=''; saveAll();
  }
  $('#btnRecord').addEventListener('click', ()=> handleMove(false));
  $('#btnSell').addEventListener('click', ()=> handleMove(true));

  /* ---------- Sales report by date ---------- */
  function renderSalesTable(date=''){
    reportTableBody.innerHTML = '';
    let sum = 0;
    stockLog.filter(s => !date || s.date === date).forEach(s=>{
      const tr = document.createElement('tr');
      const clientName = s.clientId ? (clients.find(c=>c.id===s.clientId)||{}).name : '-';
      tr.innerHTML = `<td>${s.date}</td><td>${s.productName}</td><td>${s.type}</td><td>${s.qty}</td><td>${Number(s.price).toLocaleString()}</td><td>${Number(s.qty*s.price).toLocaleString()}</td><td>${clientName||'-'}</td>`;
      reportTableBody.appendChild(tr);
      sum += s.qty*s.price;
    });
    reportSum.textContent = fmt(sum);
  }
  applyFilter.addEventListener('click', ()=> renderSalesTable(reportDate.value || ''));

  btnPrint.addEventListener('click', ()=>{
    const date = reportDate.value || todayISO();
    renderSalesTable(date);
    // open printable window with only report table
    const w = window.open('','_blank');
    const html = `
      <html><head><title>Rapport ${date}</title>
      <style>body{font-family:Arial;}table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:6px;text-align:left}th{background:#eee}</style>
      </head><body><h3>Rapport ${date}</h3>${$('#reportTable').outerHTML}<p>Total: ${reportSum.textContent}</p></body></html>`;
    w.document.write(html); w.document.close(); w.focus(); w.print();
  });

  /* ---------- Clients ---------- */
  clientForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const obj = { id: uid(), name: c_name.value.trim(), phone: c_phone.value.trim(), email: c_email.value.trim(), note: c_note.value.trim(), balance:0 };
    clients.push(obj); clientForm.reset(); saveAll();
  });

  function renderClients(){
    clientsTbody.innerHTML=''; unpaidTbody.innerHTML='';
    clients.forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.name}</td><td>${c.phone||''}</td><td>${c.email||''}</td><td>${fmt(c.balance)}</td><td><button data-clear="${c.id}">Effacer dette</button></td>`;
      clientsTbody.appendChild(tr);
    });
    // unpaid list
    stockLog.filter(s=>s.clientId && !s.paid).forEach((s, idx)=>{
      const client = clients.find(c=>c.id===s.clientId) || {};
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.date}</td><td>${client.name||'-'}</td><td>${s.productName}</td><td>${s.qty}</td><td>${s.price}</td><td>${s.qty*s.price}</td><td><button data-pay="${idx}">Marquer payé</button></td>`;
      unpaidTbody.appendChild(tr);
    });
    // attach handlers
    $$('[data-clear]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-clear'); const c = clients.find(x=>x.id===id);
      if(c && confirm('Marquer comme payé ?')) { c.balance = 0; saveAll(); }
    }));
    $$('[data-pay]').forEach(b=> b.addEventListener('click', ()=>{
      const idx = Number(b.getAttribute('data-pay'));
      // find the corresponding unpaid entry
      const unpaidEntries = stockLog.filter(s=>s.clientId && !s.paid);
      const entry = unpaidEntries[idx];
      if(!entry) return;
      const client = clients.find(c=>c.id===entry.clientId);
      if(client){ client.balance = Math.max(0, client.balance - entry.qty*entry.price); }
      entry.paid = true; entry.clientId = null;
      saveAll();
    }));
  }

  /* ---------- Export / Import / Share ---------- */
  function download(content, name, type='text/csv'){ const blob = new Blob([content], {type}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url); }

  exportProdCSV.addEventListener('click', ()=>{
    const csv = ['name,category,supplier,price,cost,stock,discount'].concat(products.map(p=>[
      `"${(p.name||'').replace(/"/g,'""')}"`,
      `"${(p.category||'').replace(/"/g,'""')}"`,
      `"${(p.supplier||'').replace(/"/g,'""')}"`,
      p.price, p.cost, p.stock, p.discount
    ].join(','))).join('\n');
    download(csv, 'products.csv');
  });

  exportLogCSV.addEventListener('click', ()=>{
    const csv = ['date,productName,type,qty,price,clientId'].concat(stockLog.map(s=>[
      s.date, `"${(s.productName||'').replace(/"/g,'""')}"`, s.type, s.qty, s.price, s.clientId || ''
    ].join(','))).join('\n');
    download(csv, 'stocklog.csv');
  });

  exportExcel.addEventListener('click', ()=>{
    // minimal Excel via SheetJS if available; otherwise fallback to CSV
    if(window.XLSX){
      const wb = XLSX.utils.book_new();
      wb.SheetNames.push('Products');
      const ws1 = XLSX.utils.json_to_sheet(products);
      XLSX.utils.book_append_sheet(wb, ws1, 'Products');
      const ws2 = XLSX.utils.json_to_sheet(stockLog);
      XLSX.utils.book_append_sheet(wb, ws2, 'StockLog');
      XLSX.writeFile(wb, 'excellence_export.xlsx');
    } else exportProdCSV.click();
  });

  importProducts.addEventListener('click', ()=> importProdFile.click());
  importProdFile.addEventListener('change', e=>{
    const f = e.target.files[0]; if(!f) return;
    const fr = new FileReader();
    fr.onload = evt=>{
      const lines = evt.target.result.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
      lines.slice(1).forEach(l=>{
        // rough CSV parse: split by comma, allow quoted values
        const parts = parseCSVLine(l);
        if(parts.length >= 7){
          products.push({ id: uid(), name: parts[0], category: parts[1], supplier: parts[2], price: Number(parts[3]||0), cost: Number(parts[4]||0), stock: Number(parts[5]||0), discount: Number(parts[6]||0), image: '' });
        }
      });
      saveAll();
    };
    fr.readAsText(f);
  });

  shareProducts.addEventListener('click', ()=>{
    let txt = 'Produits:\\n';
    products.forEach(p => txt += `${p.name} - ${p.stock} pcs - ${p.price} CFA\\n`);
    window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
  });
  shareDaily.addEventListener('click', ()=>{
    const date = reportDate.value || todayISO();
    const items = stockLog.filter(s=>s.date === date);
    let txt = `Rapport ${date}:\\n`;
    items.forEach(i => txt += `${i.productName} ${i.type} ${i.qty} x ${i.price} = ${i.qty*i.price} CFA\\n`);
    window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
  });

  function parseCSVLine(line){
    const out=[]; let cur='', inQ=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch === '"' ){ if(inQ && line[i+1]==='"'){ cur+='"'; i++; } else { inQ=!inQ; } continue; }
      if(ch===',' && !inQ){ out.push(cur); cur=''; continue; }
      cur+=ch;
    }
    out.push(cur); return out.map(x=>x.trim());
  }

  /* ---------- utilities: update dashboard ---------- */
  function updateDashboard(){
    const total = stockLog.filter(s=>s.type==='Vente').reduce((a,b)=>a + (b.qty*b.price), 0);
    $('#dashTotalSales').textContent = fmt(total);
    const stockValue = products.reduce((a,b)=> a + (b.cost * (b.stock||0)), 0);
    $('#dashStockValue').textContent = fmt(stockValue);
    const top = {};
    stockLog.filter(s=>s.type==='Vente').forEach(s => top[s.productName] = (top[s.productName]||0) + s.qty);
    const topArr = Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>`${x[0]}(${x[1]})`).join(', ');
    $('#dashTop').textContent = topArr || '-';
    const low = products.filter(p=>p.stock < 5).map(p=>p.name).slice(0,5).join(', ');
    $('#dashLow').textContent = low || '-';
    populateProductSelectors();
  }

  function populateProductSelectors(){
    selProduct.innerHTML = '';
    products.forEach((p,idx)=> { const o = document.createElement('option'); o.value = idx; o.textContent = `${p.name} (${p.stock})`; selProduct.appendChild(o); });
    selClient.innerHTML = '<option value="">Client (optionnel)</option>';
    clients.forEach(c=> { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; selClient.appendChild(o); });
  }

  /* ---------- clients rendering ---------- */
  function renderClients(){
    clientsTbody.innerHTML = '';
    unpaidTbody.innerHTML = '';
    const q = (clientSearch.value||'').toLowerCase();
    clients.filter(c=> !q || c.name.toLowerCase().includes(q)).forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.name}</td><td>${c.phone||''}</td><td>${c.email||''}</td><td>${fmt(c.balance||0)}</td><td><button data-clear="${c.id}">Effacer dette</button></td>`;
      clientsTbody.appendChild(tr);
    });
    $$$('[data-clear]').forEach(btn=> btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-clear'); const cc = clients.find(x=>x.id===id);
      if(cc && confirm('Effacer dette client ?')){ cc.balance = 0; saveAll(); }
    }));

    // unpaid list
    stockLog.filter(s=>s.clientId && s.type==='Vente' && !s.paid).forEach((s, idx)=>{
      const client = clients.find(c=>c.id===s.clientId) || {};
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.date}</td><td>${client.name||'-'}</td><td>${s.productName}</td><td>${s.qty}</td><td>${s.price}</td><td>${s.qty*s.price}</td><td><button data-pay="${idx}">Marquer payé</button></td>`;
      unpaidTbody.appendChild(tr);
    });
    $$$('[data-pay]').forEach(btn=> btn.addEventListener('click', ()=>{
      const idx = Number(btn.getAttribute('data-pay'));
      const unpaidList = stockLog.filter(s=>s.clientId && s.type==='Vente' && !s.paid);
      const entry = unpaidList[idx]; if(!entry) return;
      const client = clients.find(c=>c.id===entry.clientId);
      if(client) client.balance = Math.max(0, client.balance - entry.qty*entry.price);
      entry.paid = true; entry.clientId = null;
      saveAll();
    }));
  }

  clientSearch.addEventListener('input', renderClients);

  /* ---------- init ---------- */
  function initDataIfEmpty(){
    if(products.length === 0){
      // small sample data to test UI
      products.push({ id:uid(), name:'Eau minérale', category:'Boissons', supplier:'Fournisseur A', price:300, cost:150, stock:50, discount:0, image:''});
      products.push({ id:uid(), name:'Pain', category:'Boulangerie', supplier:'Boulangerie X', price:200, cost:100, stock:30, discount:0, image:''});
      saveAll();
    }
  }
  initDataIfEmpty();
  refreshAll();

  /* ---------- expose functions for debugging if needed ---------- */
  window.__app = { products, stockLog, clients, saveAll, refreshAll };

});
