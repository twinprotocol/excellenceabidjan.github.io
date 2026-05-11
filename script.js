document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const garment = item.querySelector('.garment');
        if (garment) {
            const rect = garment.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Rotation légère pour le réalisme
            garment.style.transform = `rotateY(${x / 20}deg) rotateX(${-y / 20}deg)`;
        }
    });

    item.addEventListener('mouseleave', () => {
        const garment = item.querySelector('.garment');
        if (garment) {
            garment.style.transform = `rotateY(0deg) rotateX(0deg)`;
        }
    });
});