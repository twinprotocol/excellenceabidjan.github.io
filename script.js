const content = {
    fr: {
        femme: "FEMME", homme: "HOMME", enfant: "ENFANT", beaute: "BEAUTÉ",
        heroT: "L'ÉLÉGANCE AU QUARTZ", heroSub: "Le luxe parisien, livré chez vous.",
        btn: "EXPLORER", ship: "Livraison Prestige 58 Wilayas"
    },
    en: {
        femme: "WOMEN", homme: "MEN", enfant: "KIDS", beaute: "BEAUTY",
        heroT: "QUARTZ ELEGANCE", heroSub: "Parisian luxury, delivered to your door.",
        btn: "EXPLORE", ship: "Prestige Shipping 58 Wilayas"
    },
    ar: {
        femme: "نساء", homme: "رجال", enfant: "أطفال", beaute: "جمال",
        heroT: "أناقة الكوارتز", heroSub: "الرقي الباريسي، يصلكم أينما كنتم.",
        btn: "اكتشفوا الآن", ship: "توصيل فاخر لـ 58 ولاية"
    }
};

function setLanguage(lang) {
    const data = content[lang];
    const body = document.getElementById('main-body');

    // Toggle RTL pour l'Arabe
    lang === 'ar' ? body.classList.add('rtl') : body.classList.remove('rtl');

    // Update Textes
    document.getElementById('txt-femme').innerText = data.femme;
    document.getElementById('txt-homme').innerText = data.homme;
    document.getElementById('txt-enfant').innerText = data.enfant;
    document.getElementById('txt-beaute').innerText = data.beaute;
    document.getElementById('hero-title').innerText = data.heroT;
    document.getElementById('hero-subtitle').innerText = data.heroSub;
    document.getElementById('hero-btn').innerText = data.btn;
    document.getElementById('ship-text').innerText = data.ship;

    // Active State
    document.querySelectorAll('.lang-selector span').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
}