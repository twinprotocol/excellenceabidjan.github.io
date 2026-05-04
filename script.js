const translations = {
    en: {
        appTitle: "YamahaBidjan Stock Manager",
        dashboard: "Dashboard",
        inventory: "Inventory",
        sales: "Sales",
        purchases: "Purchases",
        reports: "Reports",
        totalProducts: "Products",
        totalValue: "Stock Value",
        lowStock: "Low Stock",
        todaySales: "Sales Today",
        searchProducts: "Search products...",
        addProduct: "Add Product",
        edit: "Edit",
        delete: "Delete",
        stock: "Stock",
        price: "Price",
        salePrice: "Sale Price",
        actions: "Actions",
        category: "Category",
        brand: "Brand",
        completeSale: "Complete Sale",
        clearCart: "Clear Cart",
        qty: "Qty",
        total: "Total",
        restock: "Restock",
        save: "Save",
        cancel: "Cancel",
        noResults: "No products found",
        modalTitleAdd: "Add Product",
        modalTitleEdit: "Edit Product",
        cartTitle: "Sale Cart",
        exportCSV: "Export CSV",
        allCategories: "All Categories",
        recentSales: "Recent Sales",
        noSales: "No sales yet",
        image: "Image",
        product: "Product",
        remove: "Remove",
        outOfStock: "Out of stock",
        cartEmpty: "Cart is empty",
        notEnoughStock: "Not enough stock",
        saved: "Product saved",
        deleted: "Product deleted",
        saleDone: "Sale completed",
        stockUpdated: "Stock updated",
        required: "Name and price are required",
        resetData: "Reset demo data"
    },
    fr: {
        appTitle: "Gestion de Stock YamahaBidjan",
        dashboard: "Tableau",
        inventory: "Inventaire",
        sales: "Ventes",
        purchases: "Achats",
        reports: "Rapports",
        totalProducts: "Produits",
        totalValue: "Valeur Stock",
        lowStock: "Stock Faible",
        todaySales: "Ventes du Jour",
        searchProducts: "Rechercher...",
        addProduct: "Ajouter",
        edit: "Modifier",
        delete: "Supprimer",
        stock: "Stock",
        price: "Prix",
        salePrice: "Prix Vente",
        actions: "Actions",
        category: "Catégorie",
        brand: "Marque",
        completeSale: "Valider",
        clearCart: "Vider",
        qty: "Qté",
        total: "Total",
        restock: "Réapprovisionner",
        save: "Enregistrer",
        cancel: "Annuler",
        noResults: "Aucun produit",
        modalTitleAdd: "Ajouter Produit",
        modalTitleEdit: "Modifier Produit",
        cartTitle: "Panier",
        exportCSV: "Exporter CSV",
        allCategories: "Toutes catégories",
        recentSales: "Ventes récentes",
        noSales: "Aucune vente",
        image: "Image",
        product: "Produit",
        remove: "Retirer",
        outOfStock: "Rupture de stock",
        cartEmpty: "Panier vide",
        notEnoughStock: "Stock insuffisant",
        saved: "Produit enregistré",
        deleted: "Produit supprimé",
        saleDone: "Vente terminée",
        stockUpdated: "Stock mis à jour",
        required: "Nom et prix requis",
        resetData: "Réinitialiser"
    },
    ar: {
        appTitle: "مدير مخزون YamahaBidjan",
        dashboard: "الرئيسية",
        inventory: "المخزون",
        sales: "المبيعات",
        purchases: "المشتريات",
        reports: "التقارير",
        totalProducts: "المنتجات",
        totalValue: "قيمة المخزون",
        lowStock: "مخزون منخفض",
        todaySales: "مبيعات اليوم",
        searchProducts: "ابحث عن منتج...",
        addProduct: "إضافة",
        edit: "تعديل",
        delete: "حذف",
        stock: "المخزون",
        price: "السعر",
        salePrice: "سعر البيع",
        actions: "الإجراءات",
        category: "التصنيف",
        brand: "العلامة",
        completeSale: "إتمام البيع",
        clearCart: "مسح السلة",
        qty: "الكمية",
        total: "المجموع",
        restock: "إعادة التخزين",
        save: "حفظ",
        cancel: "إلغاء",
        noResults: "لا توجد منتجات",
        modalTitleAdd: "إضافة منتج",
        modalTitleEdit: "تعديل المنتج",
        cartTitle: "سلة البيع",
        exportCSV: "تصدير CSV",
        allCategories: "كل التصنيفات",
        recentSales: "آخر المبيعات",
        noSales: "لا توجد مبيعات",
        image: "الصورة",
        product: "المنتج",
        remove: "إزالة",
        outOfStock: "نفد المخزون",
        cartEmpty: "السلة فارغة",
        notEnoughStock: "المخزون غير كاف",
        saved: "تم حفظ المنتج",
        deleted: "تم حذف المنتج",
        saleDone: "تم البيع",
        stockUpdated: "تم تحديث المخزون",
        required: "الاسم والسعر مطلوبان",
        resetData: "إعادة ضبط"
    }
};

