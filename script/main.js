// script/main.js
import { initUI } from './ui.js';
import { initCart } from './cart.js';
import { initProducts } from './products.js';
import { initAuth } from './auth.js';

console.log('🚀 Khởi động Velora Fashion...');

let allProducts = [];
let cart = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM đã sẵn sàng');

    initUI();
    initCart();
    await initProducts();
    initAuth();

    console.log('✅ Ứng dụng đã sẵn sàng!');
});
