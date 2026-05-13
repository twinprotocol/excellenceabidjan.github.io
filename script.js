const products = {
    femme: [{ name: "Robe Diamant", price: "24.000 DZD", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8" }],
    homme: [{ name: "Costume Quartz", price: "45.000 DZD", img: "https://images.unsplash.com/photo-1594932224828-b4b059b6a684" }],
    enfant: [{ name: "Ensemble Petit Prince", price: "12.000 DZD", img: "https://images.unsplash.com/photo-1519704943920-18447d21755b" }],
    accessoires: [{ name: "Collier Or Luxe", price: "15.000 DZD", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3" }]
};

// Fonction pour créer les diamants brillants
function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const container = document.getElementById('sparkle-container');
    
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        // Position aléatoire autour de l'élément cliqué
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        container.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    }
}

function selectCategory(el, cat) {
    createSparkles(el); // Effet brillant
    renderCategory(cat);
}

function renderCategory(cat) {
    const container = document.getElementById('dynamic-render');
    const items = products[cat] || products.femme;
    container.innerHTML = `
        <div style="padding: 50px 8%; animation: fadeIn 0.8s;">
            <h2 style="font-family:'Playfair Display'; font-size:2.5rem; text-align:center; margin-bottom:40px;">${cat.toUpperCase()}</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:30px;">
                ${items.map(p => `
                    <div class="product-card" style="background:white; padding:15px; text-align:center;">
                        <img src="${p.img}" style="width:100%; height:400px; object-fit:cover;">
                        <h3 style="margin:15px 0;">${p.name}</h3>
                        <p style="color:#D4AF37; font-weight:bold; margin-bottom:15px;">${p.price}</p>
                        <button onclick="addToCart()" style="width:100%; padding:10px; background:#0a0a0a; color:white; border:none; cursor:pointer;">AJOUTER AU PANIER</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

let count = 0;
function addToCart() {
    count++;
    document.getElementById('cart-count').innerText = count;
}

function renderHome() {
    document.getElementById('dynamic-render').innerHTML = `
        <section style="height:70vh; background:url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d') center/cover; display:flex; align-items:center; justify-content:center;">
            <button onclick="renderCategory('femme')" style="padding:15px 40px; background:var(--gold); color:white; border:none; font-weight:bold; cursor:pointer; letter-spacing:2px;">COLLECTION 2026</button>
        </section>
    `;
}

window.onload = renderHome;