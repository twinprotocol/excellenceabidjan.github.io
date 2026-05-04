var translations = {
    en: {
        dashboard: "Dashboard", inventory: "Inventory", sales: "Sales", purchases: "Purchases", reports: "Reports",
        products: "Products", stockValue: "Stock Value", lowStock: "Low Stock", todaySales: "Today Sales",
        addProduct: "Add Product", search: "Search products...", allCategories: "All Categories",
        product: "Product", category: "Category", brand: "Brand", price: "Price", stock: "Stock", actions: "Actions",
        edit: "Edit", delete: "Delete", cart: "Cart", salePrice: "Sale Price", total: "Total", qty: "Qty",
        completeSale: "Complete Sale", clearCart: "Clear Cart", restock: "Restock", save: "Save", cancel: "Cancel",
        recentSales: "Recent Sales", noSales: "No sales yet", noProducts: "No products found",
        emptyCart: "Cart is empty", outOfStock: "Out of stock", notEnoughStock: "Not enough stock",
        saved: "Product saved", deleted: "Product deleted", saleDone: "Sale completed", stockUpdated: "Stock updated",
        required: "Name, brand, and price are required", exportCSV: "Export CSV", reset: "Reset Data"
    },
    fr: {
        dashboard: "Tableau", inventory: "Inventaire", sales: "Ventes", purchases: "Achats", reports: "Rapports",
        products: "Produits", stockValue: "Valeur Stock", lowStock: "Stock Faible", todaySales: "Ventes du Jour",
        addProduct: "Ajouter Produit", search: "Rechercher produits...", allCategories: "Toutes Catégories",
        product: "Produit", category: "Catégorie", brand: "Marque", price: "Prix", stock: "Stock", actions: "Actions",
        edit: "Modifier", delete: "Supprimer", cart: "Panier", salePrice: "Prix Vente", total: "Total", qty: "Qté",
        completeSale: "Valider Vente", clearCart: "Vider Panier", restock: "Réapprovisionner", save: "Enregistrer", cancel: "Annuler",
        recentSales: "Ventes Récentes", noSales: "Aucune vente", noProducts: "Aucun produit",
        emptyCart: "Panier vide", outOfStock: "Rupture de stock", notEnoughStock: "Stock insuffisant",
        saved: "Produit enregistré", deleted: "Produit supprimé", saleDone: "Vente terminée", stockUpdated: "Stock mis à jour",
        required: "Nom, marque et prix requis", exportCSV: "Exporter CSV", reset: "Réinitialiser"
    },
    ar: {
        dashboard: "الرئيسية", inventory: "المخزون", sales: "المبيعات", purchases: "المشتريات", reports: "التقارير",
        products: "المنتجات", stockValue: "قيمة المخزون", lowStock: "مخزون منخفض", todaySales: "مبيعات اليوم",
        addProduct: "إضافة منتج", search: "ابحث عن المنتجات...", allCategories: "كل التصنيفات",
        product: "المنتج", category: "التصنيف", brand: "العلامة", price: "السعر", stock: "المخزون", actions: "الإجراءات",
        edit: "تعديل", delete: "حذف", cart: "السلة", salePrice: "سعر البيع", total: "المجموع", qty: "الكمية",
        completeSale: "إتمام البيع", clearCart: "مسح السلة", restock: "إعادة التخزين", save: "حفظ", cancel: "إلغاء",
        recentSales: "آخر المبيعات", noSales: "لا توجد مبيعات", noProducts: "لا توجد منتجات",
        emptyCart: "السلة فارغة", outOfStock: "نفد المخزون", notEnoughStock: "المخزون غير كاف",
        saved: "تم حفظ المنتج", deleted: "تم حذف المنتج", saleDone: "تم البيع", stockUpdated: "تم تحديث المخزون",
        required: "الاسم والعلامة والسعر مطلوبة", exportCSV: "تصدير CSV", reset: "إعادة ضبط"
    }
};

var categories = {
    guitars: { en: "Guitars", fr: "Guitares", ar: "الغيتارات" },
    keyboards: { en: "Keyboards", fr: "Claviers", ar: "الكيبوردات" },
    drums: { en: "Drums", fr: "Batteries", ar: "الطبول" },
    wind: { en: "Wind Instruments", fr: "Instruments à vent", ar: "آلات النفخ" },
    accessories: { en: "Accessories", fr: "Accessoires", ar: "الإكسسوارات" }
};

