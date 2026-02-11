// aboutpage/about-script.js

// Import các function từ utils.js
import { openModal, closeModal, showNotification, performSearch } from '../script/utils.js';

// =========================
// INIT ABOUT PAGE
// =========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Khởi tạo trang About...');
    
    // Khởi tạo các chức năng chung
    initCommonFunctions();
    
    // Khởi tạo giỏ hàng
    initCart();
    
    // Khởi tạo navigation
    initNavigation();
    
    // Khởi tạo modal system
    initModalSystem();
    
    console.log('✅ Trang About đã sẵn sàng!');
});

// =========================
// INIT COMMON FUNCTIONS
// =========================
function initCommonFunctions() {
    // Load cart count
    updateCartCount();
    
    // User button
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openLoginModal();
        });
    }
}

// =========================
// INIT CART
// =========================
function initCart() {
    // Load cart từ localStorage
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
    
    // Update cart count
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
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal);
            });
        }
    });
    
    // Cart button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            openModal('cartModal');
            updateCartModal();
        });
    }
    
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
        
        // Gắn sự kiện submit
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                showNotification('Đăng nhập thành công!', 'success');
                closeModal(document.getElementById('loginModal'));
                
                // Update user icon
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
    
    // Format price function
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
    
    // Attach cart item events
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
    
    // Checkout button
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
    
    // Xóa giỏ hàng sau khi thanh toán
    localStorage.removeItem('velora_cart');
    
    updateCartCount([]);
    updateCartModal();
    
    // Đóng modal
    closeModal(document.getElementById('cartModal'));
}

// aboutpage/about-script.js - Thêm vào cuối file, trước dòng cuối cùng

// =========================
// COUNTER ANIMATION
// =========================
function initCounterAnimation() {
    const achievementSection = document.querySelector('.achievements');
    if (!achievementSection) return;
    
    let animationStarted = false;
    
    function startCountAnimation() {
        if (animationStarted) return;
        
        const counters = document.querySelectorAll('.achievement-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace('+', '').replace('K', '000'));
            const suffix = counter.textContent.includes('+') ? '+' : 
                          counter.textContent.includes('K') ? 'K+' : '';
            
            let start = 0;
            const duration = 2000; // 2 giây
            const increment = target / (duration / 16); // 60fps
            
            const updateCounter = () => {
                start += increment;
                if (start < target) {
                    let displayValue;
                    
                    if (suffix === 'K+') {
                        // Format cho số nghìn
                        displayValue = Math.floor(start / 1000) + 'K+';
                    } else {
                        // Format cho số thường
                        displayValue = Math.floor(start) + suffix;
                    }
                    
                    counter.textContent = displayValue;
                    requestAnimationFrame(updateCounter);
                } else {
                    // Đảm bảo hiển thị giá trị cuối cùng
                    counter.textContent = target.toLocaleString() + suffix;
                }
            };
            
            updateCounter();
        });
        
        animationStarted = true;
    }
    
    // Kiểm tra khi cuộn trang
    function checkScroll() {
        const sectionTop = achievementSection.offsetTop;
        const sectionHeight = achievementSection.offsetHeight;
        const scrollPosition = window.scrollY + window.innerHeight;
        
        // Khi phần thành tựu hiển thị trên màn hình
        if (scrollPosition > sectionTop + 100 && 
            window.scrollY < sectionTop + sectionHeight) {
            startCountAnimation();
        }
    }
    
    // Thêm sự kiện scroll
    window.addEventListener('scroll', checkScroll);
    
    // Kiểm tra ngay khi trang load (nếu phần tử đã visible)
    setTimeout(checkScroll, 500);
}

// =========================
// Gọi hàm counter animation khi trang load
// =========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Khởi tạo trang About...');
    
    // Khởi tạo các chức năng chung
    initCommonFunctions();
    
    // Khởi tạo giỏ hàng
    initCart();
    
    // Khởi tạo navigation
    initNavigation();
    
    // Khởi tạo modal system
    initModalSystem();
    
    // Khởi tạo counter animation
    initCounterAnimation();
    
    console.log('✅ Trang About đã sẵn sàng!');
});
// =========================
// Các modal cần thêm vào HTML
// =========================
function addModalsToPage() {
    // Kiểm tra xem modal đã tồn tại chưa
    if (!document.getElementById('loginModal')) {
        // Thêm modal vào body
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

// =========================
// Gọi hàm thêm modal khi trang load
// =========================
addModalsToPage();
