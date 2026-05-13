const products = {
    femme: [
        { name: "Robe Soie Quartz", price: "18.500 DZD", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8" },
        { name: "Veste Tailleur", price: "22.000 DZD", img: "https://images.unsplash.com/photo-1548733221-08149870f2f3" }
    ],
    homme: [
        { name: "Costume Noir Prestige", price: "45.000 DZD", img: "https://images.unsplash.com/photo-1594932224828-b4b059b6a684" }
    ],
    beaute: [
        { name: "Sérum Éclat", price: "6.800 DZD", img: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0" }
    ]
};

function renderCategory(cat) {
    const container = document.getElementById('dynamic-render');
    const items = products[cat] || products['femme'];
    
    container.innerHTML = `
        <div class="category-page">
            <h2 style="font-family:'Playfair Display'; font-size:3rem; margin-bottom:40px;">${cat.toUpperCase()}</h2>
            <div class="product-grid">
                ${items.map(p => `
                    <div class="product-card">
                        <img src="${p.img}" alt="${p.name}">
                        <h3 style="margin:15px 0 5px;">${p.name}</h3>
                        <p style="color:#D4AF37; font-weight:bold;">${p.price}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    window.scrollTo(0,0);
}

function renderHome() {
    document.getElementById('dynamic-render').innerHTML = `
        <section style="height:70vh; background:url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d') center/cover; display:flex; align-items:center; justify-content:center; color:white;">
            <div style="text-align:center;">
                <h1 style="font-family:'Playfair Display'; font-size:4rem; letter-spacing:10px;">L'ÉLÉGANCE AU QUARTZ</h1>
                <button onclick="renderCategory('femme')" style="margin-top:20px; padding:15px 40px; background:#D4AF37; color:white; border:none; cursor:pointer;">DÉCOUVRIR</button>
            </div>
        </section>
    `;
}

function setLanguage(lang) {
    document.body.classList.toggle('rtl', lang === 'ar');
    document.querySelectorAll('.lang-selector span').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
}

window.onload = renderHome;