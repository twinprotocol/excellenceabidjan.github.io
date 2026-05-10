/* Base de données locale[cite: 1] */
let database = JSON.parse(localStorage.getItem('pinkcoin_db')) || [
    { name: "Collection Quartz Limited", price: "18500", img: "https://images.unsplash.com/photo-1539109132314-d49c02d82267?w=500" }
];

/* Affichage des articles[cite: 1] */
function renderArticles() {
    const container = document.getElementById('shop-container');
    if(!container) return;
    container.innerHTML = "";
    database.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <img src="${item.img}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">${item.price} DZD</p>
                <button class="btn-buy t-buy">ACHETER</button>
            </div>
        `;
    });
}

/* Ajouter un article via le panel[cite: 1] */
function addNewItem() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const img = document.getElementById('p-img').value;

    if(name && price && img) {
        database.push({ name, price, img });
        localStorage.setItem('pinkcoin_db', JSON.stringify(database));
        renderArticles();
        toggleAdmin();
        alert("Article publié avec succès ![cite: 1]");
    }
}

/* Traduction Complète[cite: 1] */
function updateLang(lang) {
    const body = document.getElementById('main-body');
    const texts = {
        fr: { f: "Femme", h: "Homme", e: "Enfants", b: "Beauté", r: "Robes", j: "Jupes", s: "Livraison gratuite sur 58 Wilayas", buy: "ACHETER", ens: "Ensembles", acc: "Accessoires", che: "Chemises", pan: "Pantalons", cos: "Costumes", mon: "Montres", beb: "Bébé", gar: "Garçon", fil: "Fille", jou: "Jouets" },
        en: { f: "Women", h: "Men", e: "Kids", b: "Beauty", r: "Dresses", j: "Skirts", s: "Free shipping on 58 Wilayas", buy: "BUY NOW", ens: "Sets", acc: "Accessories", che: "Shirts", pan: "Pants", cos: "Suits", mon: "Watches", beb: "Baby", gar: "Boys", fil: "Girls", jou: "Toys" },
        ar: { f: "نساء", h: "رجال", e: "أطفال", b: "جمال", r: "فساتين", j: "تنورات", s: "توصيل مجاني لـ 58 ولاية", buy: "اشتري الآن", ens: "أطقم", acc: "إكسسوارات", che: "قمصان", pan: "سراويل", cos: "بذلات", mon: "ساعات", beb: "رضع", gar: "ولد", fil: "بنت", jou: "ألعاب" }
    };
    
    body.className = (lang === 'ar' ? 'rtl' : '');
    document.getElementById('nav-f').innerText = texts[lang].f;
    document.getElementById('nav-h').innerText = texts[lang].h;
    document.getElementById('nav-e').innerText = texts[lang].e;
    document.getElementById('nav-b').innerText = texts[lang].b;
    document.getElementById('ship-info').innerText = texts[lang].s;
    
    // Sous-catégories[cite: 1]
    document.querySelector('.t-sub-robes').innerText = texts[lang].r;
    document.querySelector('.t-sub-jupes').innerText = texts[lang].j;
    document.querySelector('.t-sub-ensembles').innerText = texts[lang].ens;
    document.querySelector('.t-sub-accessoires').innerText = texts[lang].acc;
    document.querySelector('.t-sub-chemises').innerText = texts[lang].che;
    document.querySelector('.t-sub-pantalons').innerText = texts[lang].pan;
    document.querySelector('.t-sub-costumes').innerText = texts[lang].cos;
    document.querySelector('.t-sub-montres').innerText = texts[lang].mon;
    document.querySelector('.t-sub-bebe').innerText = texts[lang].beb;
    document.querySelector('.t-sub-garcon').innerText = texts[lang].gar;
    document.querySelector('.t-sub-fille').innerText = texts[lang].fil;
    document.querySelector('.t-sub-jouets').innerText = texts[lang].jou;

    document.querySelectorAll('.t-buy').forEach(btn => btn.innerText = texts[lang].buy);
}

function toggleAdmin() {
    const p = document.getElementById('admin-panel');
    p.style.display = (p.style.display === 'block' ? 'none' : 'block');
}

window.onload = renderArticles;