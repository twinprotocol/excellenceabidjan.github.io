// Gestion du menu mobile
function toggleMenu() {
    document.querySelector('.nav-container').classList.toggle('active');
}

// Système de traduction
const translations = {
    fr: { femme: "FEMME", homme: "HOMME", hero: "L'ÉLÉGANCE AU QUARTZ", ship: "Livraison 58 Wilayas" },
    ar: { femme: "نساء", homme: "رجال", hero: "أناقة الكوارتز", ship: "توصيل لـ 58 ولاية" },
    en: { femme: "WOMEN", homme: "MEN", hero: "QUARTZ ELEGANCE", ship: "58 Wilayas Delivery" }
};

function setLang(lang) {
    const body = document.getElementById('body-root');
    const data = translations[lang];

    // Toggle RTL
    lang === 'ar' ? body.classList.add('rtl') : body.classList.remove('rtl');

    // Update texts
    document.querySelector('.t-femme').innerText = data.femme;
    document.querySelector('.t-homme').innerText = data.homme;
    document.querySelector('.t-hero-title').innerText = data.hero;
    document.querySelector('.t-ship').innerText = data.ship;

    // Active button
    document.querySelectorAll('.lang-selector button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}