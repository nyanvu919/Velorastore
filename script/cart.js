// script/ui.js
// Xử lý giao diện và navigation

function initUI() {
    console.log('🔄 Khởi tạo giao diện...');
    
    // Navigation menu
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
    
    // Slideshow
    initSlideshow();
    
    // Modal system
    initModalSystem();
    
    // Add notification styles
    addNotificationStyles();
}

function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    // Auto slide
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);
    
    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
}

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
                searchInput.addEventListener('input', function() {
                    performSearch(this.value);
                });
            }
        });
    }
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

function performSearch(keyword) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    if (!keyword.trim()) {
        resultsContainer.innerHTML = '<p class="empty-cart">Nhập từ khóa để tìm kiếm</p>';
        return;
    }
    
    const searchTerm = keyword.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    if (filteredProducts.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy sản phẩm phù hợp</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = filteredProducts.map(product => `
        <div class="search-result-item">
            <div class="search-result-img" style="background-image: url('${product.image}')"></div>
            <div class="search-result-details">
                <h4>${product.name}</h4>
                <p class="search-result-category">${getCategoryName(product.category)}</p>
                <p class="search-result-price">${formatPrice(product.price)}</p>
                <button class="btn btn-primary view-product" data-id="${product.id}">
                    Xem chi tiết
                </button>
            </div>
        </div>
    `).join('');
    
    // Add click events
    document.querySelectorAll('.view-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            closeModal(document.getElementById('searchModal'));
            // You can add product view function here
            showNotification('Đang mở chi tiết sản phẩm...');
        });
    });
}

function addNotificationStyles() {
    if (!document.querySelector('#notification-styles')) {
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
                border-left: 4px solid #8B7355;
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
        `;
        document.head.appendChild(style);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<div class="notification-content">${message}</div>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
    return categories[categoryKey] || categoryKey.toUpperCase();
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}
