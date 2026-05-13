const products = {
    femme: [
        { name: "Robe Soie Quartz", price: "18.500 DZD", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600" },
        { name: "Tailleur Ivory", price: "24.000 DZD", img: "https://images.unsplash.com/photo-1548733221-08149870f2f3?q=80&w=600" },
        { name: "Robe Satin Noire", price: "19.500 DZD", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600" }
    ],
    homme: [
        { name: "Costume Slim Prestige", price: "45.000 DZD", img: "https://images.unsplash.com/photo-1594932224828-b4b059b6a684?q=80&w=600" },
        { name: "Chemise Coton Blanc", price: "9.500 DZD", img: "https://images.unsplash.com/photo-1598033129183-c4f50c717658?q=80&w=600" },
        { name: "Veste Lin", price: "16.000 DZD", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600" }
    ],
    beaute: [
        { name: "Sérum Éclat Rose", price: "6.800 DZD", img: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=600" },
        { name: "Rouge à Lèvres Velours", price: "3.200 DZD", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600" }
    ],
    accessoires: [
        { name: "Sac Cuir Vintage", price: "18.900 DZD", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600" },
        { name: "Lunettes Oversize", price: "12.000 DZD", img: "https://images.unsplash.com/photo-1511499767350-a1590fdb2ca1?q=80&w=600" }
    ]
};

const texts = {
    fr: { ship: "Livraison Prestige 58 Wilayas", heroT: "L'ÉLÉGANCE AU QUARTZ", btn: "DÉCOUVRIR" },
    en: { ship: "Prestige Shipping 58 Wilayas", heroT: "QUARTZ ELEGANCE", btn: "DISCOVER" },
    ar: { ship: "توصيل فاخر لـ 58 ولاية", heroT: "أناقة الكوارتز", btn: "اكتشفوا الآن" }
};

function renderCategory(cat) {
    const container = document.getElementById('dynamic-render');
    const items = products[cat];
    
    container.innerHTML = `
        <div class="category-page">
            <h2 class="section-title">${cat.toUpperCase()}</h2>
            <div class="product-grid">
                ${items.map(p => `
                    <div class="product-card">
                        <div class="img-container"><img src="${p.img}" alt="${p.name}"></div>
                        <h3>${p.name}</h3>
                        <p class="price">${p.price}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    window.scrollTo(0,0);
}

function renderHome() {
    document.getElementById('dynamic-render').innerHTML = `
        <section class="hero-section">
            <div class="hero-content">
                <h1 id="hero-title">L'ÉLÉGANCE AU QUARTZ</h1>
                <button class="gold-btn" onclick="renderCategory('femme')" id="hero-btn">DÉCOUVRIR</button>
            </div>
        </section>
    `;
}

function setLanguage(lang) {
    document.body.classList.toggle('rtl', lang === 'ar');
    document.getElementById('ship-text').innerText = texts[lang].ship;
    if(document.getElementById('hero-title')) {
        document.getElementById('hero-title').innerText = texts[lang].heroT;
        document.getElementById('hero-btn').innerText = texts[lang].btn;
    }
    document.querySelectorAll('.lang-selector span').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
}

window.onload = renderHome;