var currentLang = "en";
var currentPage = "dashboard";
var products = [];
var salesHistory = [];
var purchasesHistory = [];
var cart = [];
var editingId = null;
var searchText = "";
var selectedCategory = "all";

function seedData() {
    products = [
        { id: 1, names: { en: "FG800 Acoustic Guitar", fr: "Guitare acoustique FG800", ar: "غيتار أكوستيك FG800" }, brand: "Yamaha", category: "guitars", price: 45000, stock: 14, image: "" },
        { id: 2, names: { en: "P-125 Digital Piano", fr: "Piano numérique P-125", ar: "بيانو رقمي P-125" }, brand: "Yamaha", category: "keyboards", price: 135000, stock: 7, image: "" },
        { id: 3, names: { en: "DTX402 Drum Kit", fr: "Batterie électronique DTX402", ar: "طقم طبول DTX402" }, brand: "Yamaha", category: "drums", price: 210000, stock: 4, image: "" },
        { id: 4, names: { en: "YTR-2330 Trumpet", fr: "Trompette YTR-2330", ar: "ترومبيت YTR-2330" }, brand: "Yamaha", category: "wind", price: 68000, stock: 11, image: "" },
        { id: 5, names: { en: "SM58 Microphone", fr: "Microphone SM58", ar: "ميكروفون SM58" }, brand: "Shure", category: "accessories", price: 22000, stock: 28, image: "" }
    ];
    salesHistory = [];
    purchasesHistory = [];
    cart = [];
}

function loadData() {
    try {
        var savedProducts = localStorage.getItem("yb_products");
        var savedSales = localStorage.getItem("yb_sales");
        var savedPurchases = localStorage.getItem("yb_purchases");
        var savedLang = localStorage.getItem("yb_lang");

        if (savedProducts) products = JSON.parse(savedProducts);
        else seedData();

        if (savedSales) salesHistory = JSON.parse(savedSales);
        if (savedPurchases) purchasesHistory = JSON.parse(savedPurchases);
        if (savedLang) currentLang = savedLang;
    } catch (e) {
        seedData();
    }
}

function saveData() {
    localStorage.setItem("yb_products", JSON.stringify(products));
    localStorage.setItem("yb_sales", JSON.stringify(salesHistory));
    localStorage.setItem("yb_purchases", JSON.stringify(purchasesHistory));
    localStorage.setItem("yb_lang", currentLang);
}

function t(key) {
    return translations[currentLang][key] || key;
}

function nameOf(product) {
    return product.names[currentLang] || product.names.en;
}

function categoryName(key) {
    return categories[key] ? categories[key][currentLang] : key;
}

function money(value) {
    return Number(value || 0).toLocaleString("fr-FR") + " XOF";
}

function productIcon(product) {
    if (product.category === "keyboards") return "PI";
    if (product.category === "drums") return "DR";
    if (product.category === "wind") return "WI";
    if (product.category === "accessories") return "AC";
    return "GT";
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function navItems() {
    return [
        ["dashboard", "⌂", t("dashboard")],
        ["inventory", "□", t("inventory")],
        ["sales", "$", t("sales")],
        ["purchases", "+", t("purchases")],
        ["reports", "≡", t("reports")]
    ];
}

function renderNav() {
    var html = "";
    var mobile = "";

    navItems().forEach(function (item) {
        html += '<button class="nav-item ' + (currentPage === item[0] ? "active" : "") + '" onclick="navigateTo(\'' + item[0] + '\')"><span>' + item[1] + '</span><span>' + item[2] + '</span></button>';
        mobile += '<button class="' + (currentPage === item[0] ? "active" : "") + '" onclick="navigateTo(\'' + item[0] + '\')"><div>' + item[1] + '</div><div>' + item[2] + '</div></button>';
    });

    html += '<div style="margin-top:24px; display:grid; gap:10px;">';
    html += '<button class="btn primary" onclick="exportCSV()">' + t("exportCSV") + '</button>';
    html += '<button class="btn" onclick="resetData()">' + t("reset") + '</button>';
    html += '</div>';

    document.getElementById("sidebar").innerHTML = html;
    document.getElementById("mobile-nav").innerHTML = mobile;
}

function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    var main = document.getElementById("main");
    if (main) main.className = lang === "ar" ? "main rtl" : "main";

    ["en", "fr", "ar"].forEach(function (code) {
        var btn = document.getElementById("lang-" + code);
        if (btn) btn.className = code === lang ? "active" : "";
    });

    saveData();
    renderNav();
    renderPage();
}

