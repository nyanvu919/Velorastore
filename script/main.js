// script/main.js
console.log('🚀 Khởi động Velora Fashion...');

// Global variables
let allProducts = [];
let cart = [];

// Start the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM đã sẵn sàng');
    
    // Initialize all modules
    initUI();
    initCart();
    await initProducts();
    initAuth();
    
    console.log('✅ Ứng dụng đã sẵn sàng!');
});
