/* Base de données locale (S'enregistre dans votre navigateur) */
let database = JSON.parse(localStorage.getItem('pinkcoin_db')) || [
    { name: "Collection Luxe Quartz", price: "19500", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500" }
];

/* Fonction pour afficher les produits */
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
                <button class="btn-buy t-buy" onclick="handleBuy('${item.name}')">ACHETER</button>
            </div>
        `;
    });
}

/* Ajouter un nouvel article (Admin) */
function addNewItem() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const img = document.getElementById('p-img').value;

    if(name && price && img) {
        database.push({ name, price, img });
        localStorage.setItem('pinkcoin_db', JSON.stringify(database));
        renderArticles();
        toggleAdmin();
        alert("Article mis en ligne !");
    } else {
        alert("Veuillez remplir tous les champs.");
    }
}

/* Moteur de traduction global */
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
    
    // Mise à jour de TOUTES les sous-catégories
    const mapping = {
        '.t-sub-robes': 'r', '.t-sub-jupes': 'j', '.t-sub-ensembles': 'ens', '.t-sub-accessoires': 'acc',
        '.t-sub-chemises': 'che', '.t-sub-pantalons': 'pan', '.t-sub-costumes': 'cos', '.t-sub-montres': 'mon',
        '.t-sub-bebe': 'beb', '.t-sub-garcon': 'gar', '.t-sub-fille': 'fil', '.t-sub-jouets': 'jou'
    };

    for (let selector in mapping) {
        const el = document.querySelector(selector);
        if(el) el.innerText = texts[lang][mapping[selector]];
    }

    document.querySelectorAll('.t-buy').forEach(btn => btn.innerText = texts[lang].buy);
}

function handleBuy(itemName) {
    alert("Commande pour : " + itemName + ". Bientôt disponible !");
}

function toggleAdmin() {
    const p = document.getElementById('admin-panel');
    p.style.display = (p.style.display === 'block' ? 'none' : 'block');
}

// Lancement au démarrage
window.onload = renderArticles;