function navigateTo(page) {
    currentPage = page;
    renderNav();
    renderPage();
}

function stats() {
    var today = new Date().toISOString().slice(0, 10);
    var todaySales = 0;
    var totalValue = 0;
    var lowStock = 0;

    products.forEach(function (p) {
        totalValue += p.price * p.stock;
        if (p.stock < 5) lowStock++;
    });

    salesHistory.forEach(function (s) {
        if (s.date.slice(0, 10) === today) todaySales += s.total;
    });

    return { totalValue: totalValue, lowStock: lowStock, todaySales: todaySales };
}

function filteredProducts() {
    var q = searchText.toLowerCase();

    return products.filter(function (p) {
        var matchSearch = nameOf(p).toLowerCase().indexOf(q) >= 0 || p.brand.toLowerCase().indexOf(q) >= 0;
        var matchCategory = selectedCategory === "all" || p.category === selectedCategory;
        return matchSearch && matchCategory;
    });
}

function renderPage() {
    if (currentPage === "dashboard") renderDashboard();
    if (currentPage === "inventory") renderInventory();
    if (currentPage === "sales") renderSales();
    if (currentPage === "purchases") renderPurchases();
    if (currentPage === "reports") renderReports();
}

function pageHead(title, subtitle, action) {
    return '<div class="page-head"><div><h2>' + title + '</h2><p>' + subtitle + '</p></div>' + (action || "") + '</div>';
}

function renderDashboard() {
    var s = stats();
    var recent = salesHistory.slice(-5).reverse();
    var low = products.filter(function (p) { return p.stock < 5; });

    var html = pageHead("YamahaBidjan", "Abidjan • " + new Date().toLocaleDateString(), '<button class="btn primary" onclick="navigateTo(\'sales\')">' + t("sales") + '</button>');

    html += '<div class="grid kpis">';
    html += '<div class="card"><div class="kpi-title">' + t("products") + '</div><div class="kpi-value">' + products.length + '</div></div>';
    html += '<div class="card"><div class="kpi-title">' + t("stockValue") + '</div><div class="kpi-value">' + money(s.totalValue) + '</div></div>';
    html += '<div class="card"><div class="kpi-title">' + t("lowStock") + '</div><div class="kpi-value low">' + s.lowStock + '</div></div>';
    html += '<div class="card"><div class="kpi-title">' + t("todaySales") + '</div><div class="kpi-value">' + money(s.todaySales) + '</div></div>';
    html += '</div>';

    html += '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); margin-top:14px;">';
    html += '<div class="panel"><h3>' + t("lowStock") + '</h3>';
    html += low.length ? low.map(function (p) { return '<p><b>' + nameOf(p) + '</b> <span class="badge low">' + p.stock + '</span></p>'; }).join("") : '<div class="empty">' + t("noProducts") + '</div>';
    html += '</div>';

    html += '<div class="panel"><h3>' + t("recentSales") + '</h3>';
    html += recent.length ? recent.map(function (s) { return '<p><b>#' + s.id + '</b> ' + money(s.total) + '</p>'; }).join("") : '<div class="empty">' + t("noSales") + '</div>';
    html += '</div></div>';

    document.getElementById("main").innerHTML = html;
}

function toolbar() {
    var html = '<div class="toolbar">';
    html += '<input class="input search" placeholder="' + t("search") + '" value="' + escapeHtml(searchText) + '" oninput="searchText=this.value; renderPage();">';
    html += '<select class="select" onchange="selectedCategory=this.value; renderPage();">';
    html += '<option value="all">' + t("allCategories") + '</option>';
    Object.keys(categories).forEach(function (key) {
        html += '<option value="' + key + '"' + (selectedCategory === key ? " selected" : "") + '>' + categoryName(key) + '</option>';
    });
    html += '</select></div>';
    return html;
}

