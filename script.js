document.querySelector('.nav-item[data-category="femme"]').addEventListener('mousemove', (e) => {
    const robe = document.querySelector('.silk-robe');
    const rect = robe.getBoundingClientRect();
    
    // Calcul de l'angle basé sur la position de la souris
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Applique une rotation 3D légère
    robe.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
});

document.querySelector('.nav-item[data-category="femme"]').addEventListener('mouseleave', () => {
    const robe = document.querySelector('.silk-robe');
    robe.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
});