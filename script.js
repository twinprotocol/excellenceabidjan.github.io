const translations = {
    en: {
        dashboard: "Dashboard", inventory: "Inventory", sales: "Sales", purchases: "Purchases", reports: "Reports",
        subtitle: "Daily stock, sales, and restock workflow",
        products: "Products", stockValue: "Stock value", lowStock: "Low stock", todaySales: "Today sales",
        addProduct: "Add product", search: "Search product, brand...", allCategories: "All categories",
        product: "Product", category: "Category", brand: "Brand", price: "Price", stock: "Stock", actions: "Actions",
        edit: "Edit", delete: "Delete", cart: "Cart", salePrice: "Sale price", defaultPrice: "Default price",
        total: "Total", qty: "Qty", completeSale: "Complete sale", clearCart: "Clear cart", restock: "Restock",
        save: "Save", cancel: "Cancel", recentSales: "Recent sales", noSales: "No sales yet", noProducts: "No products found",
        emptyCart: "Cart is empty", outOfStock: "Out of stock", notEnoughStock: "Not enough stock",
        saved: "Product saved", deleted: "Product deleted", saleDone: "Sale completed", stockUpdated: "Stock updated",
        required: "Name, brand, and price are required", exportCSV: "Export CSV", reset: "Reset data",
        quickRestock: "Quick restock", stockHealth: "Stock health", thisMonth: "This month", saleHint: "Tap a product to add it. Change client price inside cart."
    },
    fr: {
        dashboard: "Tableau", inventory: "Inventaire", sales: "Ventes", purchases: "Achats", reports: "Rapports",
        subtitle: "Stock, ventes et réapprovisionnement au quotidien",
        products: "Produits", stockValue: "Valeur stock", lowStock: "Stock faible", todaySales: "Ventes du jour",
        addProduct: "Ajouter", search: "Produit, marque...", allCategories: "Toutes catégories",
        product: "Produit", category: "Catégorie", brand: "Marque", price: "Prix", stock: "Stock", actions: "Actions",
        edit: "Modifier", delete: "Supprimer", cart: "Panier", salePrice: "Prix client", defaultPrice: "Prix normal",
        total: "Total", qty: "Qté", completeSale: "Valider vente", clearCart: "Vider panier", restock: "Réapprovisionner",
        save: "Enregistrer", cancel: "Annuler", recentSales: "Ventes récentes", noSales: "Aucune vente", noProducts: "Aucun produit",
        emptyCart: "Panier vide", outOfStock: "Rupture de stock", notEnoughStock: "Stock insuffisant",
        saved: "Produit enregistré", deleted: "Produit supprimé", saleDone: "Vente terminée", stockUpdated: "Stock mis à jour",
        required: "Nom, marque et prix requis", exportCSV: "Exporter CSV", reset: "Réinitialiser",
        quickRestock: "Réassort rapide", stockHealth: "État du stock", thisMonth: "Ce mois", saleHint: "Touchez un produit pour l'ajouter. Changez le prix client dans le panier."
    },
    ar: {
        dashboard: "الرئيسية", inventory: "المخزون", sales: "المبيعات", purchases: "المشتريات", reports: "التقارير",
        subtitle: "إدارة يومية للمخزون والمبيعات",
        products: "المنتجات", stockValue: "قيمة المخزون", lowStock: "مخزون منخفض", todaySales: "مبيعات اليوم",
        addProduct: "إضافة", search: "ابحث عن منتج أو علامة...", allCategories: "كل التصنيفات",
        product: "المنتج", category: "التصنيف", brand: "العلامة", price: "السعر", stock: "المخزون", actions: "الإجراءات",
        edit: "تعديل", delete: "حذف", cart: "السلة", salePrice: "سعر العميل", defaultPrice: "السعر العادي",
        total: "المجموع", qty: "الكمية", completeSale: "إتمام البيع", clearCart: "مسح السلة", restock: "إعادة التخزين",
        save: "حفظ", cancel: "إلغاء", recentSales: "آخر المبيعات", noSales: "لا توجد مبيعات", noProducts: "لا توجد منتجات",
        emptyCart: "السلة فارغة", outOfStock: "نفد المخزون", notEnoughStock: "المخزون غير كاف",
        saved: "تم حفظ المنتج", deleted: "تم حذف المنتج", saleDone: "تم البيع", stockUpdated: "تم تحديث المخزون",
        required: "الاسم والعلامة والسعر مطلوبة", exportCSV: "تصدير CSV", reset: "إعادة ضبط",
        quickRestock: "إعادة تخزين سريعة", stockHealth: "حالة المخزون", thisMonth: "هذا الشهر", saleHint: "اضغط على منتج لإضافته. غيّر سعر العميل داخل السلة."
    }
};