function renderInventory() {
    var list = filteredProducts();
    var html = pageHead(t("inventory"), products.length + " " + t("products"), '<button class="btn primary" onclick="showProductModal()">' + t("addProduct") + '</button>');
    html += toolbar();
    html += '<div class="table-wrap"><table><thead><tr><th>' + t("product") + '</th><th>' + t("category") + '</th><th>' + t("brand") + '</th><th class="num">' + t("price") + '</th><th class="num">' + t("stock") + '</th><th class="num">' + t("actions") + '</th></tr></thead><tbody>';

    if (!list.length) html += '<tr><td colspan="6"><div class="empty">' + t("noProducts") + '</div></td></tr>';

    list.forEach(function (p) {
        html += '<tr><td><div class="product-row"><div class="thumb">' + (p.image ? '<img src="' + p.image + '">' : productIcon(p)) + '</div><b>' + nameOf(p) + '</b></div></td>';
        html += '<td>' + categoryName(p.category) + '</td><td>' + p.brand + '</td><td class="num">' + money(p.price) + '</td>';
        html += '<td class="num"><span class="badge ' + (p.stock < 5 ? "low" : "good") + '">' + p.stock + '</span></td>';
        html += '<td class="num"><button class="btn" onclick="editProduct(' + p.id + ')">' + t("edit") + '</button> <button class="btn danger" onclick="deleteProduct(' + p.id + ')">' + t("delete") + '</button></td></tr>';
    });

    html += '</tbody></table></div>';
    document.getElementById("main").innerHTML = html;
}

function renderSales() {
    var list = filteredProducts();
    var qty = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var html = pageHead(t("sales"), t("salePrice") + " can be changed in cart", '<button class="btn primary" onclick="showCart()">' + t("cart") + ' (' + qty + ')</button>');
    html += toolbar();
    html += '<div class="grid cards">';

    list.forEach(function (p) {
        html += '<div class="card product-card" onclick="addToCart(' + p.id + ')">';
        html += '<div class="product-img">' + (p.image ? '<img src="' + p.image + '">' : productIcon(p)) + '</div>';
        html += '<div class="product-name">' + nameOf(p) + '</div>';
        html += '<div class="product-meta">' + p.brand + ' • ' + categoryName(p.category) + '</div>';
        html += '<div class="product-bottom"><span>' + money(p.price) + '</span><span class="' + (p.stock < 5 ? "low" : "good") + '">' + p.stock + '</span></div>';
        html += '</div>';
    });

    if (!list.length) html += '<div class="empty">' + t("noProducts") + '</div>';
    html += '</div>';
    document.getElementById("main").innerHTML = html;
}

function renderPurchases() {
    var html = pageHead(t("purchases"), t("restock"), "");
    html += '<div class="panel" style="max-width:520px;">';
    html += '<label>' + t("product") + '</label><select id="restock-product" class="select" style="width:100%; margin-bottom:12px;">';
    products.forEach(function (p) { html += '<option value="' + p.id + '">' + nameOf(p) + ' - ' + p.stock + '</option>'; });
    html += '</select><label>' + t("qty") + '</label><input id="restock-qty" type="number" class="input" value="5" min="1" style="width:100%; margin-bottom:12px;">';
    html += '<button class="btn primary" style="width:100%;" onclick="restock()">' + t("restock") + '</button></div>';
    document.getElementById("main").innerHTML = html;
}

function renderReports() {
    var total = salesHistory.reduce(function (sum, s) { return sum + s.total; }, 0);
    var html = pageHead(t("reports"), salesHistory.length + " " + t("recentSales"), "");
    html += '<div class="grid kpis"><div class="card"><div class="kpi-title">' + t("recentSales") + '</div><div class="kpi-value">' + salesHistory.length + '</div></div><div class="card"><div class="kpi-title">' + t("total") + '</div><div class="kpi-value">' + money(total) + '</div></div></div>';
    html += '<div class="table-wrap" style="margin-top:14px;"><table><thead><tr><th>ID</th><th>Date</th><th class="num">' + t("total") + '</th></tr></thead><tbody>';

    salesHistory.slice().reverse().forEach(function (s) {
        html += '<tr><td>#' + s.id + '</td><td>' + new Date(s.date).toLocaleString() + '</td><td class="num">' + money(s.total) + '</td></tr>';
    });

    if (!salesHistory.length) html += '<tr><td colspan="3"><div class="empty">' + t("noSales") + '</div></td></tr>';
    html += '</tbody></table></div>';
    document.getElementById("main").innerHTML = html;
}

