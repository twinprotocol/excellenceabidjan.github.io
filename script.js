/* --- Gestion de la Base de Données[cite: 1] --- */
let database = JSON.parse(localStorage.getItem('pinkcoin_storage')) || [
    { name: "Robe Quartz Edition", price: "14500", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500" }
];

/* --- Affichage des Articles --- */
function renderArticles() {
    const container = document.getElementById('shop-container');
    if(!container) return;
    container.innerHTML = "";
    database.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <img src="${item.img}" alt="${item.name}">
                <h3 style="margin:10px 0;">${item.name}</h3>
                <p class="price">${item.price} DZD</p>
                <button class="btn-buy t-buy">ACHETER</button>
            </div>
        `;
    });
}

/* --- Ajouter un Nouvel Article[cite: 1] --- */
function addNewItem() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const img = document.getElementById('p-img').value;

    if(name && price && img) {
        database.push({ name, price, img });
        localStorage.setItem('pinkcoin_storage', JSON.stringify(database));
        renderArticles();
        toggleAdmin(); // Fermer le panel après ajout
    } else {
        alert("Veuillez remplir tous les champs.");
    }
}

/* --- Gestion des Langues (Sauf PinkCoin)[cite: 1] --- */
function updateLang(lang) {
    const body = document.getElementById('main-body');
    const texts = {
        fr: { f: "Femme", h: "Homme", b: "Beauté", r: "Robes", j: "Jupes", s: "Livraison gratuite sur 58 Wilayas", buy: "ACHETER" },
        en: { f: "Women", h: "Men", b: "Beauty", r: "Dresses", j: "Skirts", s: "Free shipping on 58 Wilayas", buy: "BUY NOW" },
        ar: { f: "نساء", h: "رجال", b: "جمال", r: "فساتين", j: "تنورات", s: "توصيل مجاني لـ 58 ولاية", buy: "اشتري الآن" }
    };
    
    body.className = (lang === 'ar' ? 'rtl' : '');
    document.getElementById('nav-f').innerText = texts[lang].f;
    document.getElementById('nav-h').innerText = texts[lang].h;
    document.getElementById('nav-b').innerText = texts[lang].b;
    document.getElementById('sub-robes').innerText = texts[lang].r;
    document.getElementById('sub-jupes').innerText = texts[lang].j;
    document.getElementById('ship-info').innerText = texts[lang].s;
    document.querySelectorAll('.t-buy').forEach(b => b.innerText = texts[lang].buy);
}

/* --- Afficher/Cacher le Panel Admin --- */
function toggleAdmin() {
    const p = document.getElementById('admin-panel');
    p.style.display = (p.style.display === 'block' ? 'none' : 'block');
}

// Lancement automatique au chargement
window.onload = renderArticles;