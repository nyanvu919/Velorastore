// aboutpage/about-script.js
import { openModal, closeModal, showNotification, performSearch } from '../script/utils.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Khởi tạo trang About...');
    
    addModalsToPage();
    initCommonFunctions();
    initCart();
    initNavigation();
    initModalSystem();
    initCounterAnimation();
    
    console.log('✅ Trang About đã sẵn sàng!');
});

// =========================
// INIT COMMON FUNCTIONS
// =========================
function initCommonFunctions() {
    updateCartCount();
    
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openLoginModal();
        });
    }
    
    // Thêm sự kiện cho modal switching
    setupModalSwitching();
}

// =========================
// SETUP MODAL SWITCHING
// =========================
function setupModalSwitching() {
    // Switch từ login sang register
    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(document.getElementById('loginModal'));
            openRegisterModal();
        });
    }
    
    // Switch từ register sang login
    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(document.getElementById('registerModal'));
            openLoginModal();
        });
    }
}

// =========================
// OPEN REGISTER MODAL
// =========================
function openRegisterModal() {
    openModal('registerModal');
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.reset();
        
        registerForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const phone = document.getElementById('registerPhone').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            if (name && email && phone && password && confirmPassword) {
                if (password !== confirmPassword) {
                    showNotification('Mật khẩu xác nhận không khớp', 'error');
                    return;
                }
                
                if (password.length < 6) {
                    showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
                    return;
                }
                
                showNotification('Đăng ký thành công!', 'success');
                closeModal(document.getElementById('registerModal'));
                
                const icon = document.querySelector('#user-btn i');
                if (icon) icon.className = 'fas fa-user-check';
            } else {
                showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
            }
        };
    }
}

// =========================
// INIT CART
// =========================
function initCart() {
    const savedCart = localStorage.getItem('velora_cart');
    let cart = [];
    
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart) || [];
        } catch (e) {
            console.error('❌ Lỗi parse cart:', e);
            cart = [];
        }
    }
    
    updateCartCount(cart);
}

// =========================
// UPDATE CART COUNT
// =========================
function updateCartCount(cart = null) {
    if (!cart) {
        const savedCart = localStorage.getItem('velora_cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

// =========================
// INIT NAVIGATION
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
// INIT MODAL SYSTEM
// =========================
function initModalSystem() {
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal);
            });
        }
    });
    
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            openModal('cartModal');
            updateCartModal();
        });
    }
    
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
                
                searchInput.addEventListener('input', function() {
                    performSearch(this.value);
                });
            }
        });
    }
}

// =========================
// OPEN LOGIN MODAL
// =========================
function openLoginModal() {
    openModal('loginModal');
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
        
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                showNotification('Đăng nhập thành công!', 'success');
                closeModal(document.getElementById('loginModal'));
                
                const icon = document.querySelector('#user-btn i');
                if (icon) icon.className = 'fas fa-user-check';
            } else {
                showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
            }
        };
    }
}

// =========================
// UPDATE CART MODAL
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
                <a href="index.html" class="btn btn-secondary" onclick="closeModal(document.getElementById('cartModal'))">
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
    
    attachCartItemEvents(cart);
}

// =========================
// ATTACH CART ITEM EVENTS
// =========================
function attachCartItemEvents(cart) {
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
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.onclick = handleCheckout;
    }
}

// =========================
// REMOVE FROM CART
// =========================
function removeFromCart(productId) {
    const savedCart = localStorage.getItem('velora_cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const item = cart.find(item => item.id == productId);
    cart = cart.filter(item => item.id != productId);
    
    localStorage.setItem('velora_cart', JSON.stringify(cart));
    
    updateCartCount(cart);
    updateCartModal();
    
    if (item) {
        showNotification(`Đã xóa "${item.name}" khỏi giỏ hàng`, 'info');
    }
}

// =========================
// UPDATE CART ITEM QUANTITY
// =========================
function updateCartItemQuantity(productId, change) {
    const savedCart = localStorage.getItem('velora_cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const itemIndex = cart.findIndex(item => item.id == productId);
    
    if (itemIndex < 0) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    localStorage.setItem('velora_cart', JSON.stringify(cart));
    
    updateCartCount(cart);
    updateCartModal();
}

// =========================
// HANDLE CHECKOUT
// =========================
function handleCheckout() {
    const savedCart = localStorage.getItem('velora_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    showNotification(`Thanh toán thành công! Tổng tiền: ${formatPrice(total)}`, 'success');
    
    localStorage.removeItem('velora_cart');
    
    updateCartCount([]);
    updateCartModal();
    
    closeModal(document.getElementById('cartModal'));
}

// =========================
// COUNTER ANIMATION (ĐÃ CẢI THIỆN)
// =========================
function initCounterAnimation() {
    const section = document.querySelector('.achievements');
    if (!section) return;
    
    let animated = false;
    
    function animateAchievementItems() {
        const items = document.querySelectorAll('.achievement-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.classList.add('animate');
            }, index * 100);
        });
    }
    
    function animateCounters() {
        if (animated) return;
        
        // Fade in các item trước
        animateAchievementItems();
        
        // Sau đó animate counters
        setTimeout(() => {
            const counters = document.querySelectorAll('.achievement-number');
            
            counters.forEach(counter => {
                const text = counter.textContent;
                let target, suffix;
                
                if (text.includes('K+')) {
                    target = parseInt(text.replace('K+', '')) * 1000;
                    suffix = 'K+';
                } else if (text.includes('+')) {
                    target = parseInt(text.replace('+', ''));
                    suffix = '+';
                } else {
                    target = parseInt(text);
                    suffix = '';
                }
                
                let start = 0;
                const duration = 1500;
                const increment = target / (duration / 16);
                
                const update = () => {
                    start += increment;
                    if (start < target) {
                        if (suffix === 'K+') {
                            counter.textContent = Math.floor(start / 1000) + 'K+';
                        } else {
                            counter.textContent = Math.floor(start) + suffix;
                        }
                        requestAnimationFrame(update);
                    } else {
                        counter.textContent = text;
                    }
                };
                
                update();
            });
        }, 500);
        
        animated = true;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(section);
    
    // Fallback: nếu không scroll đến section, vẫn animate sau 2s
    setTimeout(() => {
        if (!animated) {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight) {
                animateCounters();
            }
        }
    }, 2000);
}

