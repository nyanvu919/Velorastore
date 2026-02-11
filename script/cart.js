// script/cart.js
import { showNotification, formatPrice, openModal } from './ui.js';
import { allProducts } from './main.js';

let cart = [];

// =================== CART INITIALIZATION ===================
function initCart() {
    const savedCart = localStorage.getItem('velora_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartCount();
}

// =================== CART OPERATIONS ===================
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }
    
    saveCart();
    updateCartCount();
    updateProductCartState(productId);
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCartModal();
    updateProductCartState(productId);
    showNotification('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
}

function updateCartItemQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex >= 0) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartCount();
            updateCartModal();
            updateProductCartState(productId);
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    updateCartModal();
}

// =================== CART UI UPDATES ===================
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

function updateProductCartState(productId) {
    const productElement = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (!productElement) return;
    
    const cartItem = cart.find(item => item.id === productId);
    const addButton = productElement.querySelector('.cart-add-btn');
    const inCartText = productElement.querySelector('.in-cart-text');
    
    if (cartItem) {
        if (addButton) {
            addButton.innerHTML = '<i class="fas fa-check"></i>';
            addButton.classList.add('in-cart');
        }
        
        if (inCartText) {
            inCartText.textContent = `Đã có ${cartItem.quantity} sản phẩm trong giỏ`;
        } else {
            const productContent = productElement.querySelector('.product-content');
            if (productContent) {
                const newInCartText = document.createElement('p');
                newInCartText.className = 'in-cart-text';
                newInCartText.textContent = `Đã có ${cartItem.quantity} sản phẩm trong giỏ`;
                productContent.appendChild(newInCartText);
            }
        }
    } else {
        if (addButton) {
            addButton.innerHTML = '<i class="fas fa-shopping-cart"></i>';
            addButton.classList.remove('in-cart');
        }
        if (inCartText) {
            inCartText.remove();
        }
    }
}

function updateCartModal() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItemsContainer || !cartSummary) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng của bạn đang trống</p>
            </div>
        `;
        
        cartSummary.innerHTML = `
            <div class="summary-row total">
                <span>Tổng cộng:</span>
                <span class="price">0 VND</span>
            </div>
            <button class="btn btn-primary full-width" style="margin-top: 20px;" disabled>
                <i class="fas fa-credit-card"></i> Thanh toán
            </button>
        `;
        return;
    }
    
    // Build cart items HTML
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
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
    
    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update summary
    cartSummary.innerHTML = `
        <div class="summary-row">
            <span>Tạm tính:</span>
            <span class="price">${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span class="price">${formatPrice(subtotal)}</span>
        </div>
        <button class="btn btn-primary full-width" style="margin-top: 20px;" id="checkoutBtn">
            <i class="fas fa-credit-card"></i> Thanh toán
        </button>
    `;
    
    // Add checkout event
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            openCheckoutModal();
        });
    }
    
    // Attach cart item events
    attachCartItemEvents();
}

function attachCartItemEvents() {
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            updateCartItemQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            updateCartItemQuantity(productId, 1);
        });
    });
}

function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống, không thể thanh toán', 'warning');
        return;
    }
    
    showNotification('Tính năng thanh toán đang được phát triển', 'info');
}

// =================== STORAGE ===================
function saveCart() {
    localStorage.setItem('velora_cart', JSON.stringify(cart));
}

// =================== EXPORTS ===================
export {
    cart,
    initCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartCount,
    updateCartModal,
    saveCart,
    clearCart
};
