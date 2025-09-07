// --- Variables ---
let products = JSON.parse(localStorage.getItem('products')) || [];
let stockLog = JSON.parse(localStorage.getItem('stockLog')) || [];
let cameraData = null;

// Elements
const productForm = document.getElementById('productForm');
const productTableBody = document.getElementById('productTableBody');
const searchInput = document.getElementById('searchInput');
const stockProductSelect = document.getElementById('stockProductSelect');
const stockQuantity = document.getElementById('stockQuantity');
const soldPriceInput = document.getElementById('soldPriceInput');
const addStockBtn = document.getElementById('addStock');
const sellStockBtn = document.getElementById('sellStock');
const filterDate = document.getElementById('filterDate');
const filterBtn = document.getElementById('filterBtn');
const salesTableBody = document.getElementById('salesTableBody');
const printSalesBtn = document.getElementById('printSalesBtn');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const fabAddProduct = document.getElementById('fabAddProduct');
const exportCSVBtn = document.getElementById('exportCSVBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const importCSVBtn = document.getElementById('importCSVBtn');
const importCSVFile = document.getElementById('importCSVFile');
const shareWhatsAppBtn = document.getElementById('shareWhatsAppBtn');

// --- Tabs ---
document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// --- FAB Scroll ---
fabAddProduct.addEventListener('click', ()=>{
    document.querySelector('.tab-btn[data-tab="tab1"]').click();
    productForm.scrollIntoView({behavior:'smooth'});
});

// --- Camera ---
takePhotoBtn.addEventListener('click', async ()=>{
    try{
        const stream=await navigator.mediaDevices.getUserMedia({video:true});
        const track=stream.getVideoTracks()[0];
        const imageCapture=new ImageCapture(track);
        const bitmap=await imageCapture.takePhoto();
        const canvas=document.createElement('canvas');
        canvas.width=bitmap.width; canvas.height=bitmap.height;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(bitmap,0,0);
        cameraData=canvas.toDataURL('image/png');
        track.stop();
        alert('Photo capturée !');
    }catch(e){ alert('Erreur caméra: '+e.message);}
});

// --- Products ---
function renderProducts(filter=''){
    productTableBody.innerHTML='';
    products.forEach((p,i)=>{
        if(!p.name.toLowerCase().includes(filter.toLowerCase())) return;
        const row=document.createElement('tr');
        row.innerHTML=`
            <td>${p.image?'<img src="'+p.image+'">':''}</td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.cost}</td>
            <td>${p.stock}</td>
            <td>${p.discount||0}%</td>
            <td>${p.supplier||''}</td>
            <td>${p.stock*p.cost} CFA</td>
            <td><button onclick="deleteProduct(${i})">Supprimer</button></td>
        `;
        productTableBody.appendChild(row);
    });
    stockProductSelect.innerHTML='';
    products.forEach((p,i)=>{
        const opt=document.createElement('option'); opt.value=i; opt.textContent=p.name; stockProductSelect.appendChild(opt);
    });
}

function deleteProduct(i){ products.splice(i,1); saveProducts(); }

function saveProducts(){ localStorage.setItem('products',JSON.stringify(products)); renderProducts(searchInput.value); }

// Add product
productForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name=document.getElementById('productName').value;
    const price=Number(document.getElementById('productPrice').value);
    const cost=Number(document.getElementById('productCost').value);
    const stock=Number(document.getElementById('productStock').value);
    const discount=Number(document.getElementById('productDiscount').value);
    const supplier=document.getElementById('productSupplier').value;
    const image=cameraData || (document.getElementById('productImage').files[0]?URL.createObjectURL(document.getElementById('productImage').files[0]):'');
    products.push({name,price,cost,stock,discount,supplier,image});
    cameraData=null; productForm.reset();
    saveProducts();
});

// --- Search ---
searchInput.addEventListener('input', ()=>renderProducts(searchInput.value));

// --- Stock / Sell ---
addStockBtn.addEventListener('click', ()=>{
    const i=Number(stockProductSelect.value), qty=Number(stockQuantity.value);
    if(isNaN(qty)||qty<=0){ alert('Quantité invalide'); return;}
    products[i].stock+=qty; saveProducts();
});

sellStockBtn.addEventListener('click', ()=>{
    const i=Number(stockProductSelect.value), qty=Number(stockQuantity.value), price=Number(soldPriceInput.value);
    if(isNaN(qty)||qty<=0||isNaN(price)||price<=0){ alert('Quantité ou prix invalide'); return;}
    if(products[i].stock<qty){ alert('Stock insuffisant'); return;}
    products[i].stock-=qty;
    stockLog.push({name:products[i].name,type:'vente',qty,price,date:new Date().toISOString().split('T')[0]});
    localStorage.setItem('stockLog',JSON.stringify(stockLog));
    saveProducts(); renderSales(filterDate.value);
});