// =========================
// ADD MODALS TO PAGE
// =========================
function addModalsToPage() {
    if (!document.getElementById('loginModal')) {
        const modalHTML = `
        <!-- Login Modal -->
        <div class="modal" id="loginModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Đăng nhập</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" placeholder="Nhập email của bạn" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Mật khẩu</label>
                            <input type="password" id="loginPassword" placeholder="Nhập mật khẩu" required>
                        </div>
                        <div class="form-options">
                            <label class="checkbox">
                                <input type="checkbox"> Ghi nhớ đăng nhập
                            </label>
                            <a href="#" class="forgot-password">Quên mật khẩu?</a>
                        </div>
                        <button type="submit" class="btn btn-primary full-width">
                            <i class="fas fa-sign-in-alt"></i> Đăng nhập
                        </button>
                    </form>
                    
                    <div class="divider">
                        <span>Hoặc đăng nhập với</span>
                    </div>
                    
                    <div class="social-login">
                        <button class="btn btn-social facebook">
                            <i class="fab fa-facebook-f"></i> Facebook
                        </button>
                        <button class="btn btn-social google">
                            <i class="fab fa-google"></i> Google
                        </button>
                    </div>
                    
                    <div class="switch-modal">
                        Chưa có tài khoản? <a href="#" id="switchToRegister">Đăng ký ngay</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Register Modal -->
        <div class="modal" id="registerModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Đăng ký tài khoản</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="form-group">
                            <label for="registerName">Họ và tên</label>
                            <input type="text" id="registerName" placeholder="Nhập họ và tên" required>
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">Email</label>
                            <input type="email" id="registerEmail" placeholder="Nhập email của bạn" required>
                        </div>
                        <div class="form-group">
                            <label for="registerPhone">Số điện thoại</label>
                            <input type="tel" id="registerPhone" placeholder="Nhập số điện thoại" required>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">Mật khẩu</label>
                            <input type="password" id="registerPassword" placeholder="Nhập mật khẩu (ít nhất 6 ký tự)" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="registerConfirmPassword">Xác nhận mật khẩu</label>
                            <input type="password" id="registerConfirmPassword" placeholder="Nhập lại mật khẩu" required>
                        </div>
                        <div class="form-group">
                            <label class="checkbox">
                                <input type="checkbox" id="registerTerms" required>
                                Tôi đồng ý với <a href="#" class="terms-link">Điều khoản dịch vụ</a>
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary full-width">
                            <i class="fas fa-user-plus"></i> Đăng ký
                        </button>
                    </form>
                    
                    <div class="switch-modal">
                        Đã có tài khoản? <a href="#" id="switchToLogin">Đăng nhập ngay</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cart Modal -->
        <div class="modal" id="cartModal">
            <div class="modal-content cart-modal">
                <div class="modal-header">
                    <h2>Giỏ hàng của bạn</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="cart-items">
                        <!-- Cart items will be loaded here -->
                    </div>
                    <div class="cart-summary">
                        <div class="summary-row">
                            <span>Tạm tính:</span>
                            <span class="price">0 VND</span>
                        </div>
                        <div class="summary-row total">
                            <span>Tổng cộng:</span>
                            <span class="price">0 VND</span>
                        </div>
                        <button class="btn btn-primary full-width" style="margin-top: 20px;" id="checkoutBtn">
                            <i class="fas fa-credit-card"></i> Thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Modal -->
        <div class="modal" id="searchModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Tìm kiếm sản phẩm</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <input type="text" id="searchInput" placeholder="Nhập từ khóa tìm kiếm...">
                    </div>
                    <div class="search-results" id="searchResults">
                        <!-- Search results will appear here -->
                    </div>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}
