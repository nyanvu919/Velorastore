// aboutpage/about-script.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Khởi tạo trang About...');
    
    // Khởi tạo tất cả
    initNavigation();
    initCart();
    initModalSystem();
    initCounterAnimation();
    
    console.log('✅ Trang About đã sẵn sàng!');
});

// =========================
// NAVIGATION
// =========================
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
}

// =========================
// CART
// =========================
function initCart() {
    updateCartCount();
    
    // Cart button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            openModal('cartModal');
            updateCartModal();
        });
    }
    
    // User button
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('loginModal');
        });
    }
}

function updateCartCount() {
    const savedCart = localStorage.getItem('velora_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

// =========================
// MODAL SYSTEM
// =========================
function initModalSystem() {
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Close with Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal);
            });
        }
    });
    
    // Search button
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            openModal('searchModal');
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.value = '';
                const resultsContainer = document.getElementById('searchResults');
                if (resultsContainer) {
                    resultsContainer.innerHTML = '<p class="empty-results">Nhập từ khóa để tìm kiếm...</p>';
                }
            }
        });
    }
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Đăng nhập thành công! (Demo)');
            closeModal(document.getElementById('loginModal'));
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Đăng ký thành công! (Demo)');
            closeModal(document.getElementById('registerModal'));
        });
    }
    
    // Modal switching
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(document.getElementById('loginModal'));
            openModal('registerModal');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(document.getElementById('registerModal'));
            openModal('loginModal');
        });
    }
}

// =========================
// MODAL FUNCTIONS
// =========================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// =========================
// CART MODAL
// =========================
function updateCartModal() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItemsContainer || !cartSummary) return;
    
    const savedCart = localStorage.getItem('velora_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    
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
            <button class="btn btn-primary full-width" disabled>
                Thanh toán
            </button>
        `;
        return;
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
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
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
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
    
    attachCartEvents();
}

function attachCartEvents() {
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.onclick = () => {
            const savedCart = localStorage.getItem('velora_cart');
            let cart = savedCart ? JSON.parse(savedCart) : [];
            cart = cart.filter(item => item.id != btn.dataset.id);
            localStorage.setItem('velora_cart', JSON.stringify(cart));
            updateCartCount();
            updateCartModal();
        };
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.onclick = () => {
            updateQuantity(btn.dataset.id, -1);
        };
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.onclick = () => {
            updateQuantity(btn.dataset.id, 1);
        };
    });
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.onclick = function() {
            alert('Thanh toán thành công! (Demo)');
            localStorage.removeItem('velora_cart');
            updateCartCount();
            closeModal(document.getElementById('cartModal'));
        };
    }
}

function updateQuantity(productId, change) {
    const savedCart = localStorage.getItem('velora_cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const itemIndex = cart.findIndex(item => item.id == productId);
    if (itemIndex < 0) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity <= 0) {
        cart = cart.filter(item => item.id != productId);
    }
    
    localStorage.setItem('velora_cart', JSON.stringify(cart));
    updateCartCount();
    updateCartModal();
}

// =========================
// COUNTER ANIMATION - SIMPLE
// =========================
function initCounterAnimation() {
    const numbers = document.querySelectorAll('.achievement-number');
    if (numbers.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(document.querySelector('.achievements'));
}

function animateNumbers() {
    const counters = document.querySelectorAll('.achievement-number');
    
    counters.forEach(counter => {
        const original = counter.textContent;
        let target, suffix;
        
        if (original.includes('K+')) {
            target = parseInt(original.replace('K+', '')) * 1000;
            suffix = 'K+';
        } else if (original.includes('+')) {
            target = parseInt(original.replace('+', ''));
            suffix = '+';
        } else {
            target = parseInt(original);
            suffix = '';
        }
        
        let current = 0;
        const increment = target / 50;
        
        const update = () => {
            current += increment;
            if (current < target) {
                if (suffix === 'K+') {
                    counter.textContent = Math.floor(current / 1000) + 'K+';
                } else {
                    counter.textContent = Math.floor(current) + suffix;
                }
                setTimeout(update, 30);
            } else {
                counter.textContent = original;
            }
        };
        
        update();
    });
}