// --- Render sales by date ---
function renderSales(date=''){
    salesTableBody.innerHTML='';
    let total=0;
    stockLog.forEach(s=>{
        if(date && s.date!==date) return;
        const row=document.createElement('tr');
        row.innerHTML=`<td>${s.name}</td><td>${s.type}</td><td>${s.qty}</td><td>${s.price}</td><td>${s.date}</td><td>${s.qty*s.price}</td>`;
        salesTableBody.appendChild(row);
        total+=s.qty*s.price;
    });
    document.getElementById('dailyTotal').textContent=total+' CFA';
}

filterBtn.addEventListener('click', ()=>{ renderSales(filterDate.value); });

// --- Print (only current table) ---
printSalesBtn.addEventListener('click', ()=>{
    const printContent=document.querySelector('.tab.active').innerHTML;
    const w=window.open(); w.document.write('<html><head><title>Rapport</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:5px;text-align:center;}h2{margin-bottom:10px;}</style></head><body>'+printContent+'</body></html>');
    w.document.close(); w.print();
});

// --- Export CSV ---
exportCSVBtn.addEventListener('click', ()=>{
    let csv='Nom,Type,Quantité,Prix,Date,Total\n';
    stockLog.forEach(s=>{ csv+=`${s.name},${s.type},${s.qty},${s.price},${s.date},${s.qty*s.price}\n`; });
    const blob=new Blob([csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='stock_log.csv'; a.click(); URL.revokeObjectURL(url);
});

// --- Export Excel ---
exportExcelBtn.addEventListener('click', ()=>{
    const ws=XLSX.utils.json_to_sheet(stockLog);
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'StockLog');
    XLSX.writeFile(wb,'stock_log.xlsx');
});

// --- Import CSV ---
importCSVBtn.addEventListener('click', ()=>importCSVFile.click());
importCSVFile.addEventListener('change', e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=function(evt){
        const lines=evt.target.result.split('\n'); lines.shift();
        lines.forEach(l=>{
            const [name,type,qty,price,date]=l.split(',');
            if(name) stockLog.push({name,type,qty:Number(qty),price:Number(price),date});
        });
        localStorage.setItem('stockLog',JSON.stringify(stockLog));
        renderSales(filterDate.value);
    };
    reader.readAsText(file);
});

// --- WhatsApp Share ---
shareWhatsAppBtn.addEventListener('click', ()=>{
    let text='Rapport Stock & Ventes:%0A';
    stockLog.forEach(s=>{
        text+=`${s.date}: ${s.name} ${s.type} ${s.qty} x ${s.price} = ${s.qty*s.price} CFA%0A`;
    });
    window.open('https://wa.me/?text='+text,'_blank');
});

// --- Initial render ---
renderProducts(); renderSales();
function updateDashboard(){
    // Total sales
    let totalSales=0;
    stockLog.forEach(s=>{ totalSales+=s.qty*s.price; });
    document.getElementById('totalSalesCFA').textContent=totalSales+' CFA';

    // Total stock value
    let totalStockValue=0;
    products.forEach(p=>{ totalStockValue+=p.stock*p.cost; });
    document.getElementById('totalStockCFA').textContent=totalStockValue+' CFA';

    // Top products (by quantity sold)
    let top={}; stockLog.forEach(s=>{
        if(s.type==='vente') top[s.name]=(top[s.name]||0)+s.qty;
    });
    let topProductsArr=Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,3);
    document.getElementById('topProducts').textContent=topProductsArr.map(t=>t[0]+'('+t[1]+')').join(', ') || '-';

    // Low stock alerts (<5 items)
    let low=products.filter(p=>p.stock<5).map(p=>p.name).join(', ');
    document.getElementById('lowStock').textContent=low || '-';
}

// Call dashboard update after every change
function refreshAll(){
    renderProducts(searchInput.value);
    renderSales(filterDate.value);
    updateDashboard();
}

// Replace all saveProducts calls with refreshAll
function saveProducts(){ localStorage.setItem('products',JSON.stringify(products)); refreshAll(); }

