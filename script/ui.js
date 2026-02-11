// script/ui.js

// =================== UI INITIALIZATION ===================
function initUI() {
    initNavigation();
    initModalSystem();
    initSlideshow();
    addNotificationStyles();
}

// =================== NAVIGATION ===================
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Handle product hash links
    handleProductHash();
    window.addEventListener('hashchange', handleProductHash);
}

function handleProductHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#product-')) {
        const productId = hash.replace('#product-', '');
        scrollToProduct(productId);
    }
}

function scrollToProduct(productId) {
    const productElement = document.querySelector(`[data-id="${productId}"]`);
    if (productElement) {
        productElement.scrollIntoView({ 
           