const categoryTranslations = {
    guitars: { en: "Guitars", fr: "Guitares", ar: "الغيتارات" },
    keyboards: { en: "Keyboards", fr: "Claviers", ar: "الكيبوردات" },
    drums: { en: "Drums", fr: "Batteries", ar: "الطبول" },
    wind: { en: "Wind Instruments", fr: "Instruments à vent", ar: "آلات النفخ" },
    accessories: { en: "Accessories", fr: "Accessoires", ar: "الإكسسوارات" }
};

let currentLang = "en";
let currentPage = "dashboard";
let products = [];
let salesHistory = [];
let purchasesHistory = [];
let cart = [];
let editingProductId = null;
let inventorySearch = "";
let inventoryCategory = "all";

function seedData() {
    products = [
        { id: 1, names: { en: "FG800 Acoustic Guitar", fr: "Guitare acoustique FG800", ar: "غيتار أكوستيك FG800" }, brand: "Yamaha", category: "guitars", price: 45000, stock: 14, image: null },
        { id: 2, names: { en: "P-125 Digital Piano", fr: "Piano numérique P-125", ar: "بيانو رقمي P-125" }, brand: "Yamaha", category: "keyboards", price: 135000, stock: 7, image: null },
        { id: 3, names: { en: "DTX402 Electronic Drum Kit", fr: "Kit batterie électronique DTX402", ar: "طقم طبول إلكتروني DTX402" }, brand: "Yamaha", category: "drums", price: 210000, stock: 4, image: null },
        { id: 4, names: { en: "YTR-2330 Trumpet", fr: "Trompette YTR-2330", ar: "ترومبيت YTR-2330" }, brand: "Yamaha", category: "wind", price: 68000, stock: 11, image: null },
        { id: 5, names: { en: "SM58 Microphone", fr: "Microphone SM58", ar: "ميكروفون SM58" }, brand: "Shure", category: "accessories", price: 22000, stock: 28, image: null }
    ];
    salesHistory = [];
    purchasesHistory = [];
    cart = [];
}

function loadFromStorage() {
    const savedProducts = localStorage.getItem("yamahabidjan_products");
    const savedSales = localStorage.getItem("yamahabidjan_sales");
    const savedPurchases = localStorage.getItem("yamahabidjan_purchases");
    const savedLang = localStorage.getItem("yamahabidjan_lang");

    if (savedProducts) products = JSON.parse(savedProducts);
    else seedData();

    if (savedSales) salesHistory = JSON.parse(savedSales);
    if (savedPurchases) purchasesHistory = JSON.parse(savedPurchases);
    if (savedLang) currentLang = savedLang;
}

function saveToStorage() {
    localStorage.setItem("yamahabidjan_products", JSON.stringify(products));
    localStorage.setItem("yamahabidjan_sales", JSON.stringify(salesHistory));
    localStorage.setItem("yamahabidjan_purchases", JSON.stringify(purchasesHistory));
    localStorage.setItem("yamahabidjan_lang", currentLang);
}

function t(key) {
    return translations[currentLang][key] || key;
}

function getCategoryName(key) {
    return categoryTranslations[key] ? categoryTranslations[key][currentLang] : key;
}

function getProductName(product) {
    return product.names[currentLang] || product.names.en;
}

function money(value) {
    return Number(value || 0).toLocaleString("fr-FR") + " XOF";
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function productIcon(product) {
    if (product.category === "guitars") return "🎸";
    if (product.category === "keyboards") return "🎹";
    if (product.category === "drums") return "🥁";
    if (product.category === "wind") return "🎺";
    return "🎧";
}

function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.getElementById("main-content").classList.toggle("rtl", lang === "ar");

    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.id === `lang-${lang}`);
    });

    saveToStorage();
    renderSidebar();
    renderMobileNav();
    renderCurrentPage();
}