const categories = {
    guitars: { en: "Guitars", fr: "Guitares", ar: "الغيتارات" },
    keyboards: { en: "Keyboards", fr: "Claviers", ar: "الكيبوردات" },
    drums: { en: "Drums", fr: "Batteries", ar: "الطبول" },
    wind: { en: "Wind", fr: "Vents", ar: "النفخ" },
    accessories: { en: "Accessories", fr: "Accessoires", ar: "الإكسسوارات" }
};

let currentLang = "en";
let currentPage = "dashboard";
let products = [];
let salesHistory = [];
let purchasesHistory = [];
let cart = [];
let editingId = null;
let searchText = "";
let selectedCategory = "all";

function seedData() {
    products = [
        { id: 1, names: { en: "FG800 Acoustic Guitar", fr: "Guitare acoustique FG800", ar: "غيتار أكوستيك FG800" }, brand: "Yamaha", category: "guitars", price: 45000, stock: 14, image: "" },
        { id: 2, names: { en: "P-125 Digital Piano", fr: "Piano numérique P-125", ar: "بيانو رقمي P-125" }, brand: "Yamaha", category: "keyboards", price: 135000, stock: 7, image: "" },
        { id: 3, names: { en: "DTX402 Drum Kit", fr: "Batterie électronique DTX402", ar: "طقم طبول DTX402" }, brand: "Yamaha", category: "drums", price: 210000, stock: 4, image: "" },
        { id: 4, names: { en: "YTR-2330 Trumpet", fr: "Trompette YTR-2330", ar: "ترومبيت YTR-2330" }, brand: "Yamaha", category: "wind", price: 68000, stock: 11, image: "" },
        { id: 5, names: { en: "HS5 Studio Monitor", fr: "Moniteur studio HS5", ar: "سماعة ستوديو HS5" }, brand: "Yamaha", category: "accessories", price: 95000, stock: 6, image: "" },
        { id: 6, names: { en: "SM58 Microphone", fr: "Microphone SM58", ar: "ميكروفون SM58" }, brand: "Shure", category: "accessories", price: 22000, stock: 28, image: "" }
    ];
    salesHistory = [];
    purchasesHistory = [];
    cart = [];
}