function addToCart(id) {
    var p = products.find(function (x) { return x.id === id; });
    if (!p || p.stock < 1) return showToast(t("outOfStock"), true);

    var item = cart.find(function (x) { return x.productId === id; });
    if (item) {
        if (item.qty >= p.stock) return showToast(t("notEnoughStock"), true);
        item.qty++;
    } else {
        cart.push({ productId: id, qty: 1, salePrice: p.price });
    }

    showToast(nameOf(p));
    renderPage();
}

function showCart() {
    var drawer = document.getElementById("cart-drawer");
    var total = 0;
    var html = '<div class="drawer-panel"><div class="drawer-head total-line"><h2>' + t("cart") + '</h2><button class="btn light" onclick="hideCart()">X</button></div><div class="drawer-body">';

    cart.forEach(function (item, index) {
        var p = products.find(function (x) { return x.id === item.productId; });
        if (!p) return;
        var line = item.qty * item.salePrice;
        total += line;

        html += '<div class="cart-item"><div class="cart-top"><div><b>' + nameOf(p) + '</b><div>' + t("price") + ': ' + money(p.price) + '</div></div><b>' + money(line) + '</b></div>';
        html += '<div class="cart-controls"><div class="qty-box"><button onclick="changeQty(' + index + ',-1)">-</button><span>' + item.qty + '</span><button onclick="changeQty(' + index + ',1)">+</button></div>';
        html += '<input class="price-input" type="number" value="' + item.salePrice + '" onchange="changePrice(' + index + ',this.value)">';
        html += '<button class="btn danger" onclick="removeCart(' + index + ')">X</button></div></div>';
    });

    if (!cart.length) html += '<div class="empty">' + t("emptyCart") + '</div>';
    html += '</div><div class="drawer-foot"><div class="total-line"><span>' + t("total") + '</span><b>' + money(total) + '</b></div><br><button class="btn primary" style="width:100%;" onclick="completeSale()">' + t("completeSale") + '</button><button class="btn light" style="width:100%; margin-top:8px;" onclick="clearCart()">' + t("clearCart") + '</button></div></div>';

    drawer.innerHTML = html;
    drawer.classList.remove("hidden");
}

function hideCart() {
    document.getElementById("cart-drawer").classList.add("hidden");
}

function changeQty(index, delta) {
    var item = cart[index];
    var p = products.find(function (x) { return x.id === item.productId; });
    var next = item.qty + delta;

    if (next <= 0) return removeCart(index);
    if (next > p.stock) return showToast(t("notEnoughStock"), true);

    item.qty = next;
    showCart();
    renderPage();
}

function changePrice(index, value) {
    cart[index].salePrice = Math.max(0, Number(value) || 0);
    showCart();
}

function removeCart(index) {
    cart.splice(index, 1);
    showCart();
    renderPage();
}

function clearCart() {
    cart = [];
    hideCart();
    renderPage();
}

function completeSale() {
    if (!cart.length) return showToast(t("emptyCart"), true);

    var total = 0;
    var valid = true;

    cart.forEach(function (item) {
        var p = products.find(function (x) { return x.id === item.productId; });
        if (!p || p.stock < item.qty) valid = false;
        total += item.qty * item.salePrice;
    });

    if (!valid) return showToast(t("notEnoughStock"), true);

    cart.forEach(function (item) {
        var p = products.find(function (x) { return x.id === item.productId; });
        p.stock -= item.qty;
    });

    salesHistory.push({ id: Date.now(), date: new Date().toISOString(), items: cart.slice(), total: total });
    cart = [];
    saveData();
    hideCart();
    showToast(t("saleDone"));
    renderPage();
}

function restock() {
    var id = Number(document.getElementById("restock-product").value);
    var qty = Number(document.getElementById("restock-qty").value) || 0;
    var p = products.find(function (x) { return x.id === id; });

    if (!p || qty <= 0) return;

    p.stock += qty;
    purchasesHistory.push({ id: Date.now(), productId: id, qty: qty, date: new Date().toISOString() });
    saveData();
    showToast(t("stockUpdated"));
    renderPage();
}

