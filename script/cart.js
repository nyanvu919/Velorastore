// script/cart.js
import { formatPrice, showNotification } from './utils.js';

// =========================
// GLOBAL STATE
// =========================
let cart = [];

// =========================
// INIT CART
// =========================
export function initCart() {
    console.log('🔄 Khởi tạo giỏ hàng...');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('velora_cart');
    
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart) || [];
        } catch (e) {
            console.error('❌ Lỗi parse cart:', e);
            cart = [];
        }
    }
    
    updateCartCount();
    
    // Thanh toán
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

// =========================
// UPDATE CART COUNT
// =========================
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

// =========================
// ADD TO CART
// =========================
export function addToCart(productId) {
    const allProducts = window.allProducts || [];
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) {
        console.warn('❌ Không tìm thấy product:', productId);
        showNotification('Không tìm thấy sản phẩm', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            category: product.category
        });
    }
    
    localStorage.setItem('velora_cart', JSON.stringify(cart));
    
    updateCartCount();
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
}

// =========================
// UPDATE CART MODAL
// =========================
export function updateCartModal() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItemsContainer || !cartSummary) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <a href="#products" class="btn btn-secondary" onclick="closeModal(document.getElementById('cartModal'))">
                    <i class="fas fa-shopping-bag"></i> Mua sắm ngay
                </a>
            </div>
        `;
        
        cartSummary.innerHTML = `
            <div class="summary-row total">
                <span>Tổng cộng:</span>
                <span class="price">0 VND</span>
            </div>
            <button class="btn btn-primary full-width" disabled>
                Thanh toán
            </button>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-img" style="background-image:url('${item.image}')"></div>
            
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    const subtotal = cart.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );
    
    cartSummary.innerHTML = `
        <div class="summary-row">
            <span>Tạm tính:</span>
            <span class="price">${formatPrice(subtotal)}</span>
        </div>
        
        <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span class="price">${formatPrice(subtotal)}</span>
        </div>
        
        <button class="btn btn-primary full-width" id="checkoutBtn">
            <i class="fas fa-credit-card"></i> Thanh toán
        </button>
    `;
    
    attachCartItemEvents();
}

// =========================
// EVENTS
// =========================
function attachCartItemEvents() {
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.onclick = () => {
            removeFromCart(btn.dataset.id);
        };
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.onclick = () => {
            updateCartItemQuantity(btn.dataset.id, -1);
        };
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.onclick = () => {
            updateCartItemQuantity(btn.dataset.id, 1);
        };
    });
}

// =========================
// REMOVE ITEM
// =========================
function removeFromCart(productId) {
    const item = cart.find(item => item.id == productId);
    cart = cart.filter(item => item.id != productId);
    
    localStorage.setItem('velora_cart', JSON.stringify(cart));
    
    updateCartCount();
    updateCartModal();
    
    if (item) {
        showNotification(`Đã xóa "${item.name}" khỏi giỏ hàng`, 'info');
    }
}

// =========================
// UPDATE QUANTITY
// =========================
function updateCartItemQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id == productId);
    
    if (itemIndex < 0) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    localStorage.setItem('velora_cart', JSON.stringify(cart));
    
    updateCartCount();
    updateCartModal();
}

// =========================
// CHECKOUT
// =========================
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    showNotification(`Thanh toán thành công! Tổng tiền: ${formatPrice(total)}`, 'success');
    
    // Xóa giỏ hàng sau khi thanh toán
    cart = [];
    localStorage.setItem('velora_cart', JSON.stringify(cart));
    
    updateCartCount();
    updateCartModal();
    
    // Đóng modal
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}
