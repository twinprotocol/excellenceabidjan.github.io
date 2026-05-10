lucide.createIcons();

const dictionary = {
    fr: {
        femme: "Femme", homme: "Homme", dresses: "Robes", skirts: "Jupes",
        blazers: "Blazers", trousers: "Pantalons", "hero-title": "L'Élégance Pure",
        "hero-sub": "Directement de Paris à votre dressing à Alger."
    },
    en: {
        femme: "Women", homme: "Men", dresses: "Dresses", skirts: "Skirts",
        blazers: "Blazers", trousers: "Trousers", "hero-title": "Pure Elegance",
        "hero-sub": "Directly from Paris to your wardrobe in Algiers."
    },
    ar: {
        femme: "نسائي", homme: "رجالي", dresses: "فساتين", skirts: "تنانير",
        blazers: "سترات", trousers: "سراويل", "hero-title": "الأناقة الخالصة",
        "hero-sub": "مباشرة من باريس إلى خزانتك في الجزائر."
    }
};

function setLang(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = dictionary[lang][key];
    });
}