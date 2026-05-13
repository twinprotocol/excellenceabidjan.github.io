const inventory = {
    femme: [
        { name: "Robe Soie Quartz", price: "18.500 DZD", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8" },
        { name: "Ensemble Satin Rose", price: "22.000 DZD", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446" },
        { name: "Manteau Cachemire", price: "35.000 DZD", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b" },
        { name: "Robe de Gala Noire", price: "42.000 DZD", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae" }
    ],
    homme: [
        { name: "Costume Prestige Noir", price: "48.000 DZD", img: "https://images.unsplash.com/photo-1594932224828-b4b059b6a684" },
        { name: "Chemise Coton Égyptien", price: "9.500 DZD", img: "https://images.unsplash.com/photo-1598033129183-c4f50c717658" },
        { name: "Blazer Lin Bleu", price: "21.000 DZD", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf" }
    ],
    enfant: [
        { name: "Robe Petite Fleur", price: "7.500 DZD", img: "https://images.unsplash.com/photo-1519704943920-18447d21755b" },
        { name: "Costume Petit Prince", price: "12.000 DZD", img: "https://images.unsplash.com/photo-1621454523226-ce7936d6d392" }
    ],
    accessoires: [
        { name: "Sac Cuir Vintage", price: "18.900 DZD", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3" },
        { name: "Collier Or 18K", price: "55.000 DZD", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338" }
    ],
    beaute: [
        { name: "Sérum Éclat Rose", price: "6.800 DZD", img: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0" }
    ]
};

function createDiamonds(e) {
    const container = document.getElementById('diamond-field');
    for (let i = 0; i < 15; i++) {
        const d = document.createElement('div');
        d.className = 'diamond';
        d.style.left = (e.pageX + (Math.random() - 0.5) * 120) + 'px';
        d.style.top = (e.pageY + (Math.random() - 0.5) * 120) + 'px';
        container.appendChild(d);
        setTimeout(() => d.remove(), 1000);
    }
}

function triggerCategory(el, cat) {
    createDiamonds(window.event);
    renderCategory(cat);
}

function renderCategory(cat) {
    const main = document.getElementById('app-viewport');
    const items = inventory[cat] || [];
    main.innerHTML = `
        <div class="product-grid" style="animation: fadeIn 0.8s;">
            ${items.map(p => `
                <div class="p-card">
                    <img src="${p.img}?auto=format&fit=crop&w=600">
                    <h3 style="margin-top:15px; font-family:'Playfair Display';">${p.name}</h3>
                    <p class="p-price">${p.price}</p>
                    <button class="btn-add" onclick="addToCart()">Ajouter au Panier</button>
                </div>
            `).join('')}
        </div>
    `;
    window.scrollTo(0,0);
}

let count = 0;
function addToCart() {
    count++;
    document.getElementById('cart-count').innerText = count;
}

function showCart() {
    alert("Simulation Panier: " + count + " articles sélectionnés pour PINKOIN.");
}

function changeLang(lang) {
    document.body.classList.toggle('rtl', lang === 'ar');
    document.querySelectorAll('.lang-switch span').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
}

function renderHome() {
    document.getElementById('app-viewport').innerHTML = `
        <div style="height:70vh; background:url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d') center/cover; display:flex; align-items:center; justify-content:center;">
            <button onclick="renderCategory('femme')" style="padding:20px 60px; background:var(--gold); color:white; border:none; cursor:pointer; font-weight:bold; letter-spacing:4px;">NOUVELLE COLLECTION</button>
        </div>
    `;
}

window.onload = renderHome;