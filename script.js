/* Base de données Initiale */
let database = JSON.parse(localStorage.getItem('pinkcoin_db')) || [
    { name: "Robe Quartz Essence", price: "18500", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500" },
    { name: "Blazer Signature Noir", price: "24000", img: "https://images.unsplash.com/photo-1539109132314-d49c02d82267?w=500" }
];

/* Rendu des Articles */
function renderArticles() {
    const container = document.getElementById('shop-container');
    if(!container) return;
    container.innerHTML = "";
    database.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <img src="${item.img}" alt="${item.name}">
                <h3 style="margin:10px 0; font-family:'Playfair Display', serif;">${item.name}</h3>
                <p class="price">${item.price} DZD</p>
                <button class="btn-buy t-buy" onclick="handleOrder('${item.name}')">ACHETER</button>
            </div>
        `;
    });
}

/* Ajout Admin */
function addNewItem() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const img = document.getElementById('p-img').value;

    if(name && price && img) {
        database.push({ name, price, img });
        localStorage.setItem('pinkcoin_db', JSON.stringify(database));
        renderArticles();
        toggleAdmin();
        alert("Article publié sur PinkCoin !");
    }
}

/* Traduction Complète */
function updateLang(lang) {
    const body = document.getElementById('main-body');
    const texts = {
        fr: { f: "FEMME", h: "HOMME", e: "ENFANTS", b: "BEAUTÉ", r: "Robes", j: "Jupes", s: "Livraison gratuite sur 58 Wilayas", buy: "ACHETER", ens: "Ensembles", acc: "Accessoires", che: "Chemises", pan: "Pantalons", cos: "Costumes", mon: "Montres", beb: "Bébé", gar: "Garçon", fil: "Fille", jou: "Jouets" },
        en: { f: "WOMEN", h: "MEN", e: "KIDS", b: "BEAUTY", r: "Dresses", j: "Skirts", s: "Free shipping on 58 Wilayas", buy: "BUY NOW", ens: "Sets", acc: "Accessories", che: "Shirts", pan: "Pants", cos: "Suits", mon: "Watches", beb: "Baby", gar: "Boys", fil: "Girls", jou: "Toys" },
        ar: { f: "نساء", h: "رجال", e: "أطفال", b: "جمال", r: "فساتين", j: "تنورات", s: "توصيل مجاني لـ 58 ولاية", buy: "اشتري الآن", ens: "أطقم", acc: "إكسسوارات", che: "قمصان", pan: "سراويل", cos: "بذلات", mon: "ساعات", beb: "رضع", gar: "ولد", fil: "بنت", jou: "ألعاب" }
    };
    
    body.className = (lang === 'ar' ? 'rtl' : '');
    document.getElementById('nav-f').innerText = texts[lang].f;
    document.getElementById('nav-h').innerText = texts[lang].h;
    document.getElementById('nav-e').innerText = texts[lang].e;
    document.getElementById('nav-b').innerText = texts[lang].b;
    document.getElementById('ship-info').innerText = texts[lang].s;
    
    // Mise à jour sous-catégories
    const mapping = {
        '.t-sub-robes': 'r', '.t-sub-jupes': 'j', '.t-sub-ensembles': 'ens', '.t-sub-accessoires': 'acc',
        '.t-sub-chemises': 'che', '.t-sub-pantalons': 'pan', '.t-sub-costumes': 'cos', '.t-sub-montres': 'mon',
        '.t-sub-bebe': 'beb', '.t-sub-garcon': 'gar', '.t-sub-fille': 'fil', '.t-sub-jouets': 'jou'
    };
    Object.keys(mapping).forEach(sel => {
        const el = document.querySelector(sel);
        if(el) el.innerText = texts[lang][mapping[sel]];
    });
    document.querySelectorAll('.t-buy').forEach(b => b.innerText = texts[lang].buy);
}

/* Commande WhatsApp */
function handleOrder(product) {
    const msg = encodeURIComponent(`Bonjour PinkCoin, je souhaite commander l'article : ${product}`);
    window.open(`https://wa.me/213XXXXXXXXX?text=${msg}`, '_blank');
}

function toggleAdmin() {
    const p = document.getElementById('admin-panel');
    p.style.display = (p.style.display === 'block' ? 'none' : 'block');
}

window.onload = renderArticles;