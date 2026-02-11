// script.js - JavaScript chung cho Velora Fashion

document.addEventListener('DOMContentLoaded', async function() {
    // =================== CONFIGURATION ===================
    const API_BASE_URL = 'https://velora-api.nyaochen9.workers.dev/api';
    let backendAvailable = false;
    let allProducts = [];
    let cart = [];
    
    // =================== INITIALIZATION ===================
    async function initializeApp() {
        console.log('🚀 Khởi động Velora Fashion...');
        
        // Initialize modules
        initNavigation();
        initModalSystem();
        await initProducts();
        initCart();
        initSlideshow();
        initFilters();
        
        // Check backend connection
        await checkBackendConnection();
        
        console.log('✅ Ứng dụng đã sẵn sàng!');
    }
    
    // =================== NAVIGATION ===================
    function initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close menu when clicking on links
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', function() {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
        
        // Handle product hash links
        handleProductHash();
        window.addEventListener('hashchange', handleProductHash);
    }
    
    function handleProductHash() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#product-')) {
            const productId = hash.replace('#product-', '');
            scrollToProduct(productId);
        }
    }
    
    function scrollToProduct(productId) {
        const productElement = document.querySelector(`[data-id="${productId}"]`);
        if (productElement) {
            productElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Highlight effect
            productElement.style.transition = 'all 0.3s ease';
            productElement.style.boxShadow = '0 0 0 3px var(--primary), 0 5px 15px rgba(0,0,0,0.1)';
            productElement.style.transform = 'translateY(-5px)';
            
            setTimeout(() => {
                productElement.style.boxShadow = '';
                productElement.style.transform = '';
            }, 3000);
        }
    }
    
    // =================== SLIDESHOW ===================
    function initSlideshow() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        let currentSlide = 0;
        let slideInterval;
        
        if (slides.length === 0) return;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }
        
        // Auto slide
        function startSlideShow() {
            slideInterval = setInterval(() => {
                showSlide(currentSlide + 1);
            }, 5000);
        }
        
        // Dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                clearInterval(slideInterval);
                showSlide(index);
                startSlideShow();
            });
        });
        
        // Pause on hover
        const slideshow = document.querySelector('.hero-slideshow');
        if (slideshow) {
            slideshow.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });
            
            slideshow.addEventListener('mouseleave', startSlideShow);
        }
        
        startSlideShow();
    }
    
    // =================== PRODUCTS ===================
    async function initProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    allProducts = result.data;
                } else {
                    allProducts = getSampleProducts();
                }
            } else {
                allProducts = getSampleProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            allProducts = getSampleProducts();
        }
        
        renderProducts();
    }
    
    function getSampleProducts() {
        return [
            {
                id: "1",
                name: "Đầm dạ hội lộng lẫy",
                category: "dress",
                price: 3500000,
                image: "srcimg/5 (3).png",
                description: "Đầm dạ hội cao cấp"
            },
            {
                id: "2",
                name: "Áo sơ mi lụa cao cấp",
                category: "shirt",
                price: 1200000,
                image: "srcimg/6 (3).png",
                description: "Áo sơ mi lụa sang trọng"
            },
            {
                id: "3",
                name: "Quần âu sang trọng",
                category: "pants",
                price: 1800000,
                image: "srcimg/7 (1).png",
                description: "Quần âu cao cấp"
            },
            {
                id: "4",
                name: "Áo khoác da thật",
                category: "jacket",
                price: 4500000,
                image: "srcimg/7 (2).png",
                description: "Áo khoác da thật"
            },
            {
                id: "5",
                name: "Váy công sở thanh lịch",
                category: "dress",
                price: 1600000,
                image: "srcimg/5f7d5610fa1a74442d0b.jpg",
                description: "Váy công sở thanh lịch"
            },
            {
                id: "6",
                name: "Set đồ thể thao cao cấp",
                category: "accessories",
                price: 2200000,
                image: "srcimg/6912a04bf25b7c05254a.jpg",
                description: "Set đồ thể thao cao cấp"
            },
            {
                id: "7",
                name: "Áo len cashmere",
                category: "jacket",
                price: 2800000,
                image: "srcimg/8186fcbeaeae20f079bf.jpg",
                description: "Áo len cashmere cao cấp"
            },
            {
                id: "8",
                name: "Chân váy bút chì",
                category: "dress",
                price: 1400000,
                image: "srcimg/a48eb8a7b3b73de964a6.jpg",
                description: "Chân váy bút chì công sở"
            }
        ];
    }
    
    function renderProducts() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = allProducts.map(product => {
            const cartItem = cart.find(item => item.id === product.id);
            const inCart = !!cartItem;
            const quantity = cartItem ? cartItem.quantity : 0;
            
            return `
                <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                    <div class="product-img" style="background-image: url('${product.image}')">
                        <div class="product-overlay">
                            <div class="product-actions">
                                <button class="action-btn view-btn" data-id="${product.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn cart-add-btn ${inCart ? 'in-cart' : ''}" data-id="${product.id}">
                                    ${inCart ? '<i class="fas fa-check"></i>' : '<i class="fas fa-shopping-cart"></i>'}
                                </button>
                                <button class="action-btn favorite-btn" data-id="${product.id}">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="product-content">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-category">${getCategoryName(product.category)}</p>
                        <p class="product-price">${formatPrice(product.price)}</p>
                        ${inCart ? `<p class="in-cart-text">Đã có ${quantity} sản phẩm trong giỏ</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        attachProductEvents();
    }
    
    function getCategoryName(categoryKey) {
        const categories = {
            'dress': 'ĐẦM/VÁY',
            'shirt': 'ÁO SƠ MI',
            'pants': 'QUẦN',
            'jacket': 'ÁO KHOÁC',
            'accessories': 'PHỤ KIỆN',
            'evening': 'ĐẦM DẠ HỘI'
        };
        return categories[categoryKey] || categoryKey;
    }
    
    function attachProductEvents() {
        // Add to cart buttons
        document.querySelectorAll('.cart-add-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId);
            });
        });
        
        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                viewProductDetails(productId);
            });
        });
        
        // Favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                toggleFavorite(productId);
            });
        });
    }
    
    // =================== FILTERS ===================
    function initFilters() {
        // Category filters
        document.querySelectorAll('.categories a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update active state
                document.querySelectorAll('.categories a').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                filterProductsByCategory(category);
            });
        });
        
        // Price filter
        const priceFilter = document.querySelector('.price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', function() {
                filterProductsByPrice(this.value);
            });
        }
        
        // Size filters
        document.querySelectorAll('.size-filter').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                // You can implement size filtering here
            });
        });
        
        // Sort filter
        const sortFilter = document.querySelector('.sort-select');
        if (sortFilter) {
            sortFilter.addEventListener('change', function() {
                sortProducts(this.value);
            });
        }
    }
    
    function filterProductsByCategory(category) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    function filterProductsByPrice(range) {
        // Implement price filtering
        console.log('Filter by price:', range);
    }
    
    function sortProducts(sortBy) {
        // Implement sorting
        console.log('Sort by:', sortBy);
    }
    
    // =================== CART ===================
    function initCart() {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('velora_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        
        updateCartCount();
    }
    
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
    
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
        });
    }
    
    function saveCart() {
        localStorage.setItem('velora_cart', JSON.stringify(cart));
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
        }
    }
    
    // =================== MODAL SYSTEM ===================
    function initModalSystem() {
        // User button
        const userBtn = document.getElementById('user-btn');
        if (userBtn) {
            userBtn.addEventListener('click', function() {
                openLoginModal();
            });
        }
        
        // Cart button
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', function() {
                openCartModal();
            });
        }
        
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
    }
    
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    function openLoginModal() {
        openModal('loginModal');
    }
    
    function openCartModal() {
        updateCartModal();
        openModal('cartModal');
    }
    
    function updateCartModal() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Giỏ hàng của bạn đang trống</p>
                </div>
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
        
        // Attach cart item events
        attachCartItemEvents();
    }
    
    function attachCartItemEvents() {
        // Remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
        
        // Quantity buttons
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
    
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartCount();
        updateCartModal();
        updateProductCartState(productId);
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
    
    // =================== NOTIFICATION SYSTEM ===================
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';
        
        notification.innerHTML = `
            <div class="notification-content">
                ${icon} ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            addNotificationStyles();
        }
    }
    
    function addNotificationStyles() {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 9999;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                border-left: 4px solid var(--primary);
            }
            .notification.success {
                border-left-color: #4CAF50;
            }
            .notification.error {
                border-left-color: #F44336;
            }
            .notification.warning {
                border-left-color: #FF9800;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 500;
            }
            @media (max-width: 768px) {
                .notification {
                    top: auto;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    transform: translateY(150%);
                }
                .notification.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // =================== HELPER FUNCTIONS ===================
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(price);
    }
    
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
    
    function viewProductDetails(productId) {
        // You can implement this function as needed
        console.log('View product:', productId);
        showNotification('Đang mở chi tiết sản phẩm...', 'info');
    }
    
    function toggleFavorite(productId) {
        let favorites = JSON.parse(localStorage.getItem('velora_favorites')) || [];
        const index = favorites.indexOf(productId);
        
        if (index >= 0) {
            favorites.splice(index, 1);
            showNotification('Đã xóa khỏi danh sách yêu thích');
        } else {
            favorites.push(productId);
            showNotification('Đã thêm vào danh sách yêu thích', 'success');
        }
        
        localStorage.setItem('velora_favorites', JSON.stringify(favorites));
    }
    
    // =================== START APPLICATION ===================
    await initializeApp();
});
