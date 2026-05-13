const products = {
    femme: [
        { name: "Robe Soie Quartz", price: "18.500 DZD", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600" },
        { name: "Tailleur Ivory", price: "24.000 DZD", img: "https://images.unsplash.com/photo-1548733221-08149870f2f3?w=600" },
        { name: "Manteau Laine Rose", price: "32.000 DZD", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600" },
        { name: "Robe Plissée", price: "15.900 DZD", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600" }
    ],
    robes: [
        { name: "Robe de Gala Noire", price: "42.000 DZD", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600" },
        { name: "Robe Satin Champagne", price: "38.500 DZD", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600" },
        { name: "Robe Dentelle", price: "29.000 DZD", img: "https://images.unsplash.com/photo-1572804013307-f9611c121245?w=600" }
    ],
    homme: [
        { name: "Costume Slim Prestige", price: "45.000 DZD", img: "https://images.unsplash.com/photo-1594932224828-b4b059b6a684?w=600" },
        { name: "Chemise Coton Égyptien", price: "9.500 DZD", img: "https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=600" },
        { name: "Blazer Lin Bleu", price: "21.000 DZD", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600" },
        { name: "Pantalons Chino", price: "8.900 DZD", img: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600" }
    ],
    beaute: [
        { name: "Sérum Éclat Quartz", price: "6.800 DZD", img: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?w=600" },
        { name: "Huile de Soin Visage", price: "4.500 DZD", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600" },
        { name: "Crème de Nuit Régénérante", price: "7.200 DZD", img: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600" }
    ],
    accessoires: [
        { name: "Sac Cuir Vintage", price: "18.900 DZD", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600" },
        { name: "Lunettes de Soleil Or", price: "12.000 DZD", img: "https://images.unsplash.com/photo-1511499767350-a1590fdb2ca1?w=600" },
        { name: "Foulard Soie Imprimé", price: "5.500 DZD", img: "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=600" },
        { name: "Montre Quartz Minimal", price: "25.000 DZD", img: "https://images.unsplash.com/photo-1524592093033-697990772bb3?w=600" }
    ]
};

const texts = {
    fr: { ship: "Livraison Prestige 58 Wilayas", hero: "L'ÉLÉGANCE AU QUARTZ", btn: "DÉCOUVRIR" },
    en: { ship: "Prestige Shipping 58 Wilayas", hero: "QUARTZ ELEGANCE", btn: "DISCOVER" },
    ar: { ship: "توصيل فاخر لـ 58 ولاية", hero: "أناقة الكوارتز", btn: "اكتشفوا الآن" }
};

function renderCategory(cat) {
    const container = document.getElementById('dynamic-render');
    const items = products[cat] || products.femme;
    
    container.innerHTML = `
        <div class="category-page">
            <h2 style="font-family:'Playfair Display'; font-size:3rem; margin-bottom:50px; text-align:center; letter-spacing:5px;">${cat.toUpperCase()}</h2>
            <div class="product-grid">
                ${items.map(p => `
                    <div class="p-card">
                        <img src="${p.img}" alt="${p.name}">
                        <div class="p-info">
                            <h3>${p.name}</h3>
                            <p class="p-price">${p.price}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    window.scrollTo(0,0);
}

function renderHome() {
    document.getElementById('dynamic-render').innerHTML = `
        <section class="hero-box" style="background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070');">
            <div class="hero-content">
                <h1 id="hero-title">${texts.fr.hero}</h1>
                <button onclick="renderCategory('femme')" style="margin-top:30px; padding:15px 45px; background:var(--gold); color:white; border:none; cursor:pointer; font-weight:600; letter-spacing:2px;">DÉCOUVRIR</button>
            </div>
        </section>
    `;
}

function setLanguage(lang) {
    document.body.classList.toggle('rtl', lang === 'ar');
    document.getElementById('ship-text').innerText = texts[lang].ship;
    if(document.getElementById('hero-title')) document.getElementById('hero-title').innerText = texts[lang].hero;
    document.querySelectorAll('.lang-selector span').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
}

window.onload = renderHome;