function showProductModal(product) {
    editingId = product ? product.id : null;

    var html = '<div class="modal-card"><div class="modal-head"><h2>' + (product ? t("edit") : t("addProduct")) + '</h2><button class="btn light" onclick="hideModal()">X</button></div><div class="modal-body">';
    html += '<label>Image</label><input id="image" type="file" accept="image/*">';
    html += '<div class="form-grid three"><div><label>Name EN</label><input id="name-en" class="light-input" value="' + escapeHtml(product ? product.names.en : "") + '"></div><div><label>Name FR</label><input id="name-fr" class="light-input" value="' + escapeHtml(product ? product.names.fr : "") + '"></div><div><label>Name AR</label><input id="name-ar" class="light-input" value="' + escapeHtml(product ? product.names.ar : "") + '"></div></div>';
    html += '<div class="form-grid"><div><label>' + t("brand") + '</label><input id="brand" class="light-input" value="' + escapeHtml(product ? product.brand : "Yamaha") + '"></div><div><label>' + t("category") + '</label><select id="category" class="light-input">';

    Object.keys(categories).forEach(function (key) {
        html += '<option value="' + key + '"' + (product && product.category === key ? " selected" : "") + '>' + categoryName(key) + '</option>';
    });

    html += '</select></div></div>';
    html += '<div class="form-grid"><div><label>' + t("price") + '</label><input id="price" type="number" class="light-input" value="' + (product ? product.price : 45000) + '"></div><div><label>' + t("stock") + '</label><input id="stock" type="number" class="light-input" value="' + (product ? product.stock : 10) + '"></div></div>';
    html += '</div><div class="modal-foot"><button class="btn light" onclick="hideModal()">' + t("cancel") + '</button><button class="btn primary" onclick="saveProduct()">' + t("save") + '</button></div></div>';

    var modal = document.getElementById("modal");
    modal.innerHTML = html;
    modal.classList.remove("hidden");
}

function editProduct(id) {
    var p = products.find(function (x) { return x.id === id; });
    showProductModal(p);
}

function hideModal() {
    document.getElementById("modal").classList.add("hidden");
}

function saveProduct() {
    var nameEn = document.getElementById("name-en").value.trim();
    var nameFr = document.getElementById("name-fr").value.trim();
    var nameAr = document.getElementById("name-ar").value.trim();
    var brand = document.getElementById("brand").value.trim();
    var category = document.getElementById("category").value;
    var price = Number(document.getElementById("price").value);
    var stock = Number(document.getElementById("stock").value) || 0;
    var file = document.getElementById("image").files[0];

    if (!nameEn || !brand || !price) return showToast(t("required"), true);

    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) { finishSave(e.target.result); };
        reader.readAsDataURL(file);
    } else {
        finishSave("");
    }

    function finishSave(image) {
        if (editingId) {
            var p = products.find(function (x) { return x.id === editingId; });
            p.names = { en: nameEn, fr: nameFr || nameEn, ar: nameAr || nameEn };
            p.brand = brand;
            p.category = category;
            p.price = price;
            p.stock = stock;
            if (image) p.image = image;
        } else {
            products.unshift({ id: Date.now(), names: { en: nameEn, fr: nameFr || nameEn, ar: nameAr || nameEn }, brand: brand, category: category, price: price, stock: stock, image: image });
        }

        saveData();
        hideModal();
        showToast(t("saved"));
        renderPage();
    }
}

function deleteProduct(id) {
    if (!confirm(t("delete") + "?")) return;
    products = products.filter(function (p) { return p.id !== id; });
    cart = cart.filter(function (item) { return item.productId !== id; });
    saveData();
    showToast(t("deleted"));
    renderPage();
}

function exportCSV() {
    var csv = "ID,Name,Brand,Category,Price,Stock\n";

    products.forEach(function (p) {
        csv += p.id + ',"' + nameOf(p).replace(/"/g, '""') + '","' + p.brand.replace(/"/g, '""') + '",' + p.category + "," + p.price + "," + p.stock + "\n";
    });

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "yamahabidjan_stock.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetData() {
    if (!confirm(t("reset") + "?")) return;
    seedData();
    saveData();
    renderPage();
    showToast(t("stockUpdated"));
}

function showToast(message, error) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.background = error ? "#ef4444" : "#00b8a9";
    toast.classList.remove("hidden");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () {
        toast.classList.add("hidden");
    }, 2500);
}

window.addEventListener("load", function () {
    loadData();
    renderNav();
    switchLanguage(currentLang);
    navigateTo("dashboard");
});
