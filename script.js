const inventory = {
    femme: [
        { name: "Robe Soie Quartz", price: "18.500 DZD", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8" },
        { name: "Ensemble Satin Rose", price: "22.000 DZD", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446" },
        { name: "Manteau Cachemire", price: "35.000 DZD", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b" },
    ],
    homme: [
        { name: "Costume Prestige Noir", price: "48.000 DZD", img: "https://images.unsplash.com/photo-1594932224828-b4b059b6a684" },
        { name: "Chemise Coton Égyptien", price: "9.500 DZD", img: "https://images.unsplash.com/photo-1598033129183-c4f50c717658" },
    ],
    enfant: [
        { name: "Robe Petite Fleur", price: "7.500 DZD", img: "https://images.unsplash.com/photo-1519704943920-18447d21755b" },
    ],
    accessoires: [
        { name: "Sac Cuir Vintage", price: "18.900 DZD", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3" },
    ]
};

// Canvas Sparkle
const canvas = document.getElementById('sparkle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * -3 - 1;
        this.life = 60;
        this.color = '#D4AF37';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.speedY += 0.08;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life / 60;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#D4AF37';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

function createSparkles(x, y, count = 25) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

function animateSparkles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    requestAnimationFrame(animateSparkles);
}
animateSparkles();

// Diamond sparkle on click
function createDiamonds(e) {
    const container = document.getElementById('diamond-field');
    for (let i = 0; i < 12; i++) {
        const d = document.createElement('div');
        d.className = 'diamond';
        d.style.left = (e.pageX + (Math.random() - 0.5) * 100) + 'px';
        d.style.top = (e.pageY + (Math.random() - 0.5) * 100) + 'px';
        container.appendChild(d);
        setTimeout(() => d.remove(), 1200);
    }
    createSparkles(e.pageX, e.pageY, 30);
}

function triggerCategory(el, cat) {
    createDiamonds(window.event);
    renderCategory(cat);
}

function renderCategory(cat) {
    const main = document.getElementById('app-viewport');
    const items = inventory[cat] || [];
    main.innerHTML = `
        <div class="product-grid">
            ${items.map(p => `
                <div class="p-card">
                    <img src="${p.img}?auto=format&fit=crop&w=600" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <p class="p-price">${p.price}</p>
                    <button class="btn-add" onclick="addToCart()">Ajouter au Panier</button>
                </div>
            `).join('')}
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let cartCount = 0;
function addToCart() {
    cartCount++;
    document.getElementById('cart-count').innerText = cartCount;
    createSparkles(window.innerWidth - 100, 80, 15);
}

function showCart() {
    alert(`Votre panier contient ${cartCount} article(s). Merci pour votre confiance chez PINKCOIN.`);
}

function changeLang(lang) {
    document.body.classList.toggle('rtl', lang === 'ar');
    document.querySelectorAll('.lang-switch span').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
}

function renderHome() {
    document.getElementById('app-viewport').innerHTML = `
        <div class="hero">
            <h2>NOUVELLE COLLECTION<br>PRINTEMPS 2026</h2>
            <button onclick="renderCategory('femme')" class="hero-btn">DÉCOUVRIR</button>
        </div>
    `;
}

window.onload = () => {
    renderHome();
    // Sparkle on logo hover
    document.querySelector('.brand-logo').addEventListener('mousemove', (e) => {
        if (Math.random() > 0.7) createSparkles(e.pageX, e.pageY, 8);
    });
};