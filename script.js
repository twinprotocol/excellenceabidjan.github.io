const database = {
    femme: [
        { name: "Robe Soie Quartz", price: "18.500 DZD", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600" },
        { name: "Tailleur Ivory", price: "24.000 DZD", img: "https://images.unsplash.com/photo-1548733221-08149870f2f3?w=600" }
    ],
    homme: [
        { name: "Costume Prestige Noir", price: "45.000 DZD", img: "https://images.unsplash.com/photo-1594932224828-b4b059b6a684?w=600" }
    ],
    beaute: [{ name: "Sérum Éclat", price: "6.800 DZD", img: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?w=600" }],
    accessoires: [{ name: "Sac Cuir Vintage", price: "18.900 DZD", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600" }]
};

function renderCategory(cat) {
    const container = document.getElementById('dynamic-render');
    const items = database[cat] || database.femme;
    container.innerHTML = `
        <div style="padding: 60px 8%;">
            <h2 style="font-family:'Playfair Display'; font-size:2.5rem; text-align:center; margin-bottom:40px;">${cat.toUpperCase()}</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:30px;">
                ${items.map(p => `
                    <div style="background:white; padding:15px; text-align:center; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                        <img src="${p.img}" style="width:100%; height:350px; object-fit:cover;">
                        <h3 style="margin-top:15px; font-size:1.1rem;">${p.name}</h3>
                        <p style="color:#D4AF37; font-weight:bold;">${p.price}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderHome() {
    document.getElementById('dynamic-render').innerHTML = `
        <section style="height:70vh; background:url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070') center/cover; display:flex; align-items:center; justify-content:center; color:white;">
            <h1 style="font-family:'Playfair Display'; font-size:3.5rem; letter-spacing:8px; text-shadow:0 5px 15px rgba(0,0,0,0.3);">PINKOIN</h1>
        </section>
    `;
}

function setLanguage(lang) {
    document.body.classList.toggle('rtl', lang === 'ar');
    document.querySelectorAll('.lang-selector span').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
}

window.onload = renderHome;