function navigateTo(page) {
    currentPage = page;
    renderSidebar();
    renderMobileNav();
    renderCurrentPage();
}

function navItems() {
    return [
        ["dashboard", "fa-gauge-high", t("dashboard")],
        ["inventory", "fa-boxes-stacked", t("inventory")],
        ["sales", "fa-cash-register", t("sales")],
        ["purchases", "fa-truck-loading", t("purchases")],
        ["reports", "fa-chart-bar", t("reports")]
    ];
}

function renderSidebar() {
    const sidebar = document.getElementById("sidebar");

    sidebar.innerHTML = `
        <div class="nav-list">
            ${navItems().map(item => `
                <div onclick="navigateTo('${item[0]}')" class="nav-item ${currentPage === item[0] ? "active" : ""}">
                    <i class="fas ${item[1]}"></i>
                    <span>${item[2]}</span>
                </div>
            `).join("")}
        </div>

        <div style="margin-top:auto; padding-top:24px; display:grid; gap:10px;">
            <button onclick="exportToCSV()" class="btn btn-primary">
                <i class="fas fa-file-export"></i>
                ${t("exportCSV")}
            </button>
            <button onclick="resetDemoData()" class="btn btn-soft">
                <i class="fas fa-rotate"></i>
                ${t("resetData")}
            </button>
        </div>
    `;
}

function renderMobileNav() {
    const mobileNav = document.getElementById("mobile-nav");

    mobileNav.innerHTML = navItems().map(item => `
        <button onclick="navigateTo('${item[0]}')" class="${currentPage === item[0] ? "active" : ""}">
            <i class="fas ${item[1]}"></i>
            <span>${item[2]}</span>
        </button>
    `).join("");
}

function renderCurrentPage() {
    const container = document.getElementById("main-content");

    if (currentPage === "dashboard") renderDashboard(container);
    if (currentPage === "inventory") renderInventory(container);
    if (currentPage === "sales") renderSales(container);
    if (currentPage === "purchases") renderPurchases(container);
    if (currentPage === "reports") renderReports(container);
}

function getStats() {
    const todaySales = salesHistory
        .filter(sale => sale.date.slice(0, 10) === todayISO())
        .reduce((sum, sale) => sum + sale.total, 0);

    return {
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
        lowStock: products.filter(p => p.stock < 5).length,
        todaySales
    };
}

function renderDashboard(container) {
    const stats = getStats();
    const lowProducts = products.filter(p => p.stock < 5);
    const recentSales = salesHistory.slice(-5).reverse();

    container.innerHTML = `
        <div class="page">
            <div class="page-title-row">
                <div class="page-title">
                    <h2>${t("appTitle")}</h2>
                    <p>Abidjan • ${new Date().toLocaleDateString(currentLang === "ar" ? "ar-DZ" : currentLang)}</p>
                </div>
                <button onclick="navigateTo('sales')" class="btn btn-primary">
                    <i class="fas fa-cash-register"></i>
                    ${t("sales")}
                </button>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card"><p>${t("totalProducts")}</p><strong>${stats.totalProducts}</strong></div>
                <div class="kpi-card"><p>${t("totalValue")}</p><strong>${money(stats.totalValue)}</strong></div>
                <div class="kpi-card"><p>${t("lowStock")}</p><strong class="stock-low">${stats.lowStock}</strong></div>
                <div class="kpi-card"><p>${t("todaySales")}</p><strong>${money(stats.todaySales)}</strong></div>
            </div>

            <div class="grid md:grid-cols-2 gap-4 mt-4">
                <div class="panel">
                    <h3 class="text-xl font-bold mb-4">${t("lowStock")}</h3>
                    ${lowProducts.length ? lowProducts.map(p => `
                        <div class="flex justify-between py-3 border-b border-zinc-800">
                            <span>${getProductName(p)}</span>
                            <span class="badge badge-warning">${p.stock}</span>
                        </div>
                    `).join("") : `<div class="empty-state">${t("noResults")}</div>`}
                </div>

                <div class="panel">
                    <h3 class="text-xl font-bold mb-4">${t("recentSales")}</h3>
                    ${recentSales.length ? recentSales.map(s => `
                        <div class="flex justify-between py-3 border-b border-zinc-800">
                            <span>#${s.id} • ${new Date(s.date).toLocaleDateString(currentLang)}</span>
                            <strong>${money(s.total)}</strong>
                        </div>
                    `).join("") : `<div class="empty-state">${t("noSales")}</div>`}
                </div>
            </div>
        </div>
    `;
}

