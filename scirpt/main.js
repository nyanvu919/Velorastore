// script/main.js
import { initializeAuthSystem, checkLoginStatus, getCurrentUser } from './auth.js';
import { initCart, addToCart, updateCartCount, saveCart } from './cart.js';
import { initProducts, renderProducts, getAllProducts } from './products.js';
import { initUI, showNotification, formatPrice, getCategoryName } from './ui.js';
import { validateEmail, validatePhone, generateUserId } from './utils.js';

// =================== CONFIGURATION ===================
const API_BASE_URL = 'https://velora-api.nyaochen9.workers.dev/api';
let backendAvailable = false;
let allProducts = [];
let cart = [];

// =================== INITIALIZATION ===================
async function initializeApp() {
    console.log('🚀 Khởi động Velora Fashion...');
    
    // Initialize modules
    initUI();
    await initProducts(API_BASE_URL);
    initCart();
    await initializeAuthSystem(API_BASE_URL);
    
    // Check backend connection
    await checkBackendConnection();
    
    console.log('✅ Ứng dụng đã sẵn sàng!');
}

// =================== BACKEND CONNECTION ===================
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            backendAvailable = true;
            console.log('✅ Backend connected');
        }
    } catch (error) {
        console.log('⚠️ Backend unavailable, using demo mode');
    }
}

// =================== EXPORT FUNCTIONS ===================
export {
    API_BASE_URL,
    backendAvailable,
    allProducts,
    cart,
    initializeApp,
    checkBackendConnection
};

// =================== START APPLICATION ===================
document.addEventListener('DOMContentLoaded', async function() {
    // Import modules
    await import('./auth.js');
    await import('./cart.js');
    await import('./products.js');
    await import('./ui.js');
    await import('./utils.js');
    
    // Start app
    await initializeApp();
});