// Call initially
refreshAll();
// --- Camera / Upload ---
takePhotoBtn.addEventListener('click', async () => {
    // Crée un input de type file temporaire pour caméra
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // ouvre la caméra si possible
    input.onchange = () => {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                cameraData = e.target.result; // base64 image
                alert('Photo capturée !');
            }
            reader.readAsDataURL(file);
        }
    };
    input.click();
});
const translations = {
    fr: {
        "tab1": "Produits",
        "tab2": "Stock & Ventes",
        "tab3": "Export / Partage",
        "productFormTitle": "Ajouter un produit",
        "productName": "Nom du produit",
        "productPrice": "Prix de vente (CFA)",
        "productCost": "Prix de revient (CFA)",
        "productStock": "Stock initial",
        "productDiscount": "Ristourne (%)",
        "productSupplier": "Nom du fournisseur",
        "takePhotoBtn": "📷 Prendre une photo",
        "addProductBtn": "Ajouter produit",
        "searchInput": "Rechercher produit...",
        "dashboardTitle": "Tableau de bord",
        "totalSales": "Total Ventes",
        "totalStock": "Valeur Stock",
        "topProducts": "Top Produits",
        "lowStock": "Alertes Stock",
        "manageStock": "Gestion du stock et ventes",
        "stockQuantity": "Quantité",
        "soldPriceInput": "Prix vendu (si vente)",
        "addStockBtn": "Ajouter Stock",
        "sellStockBtn": "Vendre",
        "salesByDate": "Ventes par date",
        "filterBtn": "Filtrer",
        "dailyTotal": "Total du jour",
        "printBtn": "🖨️ Imprimer",
        "exportCSVBtn": "Exporter CSV",
        "exportExcelBtn": "Exporter Excel",
        "importCSVBtn": "Importer CSV",
        "shareWhatsAppBtn": "Partager WhatsApp"
    },
    ar: {
        "tab1": "المنتجات",
        "tab2": "المخزون والمبيعات",
        "tab3": "تصدير / مشاركة",
        "productFormTitle": "إضافة منتج",
        "productName": "اسم المنتج",
        "productPrice": "سعر البيع (CFA)",
        "productCost": "سعر التكلفة (CFA)",
        "productStock": "المخزون الأولي",
        "productDiscount": "الخصم (%)",
        "productSupplier": "اسم المورد",
        "takePhotoBtn": "📷 التقط صورة",
        "addProductBtn": "إضافة المنتج",
        "searchInput": "بحث عن المنتج...",
        "dashboardTitle": "لوحة التحكم",
        "totalSales": "إجمالي المبيعات",
        "totalStock": "قيمة المخزون",
        "topProducts": "أفضل المنتجات",
        "lowStock": "تنبيهات المخزون",
        "manageStock": "إدارة المخزون والمبيعات",
        "stockQuantity": "الكمية",
        "soldPriceInput": "سعر البيع (إذا تم البيع)",
        "addStockBtn": "إضافة مخزون",
        "sellStockBtn": "بيع",
        "salesByDate": "المبيعات حسب التاريخ",
        "filterBtn": "تصفية",
        "dailyTotal": "إجمالي اليوم",
        "printBtn": "🖨️ طباعة",
        "exportCSVBtn": "تصدير CSV",
        "exportExcelBtn": "تصدير Excel",
        "importCSVBtn": "استيراد CSV",
        "shareWhatsAppBtn": "مشاركة WhatsApp"
    }
};

let currentLang = 'fr';
function updateLanguage(lang){
    currentLang = lang;
    const t = translations[lang];

    // Tabs
    document.querySelector('.tab-btn[data-tab="tab1"]').textContent = t.tab1;
    document.querySelector('.tab-btn[data-tab="tab2"]').textContent = t.tab2;
    document.querySelector('.tab-btn[data-tab="tab3"]').textContent = t.tab3;

    // Product form labels & buttons
    document.querySelector('#productForm h2').textContent = t.productFormTitle;
    document.getElementById('productName').placeholder = t.productName;
    document.getElementById('productPrice').placeholder = t.productPrice;
    document.getElementById('productCost').placeholder = t.productCost;
    document.getElementById('productStock').placeholder = t.productStock;
    document.getElementById('productDiscount').placeholder = t.productDiscount;
    document.getElementById('productSupplier').placeholder = t.productSupplier;
    document.getElementById('takePhotoBtn').textContent = t.takePhotoBtn;
    document.querySelector('#productForm button[type="submit"]').textContent = t.addProductBtn;

    // Search
    document.getElementById('searchInput').placeholder = t.searchInput;

    // Dashboard
    document.querySelector('#dashboard h2').textContent = t.dashboardTitle;
    document.querySelectorAll('#dashboard .card')[0].childNodes[0].textContent = t.totalSales + ': ';
    document.querySelectorAll('#dashboard .card')[1].childNodes[0].textContent = t.totalStock + ': ';
    document.querySelectorAll('#dashboard .card')[2].childNodes[0].textContent = t.topProducts + ': ';
    document.querySelectorAll('#dashboard .card')[3].childNodes[0].textContent = t.lowStock + ': ';

    // Stock & Sales
    document.querySelector('#tab2 section:nth-of-type(2) h2').textContent = t.manageStock;
    document.getElementById('stockQuantity').placeholder = t.stockQuantity;
    document.getElementById('soldPriceInput').placeholder = t.soldPriceInput;
    document.getElementById('addStock').textContent = t.addStockBtn;
    document.getElementById('sellStock').textContent = t.sellStockBtn;

    // Sales by date
    document.querySelector('#tab2 section:nth-of-type(3) h2').textContent = t.salesByDate;
    document.getElementById('filterBtn').textContent = t.filterBtn;
    document.getElementById('printSalesBtn').textContent = t.printBtn;

    // Export / Share
    document.getElementById('exportCSVBtn').textContent = t.exportCSVBtn;
    document.getElementById('exportExcelBtn').textContent = t.exportExcelBtn;
    document.getElementById('importCSVBtn').textContent = t.importCSVBtn;
    document.getElementById('shareWhatsAppBtn').textContent = t.shareWhatsAppBtn;
}
document.getElementById('languageToggle').addEventListener('click', ()=>{
    if(currentLang==='fr') updateLanguage('ar');
    else updateLanguage('fr');
});