function filteredProducts() {
    const query = inventorySearch.trim().toLowerCase();

    return products.filter(product => {
        const matchesSearch =
            getProductName(product).toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query);

        const matchesCategory =
            inventoryCategory === "all" || product.category === inventoryCategory;

        return matchesSearch && matchesCategory;
    });
}

function renderInventory(container) {
    const list = filteredProducts();

    container.innerHTML = `
        <div class="page">
            <div class="page-title-row">
                <div class="page-title">
                    <h2>${t("inventory")}</h2>
                    <p>${products.length} ${t("totalProducts").toLowerCase()}</p>
                </div>
                <button onclick="showAddProductModal()" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    ${t("addProduct")}
                </button>
            </div>

            <div class="toolbar">
                <div class="search-wrap">
                    <i class="fas fa-search"></i>
                    <input value="${inventorySearch}" oninput="inventorySearch=this.value; renderCurrentPage();" class="search-input" placeholder="${t("searchProducts")}">
                </div>

                <select onchange="inventoryCategory=this.value; renderCurrentPage();" class="form-select" style="max-width:220px;">
                    <option value="all">${t("allCategories")}</option>
                    ${Object.keys(categoryTranslations).map(key => `
                        <option value="${key}" ${inventoryCategory === key ? "selected" : ""}>${getCategoryName(key)}</option>
                    `).join("")}
                </select>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>${t("product")}</th>
                            <th>${t("category")}</th>
                            <th>${t("brand")}</th>
                            <th class="num">${t("price")}</th>
                            <th class="num">${t("stock")}</th>
                            <th class="num">${t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.length ? list.map(p => `
                            <tr>
                                <td>
                                    <div class="product-cell">
                                        <div class="product-thumb">
                                            ${p.image ? `<img src="${p.image}" alt="">` : productIcon(p)}
                                        </div>
                                        <strong>${getProductName(p)}</strong>
                                    </div>
                                </td>
                                <td>${getCategoryName(p.category)}</td>
                                <td>${p.brand}</td>
                                <td class="num">${money(p.price)}</td>
                                <td class="num">
                                    <span class="badge ${p.stock < 5 ? "badge-warning" : "badge-success"}">${p.stock}</span>
                                </td>
                                <td class="num">
                                    <button onclick="editProduct(${p.id})" class="btn btn-ghost">${t("edit")}</button>
                                    <button onclick="deleteProduct(${p.id})" class="btn btn-ghost" style="color:#f87171;">${t("delete")}</button>
                                </td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="6">
                                    <div class="empty-state">${t("noResults")}</div>
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderSales(container) {
    const list = filteredProducts();

    container.innerHTML = `
        <div class="page">
            <div class="page-title-row">
                <div class="page-title">
                    <h2>${t("sales")}</h2>
                    <p>${t("salePrice")} editable in cart</p>
                </div>
                <button onclick="showCartPanel()" class="btn btn-primary">
                    <i class="fas fa-shopping-cart"></i>
                    ${t("cartTitle")} (${cart.reduce((sum, item) => sum + item.qty, 0)})
                </button>
            </div>

            <div class="toolbar">
                <div class="search-wrap">
                    <i class="fas fa-search"></i>
                    <input value="${inventorySearch}" oninput="inventorySearch=this.value; renderCurrentPage();" class="search-input" placeholder="${t("searchProducts")}">
                </div>

                <select onchange="inventoryCategory=this.value; renderCurrentPage();" class="form-select" style="max-width:220px;">
                    <option value="all">${t("allCategories")}</option>
                    ${Object.keys(categoryTranslations).map(key => `
                        <option value="${key}" ${inventoryCategory === key ? "selected" : ""}>${getCategoryName(key)}</option>
                    `).join("")}
                </select>
            </div>

            <div class="product-grid">
                ${list.length ? list.map(p => `
                    <div onclick="addToCart(${p.id})" class="product-card">
                        <div class="product-art">
                            ${p.image ? `<img src="${p.image}" alt="">` : productIcon(p)}
                        </div>
                        <div class="product-card-title">${getProductName(p)}</div>
                        <div class="product-card-meta">${p.brand} • ${getCategoryName(p.category)}</div>
                        <div class="product-card-bottom">
                            <span class="price">${money(p.price)}</span>
                            <span class="${p.stock < 5 ? "stock-low" : "stock-ok"}">${p.stock}</span>
                        </div>
                    </div>
                `).join("") : `<div class="empty-state">${t("noResults")}</div>`}
            </div>
        </div>
    `;
}

function renderPurchases(container) {
    container.innerHTML = `
        <div class="page" style="max-width:560px;">
            <div class="page-title-row">
                <div class="page-title">
                    <h2>${t("purchases")}</h2>
                    <p>${t("restock")} stock quickly</p>
                </div>
            </div>

            <div class="panel">
                <label>${t("product")}</label>
                <select id="restock-product" class="form-select mb-4">
                    ${products.map(p => `
                        <option value="${p.id}">${getProductName(p)} - ${p.stock}</option>
                    `).join("")}
                </select>

                <label>${t("qty")}</label>
                <input id="restock-qty" type="number" min="1" value="5" class="form-input mb-4">

                <button onclick="executeRestock()" class="btn btn-primary w-full">
                    <i class="fas fa-plus"></i>
                    ${t("restock")}
                </button>
            </div>
        </div>
    `;
}

function renderReports(container) {
    const totalSales = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    const totalItemsSold = salesHistory.reduce((sum, sale) => {
        return sum + sale.items.reduce((inner, item) => inner + item.qty, 0);
    }, 0);

    container.innerHTML = `
        <div class="page">
            <div class="page-title-row">
                <div class="page-title">
                    <h2>${t("reports")}</h2>
                    <p>${salesHistory.length} ${t("recentSales").toLowerCase()}</p>
                </div>
            </div>

            <div class="kpi-grid mb-4">
                <div class="kpi-card"><p>${t("recentSales")}</p><strong>${salesHistory.length}</strong></div>
                <div class="kpi-card"><p>${t("total")}</p><strong>${money(totalSales)}</strong></div>
                <div class="kpi-card"><p>${t("qty")}</p><strong>${totalItemsSold}</strong></div>
                <div class="kpi-card"><p>${t("lowStock")}</p><strong class="stock-low">${products.filter(p => p.stock < 5).length}</strong></div>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>${t("qty")}</th>
                            <th class="num">${t("total")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${salesHistory.length ? salesHistory.slice().reverse().map(sale => `
                            <tr>
                                <td>#${sale.id}</td>
                                <td>${new Date(sale.date).toLocaleString(currentLang)}</td>
                                <td>${sale.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                                <td class="num">${money(sale.total)}</td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="4">
                                    <div class="empty-state">${t("noSales")}</div>
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function addToCart(id) {
    const product = products.find(p => p.id === id);

    if (!product || product.stock < 1) {
        showToast(t("outOfStock"), true);
        return;
    }

    const existing = cart.find(item => item.productId === id);

    if (existing) {
        if (existing.qty >= product.stock) {
            showToast(t("notEnoughStock"), true);
            return;
        }
        existing.qty++;
    } else {
        cart.push({
            productId: id,
            qty: 1,
            salePrice: product.price
        });
    }

    showToast(getProductName(product));
    renderCurrentPage();
}

function showCartPanel() {
    document.getElementById("cart-panel").classList.remove("hidden");
    renderCart();
}

function hideCartPanel() {
    document.getElementById("cart-panel").classList.add("hidden");
}

function renderCart() {
    let subtotal = 0;

    const itemsHtml = cart.map((item, index) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return "";

        const lineTotal = item.salePrice * item.qty;
        subtotal += lineTotal;

        return `
            <div class="cart-item">
                <div class="cart-item-top">
                    <div>
                        <strong>${getProductName(product)}</strong>
                        <div style="font-size:12px; color:#71717a;">${product.brand} • ${money(product.price)}</div>
                    </div>
                    <strong>${money(lineTotal)}</strong>
                </div>

                <div class="cart-controls">
                    <div class="qty-control">
                        <button onclick="changeCartQty(${index}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="changeCartQty(${index}, 1)">+</button>
                    </div>

                    <input class="cart-price-input" type="number" min="0" value="${item.salePrice}" onchange="changeCartPrice(${index}, this.value)">

                    <button onclick="removeFromCart(${index})" class="btn btn-danger" title="${t("remove")}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");

    document.getElementById("cart-panel").innerHTML = `
        <div class="cart-panel">
            <div class="cart-head flex justify-between items-center">
                <h2 class="text-2xl font-bold">${t("cartTitle")}</h2>
                <button onclick="hideCartPanel()" class="btn btn-ghost" style="color:#18181b;">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>

            <div class="cart-body">
                ${cart.length ? itemsHtml : `<div class="empty-state">${t("cartEmpty")}</div>`}
            </div>

            <div class="cart-foot">
                <div class="flex justify-between text-xl mb-4">
                    <span>${t("total")}</span>
                    <strong>${money(subtotal)}</strong>
                </div>

                <button onclick="completeSale()" class="btn btn-primary w-full">
                    <i class="fas fa-check"></i>
                    ${t("completeSale")}
                </button>

                <button onclick="clearCart()" class="btn btn-ghost w-full mt-2" style="color:#dc2626;">
                    ${t("clearCart")}
                </button>
            </div>
        </div>
    `;
}

function changeCartQty(index, delta) {
    const item = cart[index];
    const product = products.find(p => p.id === item.productId);
    if (!item || !product) return;

    const nextQty = item.qty + delta;

    if (nextQty <= 0) {
        removeFromCart(index);
        return;
    }

    if (nextQty > product.stock) {
        showToast(t("notEnoughStock"), true);
        return;
    }

    item.qty = nextQty;
    renderCart();
    renderCurrentPage();
}

function changeCartPrice(index, value) {
    const price = Math.max(0, parseFloat(value) || 0);
    cart[index].salePrice = price;
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    renderCurrentPage();
}

function clearCart() {
    cart = [];
    hideCartPanel();
    renderCurrentPage();
}

function completeSale() {
    if (!cart.length) {
        showToast(t("cartEmpty"), true);
        return;
    }

    let valid = true;
    let total = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);

        if (!product || product.stock < item.qty) valid = false;
        total += item.salePrice * item.qty;
    });

    if (!valid) {
        showToast(t("notEnoughStock"), true);
        return;
    }

    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        product.stock -= item.qty;
    });

    const sale = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: cart.map(item => ({ ...item })),
        total
    };

    salesHistory.push(sale);
    cart = [];

    saveToStorage();
    hideCartPanel();
    showToast(t("saleDone"));
    renderCurrentPage();
}

function executeRestock() {
    const id = parseInt(document.getElementById("restock-product").value, 10);
    const qty = parseInt(document.getElementById("restock-qty").value, 10) || 0;

    if (qty <= 0) return;

    const product = products.find(p => p.id === id);

    if (product) {
        product.stock += qty;

        purchasesHistory.push({
            id: Date.now(),
            productId: id,
            qty,
            date: new Date().toISOString()
        });

        saveToStorage();
        showToast(t("stockUpdated"));
        renderCurrentPage();
    }
}

function showAddProductModal() {
    editingProductId = null;
    showModal(true);
}

function editProduct(id) {
    editingProductId = id;
    const product = products.find(p => p.id === id);
    showModal(false, product);
}

function showModal(isAdd, product = null) {
    const modal = document.getElementById("add-modal");

    modal.innerHTML = `
        <div class="modal-card">
            <div class="modal-head">
                <h2 class="text-2xl font-bold">${isAdd ? t("modalTitleAdd") : t("modalTitleEdit")}</h2>
                <button onclick="hideModal()" class="btn btn-ghost" style="color:#18181b;">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>

            <div class="modal-body">
                <div>
                    <label>${t("image")}</label>
                    <input type="file" id="product-image" accept="image/*">
                    ${product && product.image ? `<img src="${product.image}" style="margin-top:10px;width:86px;height:86px;object-fit:cover;border-radius:14px;">` : ""}
                </div>

                <div class="form-grid-3">
                    <div>
                        <label>Name EN</label>
                        <input id="name-en" class="light-input" value="${product ? escapeHTML(product.names.en) : ""}">
                    </div>
                    <div>
                        <label>Name FR</label>
                        <input id="name-fr" class="light-input" value="${product ? escapeHTML(product.names.fr || "") : ""}">
                    </div>
                    <div>
                        <label>Name AR</label>
                        <input id="name-ar" class="light-input" value="${product ? escapeHTML(product.names.ar || "") : ""}">
                    </div>
                </div>

                <div class="form-grid-2">
                    <div>
                        <label>${t("brand")}</label>
                        <input id="brand" class="light-input" value="${product ? escapeHTML(product.brand) : "Yamaha"}">
                    </div>
                    <div>
                        <label>${t("category")}</label>
                        <select id="category" class="light-input">
                            ${Object.keys(categoryTranslations).map(key => `
                                <option value="${key}" ${product && product.category === key ? "selected" : ""}>${getCategoryName(key)}</option>
                            `).join("")}
                        </select>
                    </div>
                </div>

                <div class="form-grid-2">
                    <div>
                        <label>${t("price")}</label>
                        <input id="price" type="number" min="0" class="light-input" value="${product ? product.price : 45000}">
                    </div>
                    <div>
                        <label>${t("stock")}</label>
                        <input id="stock" type="number" min="0" class="light-input" value="${product ? product.stock : 10}">
                    </div>
                </div>
            </div>

            <div class="modal-foot">
                <button onclick="hideModal()" class="btn btn-soft" style="background:#f4f4f5;color:#18181b;">${t("cancel")}</button>
                <button onclick="saveProduct()" class="btn btn-primary">${t("save")}</button>
            </div>
        </div>
    `;

    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

function hideModal() {
    const modal = document.getElementById("add-modal");
    modal.classList.add("hidden");
    modal.style.display = "";
}

function saveProduct() {
    const nameEn = document.getElementById("name-en").value.trim();
    const nameFr = document.getElementById("name-fr").value.trim();
    const nameAr = document.getElementById("name-ar").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const category = document.getElementById("category").value;
    const price = parseFloat(document.getElementById("price").value);
    const stock = parseInt(document.getElementById("stock").value, 10);

    if (!nameEn || !brand || isNaN(price)) {
        showToast(t("required"), true);
        return;
    }

    const imageInput = document.getElementById("product-image");

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = event => finishSave(event.target.result);
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        finishSave(null);
    }

    function finishSave(image) {
        if (editingProductId) {
            const product = products.find(p => p.id === editingProductId);

            if (product) {
                product.names = {
                    en: nameEn,
                    fr: nameFr || nameEn,
                    ar: nameAr || nameEn
                };
                product.brand = brand;
                product.category = category;
                product.price = price;
                product.stock = Math.max(0, stock || 0);
                if (image) product.image = image;
            }
        } else {
            products.unshift({
                id: Date.now(),
                names: {
                    en: nameEn,
                    fr: nameFr || nameEn,
                    ar: nameAr || nameEn
                },
                brand,
                category,
                price,
                stock: Math.max(0, stock || 0),
                image
            });
        }

        saveToStorage();
        hideModal();
        showToast(t("saved"));
        renderCurrentPage();
    }
}

function deleteProduct(id) {
    if (!confirm(`${t("delete")} ?`)) return;

    products = products.filter(p => p.id !== id);
    cart = cart.filter(item => item.productId !== id);

    saveToStorage();
    showToast(t("deleted"));
    renderCurrentPage();
}

function exportToCSV() {
    const rows = [
        ["ID", "Name_EN", "Name_FR", "Name_AR", "Brand", "Category", "Price_XOF", "Stock"],
        ...products.map(p => [
            p.id,
            p.names.en,
            p.names.fr || "",
            p.names.ar || "",
            p.brand,
            p.category,
            p.price,
            p.stock
        ])
    ];

    const csv = rows.map(row => {
        return row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",");
    }).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `yamahabidjan_stock_${todayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showToast(t("exportCSV"));
}

function resetDemoData() {
    if (!confirm(t("resetData") + "?")) return;

    seedData();
    saveToStorage();
    showToast(t("stockUpdated"));
    renderCurrentPage();
}

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.style.background = isError ? "#ef4444" : "#00b8a9";
    toast.classList.remove("hidden");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2600);
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

window.onload = function () {
    loadFromStorage();
    renderSidebar();
    renderMobileNav();
    switchLanguage(currentLang);
    navigateTo("dashboard");
};
