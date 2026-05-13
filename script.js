const dict = {
    fr: {
        femme: "FEMME", homme: "HOMME", enfant: "ENFANT", access: "ACCESSOIRES",
        ship: "Livraison Prestige 58 Wilayas",
        heroT: "L'ÉLÉGANCE AU QUARTZ", heroS: "Le raffinement de Paris à Alger.", btn: "DÉCOUVRIR"
    },
    en: {
        femme: "WOMEN", homme: "MEN", enfant: "KIDS", access: "ACCESSORIES",
        ship: "Prestige Delivery 58 Wilayas",
        heroT: "QUARTZ ELEGANCE", heroS: "Parisian refinement delivered to Algiers.", btn: "DISCOVER"
    },
    ar: {
        femme: "نساء", homme: "رجال", enfant: "أطفال", access: "إكسسوارات",
        ship: "توصيل فاخر لـ 58 ولاية",
        heroT: "أناقة الكوارتز", heroS: "الرقي الباريسي بين يديك في الجزائر.", btn: "اكتشفوا الآن"
    }
};

function changeLang(lang) {
    const data = dict[lang];
    const body = document.body;

    // Mise à jour de l'orientation
    if(lang === 'ar') body.classList.add('rtl');
    else body.classList.remove('rtl');

    // Mise à jour des textes
    document.getElementById('link-femme').innerText = data.femme;
    document.getElementById('link-homme').innerText = data.homme;
    document.getElementById('link-enfant').innerText = data.enfant;
    document.getElementById('link-access').innerText = data.access;
    document.getElementById('msg-ship').innerText = data.ship;
    document.getElementById('hero-title').innerText = data.heroT;
    document.getElementById('hero-sub').innerText = data.heroS;
    document.getElementById('btn-discover').innerText = data.btn;

    // Gestion du bouton actif
    document.querySelectorAll('.lang-switch button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}