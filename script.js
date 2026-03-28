// ====================== TRANSLATIONS ======================
const translations = {
    en: { /* ... same as before ... */ },
    fr: { /* ... same as before ... */ },
    ar: { /* ... same as before ... */ }
};

const categoryTranslations = {
    guitars: { en: "Guitars", fr: "Guitares", ar: "الغيتارات" },
    keyboards: { en: "Keyboards", fr: "Claviers", ar: "الكيبوردات" },
    drums: { en: "Drums", fr: "Batteries", ar: "الطبول" },
    wind: { en: "Wind Instruments", fr: "Instruments à vent", ar: "آلات النفخ" },
    accessories: { en: "Accessories", fr: "Accessoires", ar: "الإكسسوارات" }
};

// ====================== GLOBAL STATE ======================
let currentLang = 'en';
let currentPage = 'dashboard';
let products = [];
let salesHistory = [];
let purchasesHistory = [];
let cart = [];
let editingProductId = null;
let lastTransactionId = 1000;

// ====================== SAMPLE DATA ======================
function seedData() {
    products = [
        { id: 1, names: {en:"FG800 Acoustic Guitar", fr:"Guitare acoustique FG800", ar:"غيتار أكوستيك FG800"}, brand:"Yamaha", category:"guitars", price:45000, stock:14 },
        { id: 2, names: {en:"P-125 Digital Piano", fr:"Piano numérique P-125", ar:"بيانو رقمي P-125"}, brand:"Yamaha", category:"keyboards", price:135000, stock:7 },
        { id: 3, names: {en:"DTX402 Electronic Drum Kit", fr:"Kit de batterie électronique DTX402", ar:"طقم طبول إلكتروني DTX402"}, brand:"Yamaha", category:"drums", price:210000, stock:4 },
        { id: 4, names: {en:"YTR-2330 Trumpet", fr:"Trompette YTR-2330", ar:"ترومبيت YTR-2330"}, brand:"Yamaha", category:"wind", price:68000, stock:11 },
        { id: 5, names: {en:"Stratocaster Electric Guitar", fr:"Guitare électrique Stratocaster", ar:"غيتار كهربائي ستراتوكاستر"}, brand:"Fender", category:"guitars", price:185000, stock:6 },
        { id: 6, names: {en:"SM58 Dynamic Microphone", fr:"Microphone dynamique SM58", ar:"ميكروفون ديناميكي SM58"}, brand:"Shure", category:"accessories", price:22000, stock:28 }
    ];

    salesHistory = [];
    purchasesHistory = [];
}

// ====================== STORAGE ======================
function loadFromStorage() {
    const saved = localStorage.getItem('promusic_products');
    if (saved) products = JSON.parse(saved);
    else seedData();

    const savedSales = localStorage.getItem('promusic_sales');
    if (savedSales) salesHistory = JSON.parse(savedSales);

    const savedPurchases = localStorage.getItem('promusic_purchases');
    if (savedPurchases) purchasesHistory = JSON.parse(savedPurchases);

    const savedLang = localStorage.getItem('promusic_lang');
    if (savedLang) currentLang = savedLang;
}

function saveToStorage() {
    localStorage.setItem('promusic_products', JSON.stringify(products));
    localStorage.setItem('promusic_sales', JSON.stringify(salesHistory));
    localStorage.setItem('promusic_purchases', JSON.stringify(purchasesHistory));
    localStorage.setItem('promusic_lang', currentLang);
}

// ====================== LANGUAGE ======================
function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.getElementById('main-content').classList.toggle('rtl', lang === 'ar');
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `lang-${lang}`);
    });

    saveToStorage();
    renderCurrentPage();
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

// ====================== NAVIGATION ======================
function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const active = document.getElementById(`nav-${page}`);
    if (active) active.classList.add('active');
    renderCurrentPage();
}

// ====================== RENDER PAGES ======================
function renderCurrentPage() {
    const content = document.getElementById('main-content');
    
    if (currentPage === 'dashboard') renderDashboard(content);
    else if (currentPage === 'inventory') renderInventory(content);
    else if (currentPage === 'sales') renderSales(content);
    else if (currentPage === 'purchases') renderPurchases(content);
    else if (currentPage === 'reports') renderReports(content);
}

// (Add the rest of the functions: renderDashboard, renderInventory, renderSales, etc.)

// For brevity, I'm showing the structure. 
// Copy the full JavaScript functions from my previous message into this file.

// At the end of script.js, add:
window.onload = function() {
    loadFromStorage();
    renderSidebar();
    navigateTo('dashboard');
    console.log('✅ ProMusic App Loaded Successfully!');
};

// ====================== SIDEBAR RENDER ======================
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
        <nav class="space-y-2">
            <a onclick="navigateTo('dashboard')" id="nav-dashboard" class="nav-item flex items-center gap-x-3 px-4 py-4 rounded-3xl text-lg font-medium cursor-pointer">
                <i class="fas fa-gauge-high w-6"></i><span>Dashboard</span>
            </a>
            <a onclick="navigateTo('inventory')" id="nav-inventory" class="nav-item flex items-center gap-x-3 px-4 py-4 rounded-3xl text-lg font-medium cursor-pointer">
                <i class="fas fa-boxes-stacked w-6"></i><span>Inventory</span>
            </a>
            <a onclick="navigateTo('sales')" id="nav-sales" class="nav-item flex items-center gap-x-3 px-4 py-4 rounded-3xl text-lg font-medium cursor-pointer">
                <i class="fas fa-cash-register w-6"></i><span>Sales / POS</span>
            </a>
            <a onclick="navigateTo('purchases')" id="nav-purchases" class="nav-item flex items-center gap-x-3 px-4 py-4 rounded-3xl text-lg font-medium cursor-pointer">
                <i class="fas fa-truck-loading w-6"></i><span>Purchases</span>
            </a>
            <a onclick="navigateTo('reports')" id="nav-reports" class="nav-item flex items-center gap-x-3 px-4 py-4 rounded-3xl text-lg font-medium cursor-pointer">
                <i class="fas fa-chart-bar w-6"></i><span>Reports</span>
            </a>
        </nav>
        <!-- Rest of sidebar content -->
    `;
}