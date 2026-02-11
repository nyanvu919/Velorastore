// script/main.js
// File chính khởi động ứng dụng
console.log('🚀 Khởi động Velora Fashion...');

// Configuration
const API_BASE_URL = 'https://velora-api.nyaochen9.workers.dev/api';

// Global variables
let allProducts = [];
let cart = [];
let backendAvailable = false;

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
