const translations = {
    fr: { femme: "FEMME", homme: "HOMME", enfant: "ENFANT", ship: "Livraison Prestige 58 Wilayas", explore: "EXPLORER" },
    en: { femme: "WOMEN", homme: "MEN", enfant: "KIDS", ship: "Prestige Delivery 58 Wilayas", explore: "EXPLORE" },
    ar: { femme: "نساء", homme: "رجال", enfant: "أطفال", ship: "توصيل النخبة لـ 58 ولاية", explore: "اكتشفوا الآن" }
};

function switchLang(lang) {
    const root = document.getElementById('pinkoin-app');
    const data = translations[lang];

    // Toggle RTL
    lang === 'ar' ? root.classList.add('rtl') : root.classList.remove('rtl');

    // Update Texts
    document.querySelector('.t-femme').innerText = data.femme;
    document.querySelector('.t-homme').innerText = data.homme;
    document.querySelector('.t-ship').innerText = data.ship;
    document.querySelector('.t-explore').innerText = data.explore;

    // Update active button
    document.querySelectorAll('.lang-controls button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Micro-interaction: Mouse Follow on Garment
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const garment = item.querySelector('.garment');
        if (garment) {
            const x = (window.innerWidth / 2 - e.pageX) / 50;
            garment.style.transform = `rotateY(${x}deg)`;
        }
    });
});