function loadData() {
    try {
        products = JSON.parse(localStorage.getItem("yb_products")) || [];
        salesHistory = JSON.parse(localStorage.getItem("yb_sales")) || [];
        purchasesHistory = JSON.parse(localStorage.getItem("yb_purchases")) || [];
        currentLang = localStorage.getItem("yb_lang") || "en";
        if (!products.length) seedData();
    } catch {
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

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function productCode(product) {
    const map = { guitars: "GT", keyboards: "KY", drums: "DR", wind: "WD", accessories: "AC" };
    return map[product.category] || "PR";
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function navItems() {
    return [
        ["dashboard", "⌂", t("dashboard")],
        ["inventory", "▦", t("inventory")],
        ["sales", "₣", t("sales")],
        ["purchases", "+", t("purchases")],
        ["reports", "▤", t("reports")]
    ];
}

function renderNav() {
    const desktop = `
        <div class="nav-card">
            ${navItems().map(item => `
                <button class="nav-item ${currentPage === item[0] ? "active" : ""}" onclick="navigateTo('${item[0]}')">
                    <span class="nav-icon">${item[1]}</span>
                    <span>${item[2]}</span>
                </button>
            `).join("")}
        </div>
        <div class="side-tools">
            <button class="btn primary" onclick="exportCSV()">⇩ ${t("exportCSV")}</button>
            <button class="btn" onclick="resetData()">↻ ${t("reset")}</button>
        </div>
    `;

    const mobile = navItems().map(item => `
        <button class="${currentPage === item[0] ? "active" : ""}" onclick="navigateTo('${item[0]}')">
            <span class="nav-icon">${item[1]}</span>
            <span>${item[2]}</span>
        </button>
    `).join("");

    document.getElementById("sidebar").innerHTML = desktop;
    document.getElementById("mobile-nav").innerHTML = mobile;
    document.getElementById("cart-count").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.getElementById("main").classList.toggle("rtl", lang === "ar");
    ["en", "fr", "ar"].forEach(code => {
        document.getElementById(`lang-${code}`).classList.toggle("active", code === lang);
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
    const today = todayKey();
    const month = today.slice(0, 7);
    return {
        products: products.length,
        stockValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
        lowStock: products.filter(p => p.stock < 5).length,
        todaySales: salesHistory.filter(s => s.date.slice(0, 10) === today).reduce((sum, s) => sum + s.total, 0),
        monthSales: salesHistory.filter(s => s.date.slice(0, 7) === month).reduce((sum, s) => sum + s.total, 0)
    };
}

function pageHead(icon, title, subtitle, actions = "") {
    return `
        <div class="page-head">
            <div class="page-title">
                <div class="title-icon">${icon}</div>
                <div>
                    <h2>${title}</h2>
                    <p>${subtitle}</p>
                </div>
            </div>
            <div class="head-actions">${actions}</div>
        </div>
    `;
}

function statCard(label, value, note, tone = "") {
    return `
        <div class="stat-card">
            <div class="stat-label">${label}</div>
            <div class="stat-value ${tone}">${value}</div>
            <div class="stat-note">${note}</div>
        </div>
    `;
}

function filteredProducts() {
    const query = searchText.trim().toLowerCase();
    return products.filter(product => {
        const found = nameOf(product).toLowerCase().includes(query) || product.brand.toLowerCase().includes(query);
        const category = selectedCategory === "all" || product.category === selectedCategory;
        return found && category;
    });
}

function toolbar() {
    return `
        <div class="toolbar">
            <div class="search-box">
                <span>⌕</span>
                <input value="${escapeHtml(searchText)}" placeholder="${t("search")}" oninput="searchText=this.value; renderPage();">
            </div>
            <select class="select" onchange="selectedCategory=this.value; renderPage();">
                <option value="all">${t("allCategories")}</option>
                ${Object.keys(categories).map(key => `<option value="${key}" ${selectedCategory === key ? "selected" : ""}>${categoryName(key)}</option>`).join("")}
            </select>
        </div>
    `;
}

function renderPage() {
    if (currentPage === "dashboard") renderDashboard();
    if (currentPage === "inventory") renderInventory();
    if (currentPage === "sales") renderSales();
    if (currentPage === "purchases") renderPurchases();
    if (currentPage === "reports") renderReports();
}

function renderDashboard() {
    const s = stats();
    const low = products.filter(p => p.stock < 5);
    const recent = salesHistory.slice(-6).reverse();
    document.getElementById("main").innerHTML = `
        <section class="page">
            ${pageHead("⌂", "YamahaBidjan", t("subtitle"), `<button class="btn primary" onclick="navigateTo('sales')">₣ ${t("sales")}</button>`)}
            <div class="stats-grid">
                ${statCard(t("products"), s.products, t("stockHealth"))}
                ${statCard(t("stockValue"), money(s.stockValue), t("inventory"))}
                ${statCard(t("lowStock"), s.lowStock, t("quickRestock"), s.lowStock ? "low" : "")}
                ${statCard(t("todaySales"), money(s.todaySales), `${t("thisMonth")}: ${money(s.monthSales)}`)}
            </div>
            <div class="content-grid">
                <div class="panel">
                    <div class="panel-title"><h3>${t("lowStock")}</h3><span class="badge low">${low.length}</span></div>
                    ${low.length ? low.map(productListRow).join("") : `<div class="empty">${t("noProducts")}</div>`}
                </div>
                <div class="panel">
                    <div class="panel-title"><h3>${t("recentSales")}</h3><span class="badge">${salesHistory.length}</span></div>
                    ${recent.length ? recent.map(s => `
                        <div class="list-row">
                            <div><strong>#${s.id}</strong><div class="muted">${new Date(s.date).toLocaleString()}</div></div>
                            <strong>${money(s.total)}</strong>
                        </div>
                    `).join("") : `<div class="empty">${t("noSales")}</div>`}
                </div>
            </div>
        </section>
    `;
}

function productListRow(p) {
    return `
        <div class="list-row">
            <div class="product-main">
                <div class="thumb">${p.image ? `<img src="${p.image}" alt="">` : productCode(p)}</div>
                <div><strong>${nameOf(p)}</strong><div class="muted">${p.brand} • ${categoryName(p.category)}</div></div>
            </div>
            <span class="badge ${p.stock < 5 ? "low" : "good"}">${p.stock}</span>
        </div>
    `;
}

function renderInventory() {
    const list = filteredProducts();
    document.getElementById("main").innerHTML = `
        <section class="page">
            ${pageHead("▦", t("inventory"), `${products.length} ${t("products").toLowerCase()}`, `<button class="btn primary" onclick="showProductModal()">+ ${t("addProduct")}</button>`)}
            ${toolbar()}
            <div class="table-wrap">
                <table>
                    <thead><tr><th>${t("product")}</th><th>${t("category")}</th><th>${t("brand")}</th><th class="num">${t("price")}</th><th class="num">${t("stock")}</th><th class="num">${t("actions")}</th></tr></thead>
                    <tbody>
                        ${list.length ? list.map(p => `
                            <tr>
                                <td><div class="product-main"><div class="thumb">${p.image ? `<img src="${p.image}" alt="">` : productCode(p)}</div><div><strong>${nameOf(p)}</strong><div class="muted">${t("defaultPrice")}: ${money(p.price)}</div></div></div></td>
                                <td>${categoryName(p.category)}</td>
                                <td>${p.brand}</td>
                                <td class="num"><strong>${money(p.price)}</strong></td>
                                <td class="num"><span class="badge ${p.stock < 5 ? "low" : "good"}">${p.stock}</span></td>
                                <td class="num"><button class="btn ghost" onclick="editProduct(${p.id})">${t("edit")}</button><button class="btn ghost" onclick="deleteProduct(${p.id})">${t("delete")}</button></td>
                            </tr>
                        `).join("") : `<tr><td colspan="6"><div class="empty">${t("noProducts")}</div></td></tr>`}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function renderSales() {
    const list = filteredProducts();
    const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("main").innerHTML = `
        <section class="page">
            ${pageHead("₣", t("sales"), t("saleHint"), `<button class="btn primary" onclick="showCart()">🧾 ${t("cart")} (${cartQty})</button>`)}
            ${toolbar()}
            <div class="cards-grid">
                ${list.length ? list.map(p => `
                    <button class="product-card" onclick="addToCart(${p.id})">
                        <div class="product-art">${p.image ? `<img src="${p.image}" alt="">` : productCode(p)}</div>
                        <div class="product-name">${nameOf(p)}</div>
                        <div class="muted">${p.brand} • ${categoryName(p.category)}</div>
                        <div class="product-bottom">
                            <span class="price">${money(p.price)}</span>
                            <span class="badge ${p.stock < 5 ? "low" : "good"}">${p.stock}</span>
                        </div>
                    </button>
                `).join("") : `<div class="empty">${t("noProducts")}</div>`}
            </div>
        </section>
    `;
}

function renderPurchases() {
    document.getElementById("main").innerHTML = `
        <section class="page">
            ${pageHead("+", t("purchases"), t("quickRestock"))}
            <div class="panel" style="max-width:620px;">
                <label>${t("product")}</label>
                <select id="restock-product" class="select" style="width:100%; margin-bottom:14px;">
                    ${products.map(p => `<option value="${p.id}">${nameOf(p)} - ${p.stock}</option>`).join("")}
                </select>
                <label>${t("qty")}</label>
                <div class="quick-sale">
                    <input id="restock-qty" class="input" type="number" value="5" min="1">
                    <button class="btn primary" onclick="restock()">${t("restock")}</button>
                </div>
            </div>
        </section>
    `;
}

function renderReports() {
    const total = salesHistory.reduce((sum, s) => sum + s.total, 0);
    document.getElementById("main").innerHTML = `
        <section class="page">
            ${pageHead("▤", t("reports"), t("recentSales"), `<button class="btn" onclick="exportCSV()">⇩ ${t("exportCSV")}</button>`)}
            <div class="stats-grid">
                ${statCard(t("recentSales"), salesHistory.length, t("sales"))}
                ${statCard(t("total"), money(total), t("thisMonth"))}
                ${statCard(t("products"), products.length, t("inventory"))}
                ${statCard(t("lowStock"), products.filter(p => p.stock < 5).length, t("stockHealth"))}
            </div>
            <div class="table-wrap" style="margin-top:14px;">
                <table>
                    <thead><tr><th>ID</th><th>Date</th><th>${t("qty")}</th><th class="num">${t("total")}</th></tr></thead>
                    <tbody>
                        ${salesHistory.length ? salesHistory.slice().reverse().map(s => `
                            <tr><td>#${s.id}</td><td>${new Date(s.date).toLocaleString()}</td><td>${s.items.reduce((sum, item) => sum + item.qty, 0)}</td><td class="num"><strong>${money(s.total)}</strong></td></tr>
                        `).join("") : `<tr><td colspan="4"><div class="empty">${t("noSales")}</div></td></tr>`}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product || product.stock < 1) return showToast(t("outOfStock"), true);
    const item = cart.find(x => x.productId === id);
    if (item) {
        if (item.qty >= product.stock) return showToast(t("notEnoughStock"), true);
        item.qty++;
    } else {
        cart.push({ productId: id, qty: 1, salePrice: product.price });
    }
    renderNav();
    renderPage();
    showToast(nameOf(product));
}

function showCart() {
    const total = cart.reduce((sum, item) => sum + item.qty * item.salePrice, 0);
    document.getElementById("cart-drawer").innerHTML = `
        <div class="drawer-panel">
            <div class="drawer-head"><h2>${t("cart")}</h2><button class="btn light" onclick="hideCart()">×</button></div>
            <div class="drawer-body">
                ${cart.length ? cart.map((item, index) => {
                    const p = products.find(product => product.id === item.productId);
                    if (!p) return "";
                    return `
                        <div class="cart-item">
                            <div class="cart-line">
                                <div><strong>${nameOf(p)}</strong><div class="muted">${t("defaultPrice")}: ${money(p.price)}</div></div>
                                <strong>${money(item.qty * item.salePrice)}</strong>
                            </div>
                            <div class="cart-controls">
                                <div class="qty-box"><button onclick="changeQty(${index}, -1)">−</button><span>${item.qty}</span><button onclick="changeQty(${index}, 1)">+</button></div>
                                <input class="price-input" type="number" value="${item.salePrice}" min="0" onchange="changePrice(${index}, this.value)" aria-label="${t("salePrice")}">
                                <button class="btn danger" onclick="removeCart(${index})">×</button>
                            </div>
                        </div>
                    `;
                }).join("") : `<div class="empty">${t("emptyCart")}</div>`}
            </div>
            <div class="drawer-foot" style="display:block;">
                <div class="total-line"><span>${t("total")}</span><strong>${money(total)}</strong></div>
                <button class="btn primary" style="width:100%; margin-top:16px;" onclick="completeSale()">${t("completeSale")}</button>
                <button class="btn light" style="width:100%; margin-top:8px;" onclick="clearCart()">${t("clearCart")}</button>
            </div>
        </div>
    `;
    document.getElementById("cart-drawer").classList.remove("hidden");
}

function hideCart() {
    document.getElementById("cart-drawer").classList.add("hidden");
}

function changeQty(index, delta) {
    const item = cart[index];
    const product = products.find(p => p.id === item.productId);
    const next = item.qty + delta;
    if (next <= 0) return removeCart(index);
    if (next > product.stock) return showToast(t("notEnoughStock"), true);
    item.qty = next;
    showCart();
    renderNav();
    renderPage();
}

function changePrice(index, value) {
    cart[index].salePrice = Math.max(0, Number(value) || 0);
    showCart();
}

function removeCart(index) {
    cart.splice(index, 1);
    showCart();
    renderNav();
    renderPage();
}

function clearCart() {
    cart = [];
    hideCart();
    renderNav();
    renderPage();
}

function completeSale() {
    if (!cart.length) return showToast(t("emptyCart"), true);
    let valid = true;
    let total = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.stock < item.qty) valid = false;
        total += item.qty * item.salePrice;
    });
    if (!valid) return showToast(t("notEnoughStock"), true);
    cart.forEach(item => products.find(p => p.id === item.productId).stock -= item.qty);
    salesHistory.push({ id: Date.now(), date: new Date().toISOString(), items: cart.map(item => ({ ...item })), total });
    cart = [];
    saveData();
    hideCart();
    renderNav();
    renderPage();
    showToast(t("saleDone"));
}

function restock() {
    const id = Number(document.getElementById("restock-product").value);
    const qty = Number(document.getElementById("restock-qty").value) || 0;
    const product = products.find(p => p.id === id);
    if (!product || qty <= 0) return;
    product.stock += qty;
    purchasesHistory.push({ id: Date.now(), productId: id, qty, date: new Date().toISOString() });
    saveData();
    renderPage();
    showToast(t("stockUpdated"));
}

function showProductModal(product = null) {
    editingId = product ? product.id : null;
    document.getElementById("modal").innerHTML = `
        <div class="modal-card">
            <div class="modal-head"><h2>${product ? t("edit") : t("addProduct")}</h2><button class="btn light" onclick="hideModal()">×</button></div>
            <div class="modal-body">
                <div style="display:flex; gap:14px; align-items:end;">
                    <div class="image-preview">${product && product.image ? `<img src="${product.image}" alt="">` : (product ? productCode(product) : "YB")}</div>
                    <div style="flex:1;"><label>Image</label><input id="image" class="light-input" type="file" accept="image/*"></div>
                </div>
                <div class="form-grid three">
                    <div><label>Name EN</label><input id="name-en" class="light-input" value="${escapeHtml(product ? product.names.en : "")}"></div>
                    <div><label>Name FR</label><input id="name-fr" class="light-input" value="${escapeHtml(product ? product.names.fr : "")}"></div>
                    <div><label>Name AR</label><input id="name-ar" class="light-input" value="${escapeHtml(product ? product.names.ar : "")}"></div>
                </div>
                <div class="form-grid">
                    <div><label>${t("brand")}</label><input id="brand" class="light-input" value="${escapeHtml(product ? product.brand : "Yamaha")}"></div>
                    <div><label>${t("category")}</label><select id="category" class="light-input">${Object.keys(categories).map(key => `<option value="${key}" ${product && product.category === key ? "selected" : ""}>${categoryName(key)}</option>`).join("")}</select></div>
                </div>
                <div class="form-grid">
                    <div><label>${t("price")}</label><input id="price" class="light-input" type="number" value="${product ? product.price : 45000}" min="0"></div>
                    <div><label>${t("stock")}</label><input id="stock" class="light-input" type="number" value="${product ? product.stock : 10}" min="0"></div>
                </div>
            </div>
            <div class="modal-foot"><button class="btn light" onclick="hideModal()">${t("cancel")}</button><button class="btn primary" onclick="saveProduct()">${t("save")}</button></div>
        </div>
    `;
    document.getElementById("modal").classList.remove("hidden");
}

function editProduct(id) {
    showProductModal(products.find(p => p.id === id));
}

function hideModal() {
    document.getElementById("modal").classList.add("hidden");
}

function saveProduct() {
    const nameEn = document.getElementById("name-en").value.trim();
    const nameFr = document.getElementById("name-fr").value.trim();
    const nameAr = document.getElementById("name-ar").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const category = document.getElementById("category").value;
    const price = Number(document.getElementById("price").value);
    const stock = Number(document.getElementById("stock").value) || 0;
    const file = document.getElementById("image").files[0];
    if (!nameEn || !brand || !price) return showToast(t("required"), true);
    if (file) {
        const reader = new FileReader();
        reader.onload = event => finishSave(event.target.result);
        reader.readAsDataURL(file);
    } else {
        finishSave("");
    }

    function finishSave(image) {
        if (editingId) {
            const product = products.find(p => p.id === editingId);
            product.names = { en: nameEn, fr: nameFr || nameEn, ar: nameAr || nameEn };
            product.brand = brand;
            product.category = category;
            product.price = price;
            product.stock = stock;
            if (image) product.image = image;
        } else {
            products.unshift({ id: Date.now(), names: { en: nameEn, fr: nameFr || nameEn, ar: nameAr || nameEn }, brand, category, price, stock, image });
        }
        saveData();
        hideModal();
        renderPage();
        showToast(t("saved"));
    }
}

function deleteProduct(id) {
    if (!confirm(`${t("delete")}?`)) return;
    products = products.filter(p => p.id !== id);
    cart = cart.filter(item => item.productId !== id);
    saveData();
    renderNav();
    renderPage();
    showToast(t("deleted"));
}

function exportCSV() {
    const rows = [
        ["ID", "Name", "Brand", "Category", "Price_XOF", "Stock"],
        ...products.map(p => [p.id, nameOf(p), p.brand, p.category, p.price, p.stock])
    ];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `yamahabidjan_stock_${todayKey()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function resetData() {
    if (!confirm(`${t("reset")}?`)) return;
    seedData();
    saveData();
    renderNav();
    renderPage();
    showToast(t("stockUpdated"));
}

function showToast(message, error = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.background = error ? "#ef4444" : "#23d3c3";
    toast.style.color = error ? "#fff" : "#031b1b";
    toast.classList.remove("hidden");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2400);
}

window.addEventListener("load", () => {
    loadData();
    renderNav();
    switchLanguage(currentLang);
    navigateTo("dashboard");
});