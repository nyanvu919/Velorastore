// script/main.js
import { initUI } from './ui.js';
import { initCart } from './cart.js';
import { initProducts } from './products.js';
import { initAuth } from './auth.js';

console.log('🚀 Khởi động Velora Fashion...');

// Biến global
window.allProducts = [];
window.cart = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM đã sẵn sàng');
    
    // Khởi tạo theo thứ tự
    initUI();
    await initProducts(); // Đợi sản phẩm load trước
    initCart();
    initAuth();
    
    console.log('✅ Ứng dụng đã sẵn sàng!');
});
