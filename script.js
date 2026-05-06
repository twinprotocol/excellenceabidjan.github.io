function showSection(sectionId) {
    document.getElementById('inventory-section').style.display = 'none';
    document.getElementById('sales-section').style.display = 'none';
    document.getElementById(sectionId + '-section').style.display = 'block';
}

function setLanguage(lang) {
    const body = document.body;
    if (lang === 'ar') {
        body.setAttribute('dir', 'rtl');
        document.getElementById('page-title').innerText = "إدارة المخزون";
    } else if (lang === 'fr') {
        body.setAttribute('dir', 'ltr');
        document.getElementById('page-title').innerText = "Gestion de Stock";
    } else {
        body.setAttribute('dir', 'ltr');
        document.getElementById('page-title').innerText = "Inventory Management";
    }
}