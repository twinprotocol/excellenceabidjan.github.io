const products = {
    femme: [
        { name: "Robe Soie Quartz", price: "18.500 DZD", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600" },
        { name: "Tailleur Ivory Luxe", price: "24.000 DZD", img: "https://images.unsplash.com/photo-1548733221-08149870f2f3?w=600" },
        { name: "Robe Satin Noire", price: "21.000 DZD", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600" }
    ],
    homme: [
        { name: "Costume Slim Fit", price: "45.000 DZD", img: "https://images.unsplash.com/photo-1594932224828-b4b059b6a684?w=600" },
        { name: "Veste Lin Premium", price: "19.500 DZD", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600" }
    ],
    enfant: [
        { name: "Ensemble Coton Doux", price: "8.500 DZD", img: "https://images.unsplash.com/photo-1519704943920-18447d21755b?w=600" }
    ],
    accessoires: [
        { name: "Sac Cuir Vintage", price: "18.900 DZD", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600" },
        { name: "Lunettes de Soleil Or", price: "12.500 DZD", img: "https://images.unsplash.com/photo-1511499767350-a1590fdb2ca1?w=600" }
    ]
};

function createSparkles(e) {
    const container = document.getElementById('sparkle-container');
    for (let i = 0; i < 12; i++) {
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.style.left = (e.pageX + (Math.random() - 0.5) * 100) + 'px';
        s.style.top = (e.pageY + (Math.random() - 0.5) * 100) + 'px';
        container.appendChild(s);
        setTimeout(() => s.remove(), 800);
    }
}

function selectCategory(el, cat) {
    createSparkles(window.event);
    renderCategory(cat);
}

function renderCategory(cat) {
    const main = document.getElementById('dynamic-render');
    const items = products[cat] || products.femme;
    main.innerHTML = `
        <div style="padding: 60px 8%; animation: fadeIn 0.8s ease;">
            <h2 style="font-family:'Playfair Display'; font-size:3rem; text-align:center; margin-bottom:50px; letter-spacing:5px;">${cat.toUpperCase()}</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:40px;">
                ${items.map(p => `
                    <div class="product-card">
                        <img src="${p.img}">
                        <div style="padding:20px;">
                            <h3 style="font-family:'Playfair Display';">${p.name}</h3>
                            <p style="color:var(--gold); font-weight:bold; margin:10px 0;">${p.price}</p>
                            <button onclick="updateCart()" style="width:100%; padding:12px; background:var(--black); color:white; border:none; cursor:pointer; font-weight:600;">AJOUTER AU PANIER</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    window.scrollTo(0,0);
}

let cartCount = 0;
function updateCart() {
    cartCount++;
    document.getElementById('cart-count').innerText = cartCount;
}

function renderHome() {
    document.getElementById('dynamic-render').innerHTML = `
        <section style="height:75vh; background:linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600') center/cover; display:flex; align-items:center; justify-content:center;">
            <div style="text-align:center; color:white;">
                <h2 style="font-family:'Playfair Display'; font-size:4rem; letter-spacing:15px; margin-bottom:20px;">EXCELLENCE</h2>
                <button onclick="renderCategory('femme')" style="padding:18px 50px; background:var(--gold); color:white; border:none; font-weight:bold; cursor:pointer; letter-spacing:3px;">DÉCOUVRIR LA COLLECTION</button>
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