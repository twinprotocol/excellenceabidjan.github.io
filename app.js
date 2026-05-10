// Initialize Icons
lucide.createIcons();

// Localization Data
const translations = {
    fr: {
        "women": "Femmes",
        "men": "Hommes",
        "beauty": "Beauté",
        "hero-title": "L'Art de Vivre À la Parisienne",
        "hero-desc": "Découvrez notre collection exclusive de pièces de luxe pour Alger."
    },
    en: {
        "women": "Women",
        "men": "Men",
        "beauty": "Beauty",
        "hero-title": "The Art of Living Parisian Style",
        "hero-desc": "Discover our exclusive collection of luxury pieces for modern Algiers."
    },
    ar: {
        "women": "نسائي",
        "men": "رجالي",
        "beauty": "جمال",
        "hero-title": "فن العيش على الطريقة الباريسية",
        "hero-desc": "اكتشفوا مجموعتنا الحصرية من القطع الفاخرة للجزائر العاصمة."
    }
};

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = translations[lang][key];
    });
}

// Cart System (Simple Mockup)
let cart = 0;
function addToCart() {
    cart++;
    document.getElementById('cart-count').textContent = cart;
    // Add subtle animation to the count
    document.getElementById('cart-count').classList.add('scale-125');
    setTimeout(() => document.getElementById('cart-count').classList.remove('scale-125'), 200);
}