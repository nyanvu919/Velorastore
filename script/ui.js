// script/ui.js
import { updateCartModal } from './cart.js';
import { openModal, closeModal, performSearch } from './utils.js';

// =========================
// INIT UI
// =========================
export function initUI() {
    console.log('🔄 Khởi tạo giao diện...');
    
    // Navigation menu
    initNavigation();
    
    // Slideshow
    initSlideshow();
    
    // Modal system
    initModalSystem();
    
    // Collections
    initCollections();
}

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
// SLIDESHOW
// =========================
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    // Auto slide
    function startAutoSlide() {
        slideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }
    
    function stopAutoSlide() {
        clearInterval(slideInterval);
    }
    
    startAutoSlide();
    
    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoSlide();
            showSlide(index);
            startAutoSlide();
        });
    });
    
    // Pause on hover
    const slideshow = document.querySelector('.hero-slideshow');
    if (slideshow) {
        slideshow.addEventListener('mouseenter', stopAutoSlide);
        slideshow.addEventListener('mouseleave', startAutoSlide);
    }
}

// =========================
// MODAL SYSTEM
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
// COLLECTIONS
// =========================
function initCollections() {
    const collectionsGrid = document.querySelector('.collections-grid');
    if (!collectionsGrid) return;
    
    const collections = [
        {
            name: 'Thu Đông 2023',
            image: 'srcimg/collection1.jpg',
            description: 'Bộ sưu tập mới nhất với chất liệu ấm áp'
        },
        {
            name: 'Đầm Dạ Hội',
            image: 'srcimg/collection2.jpg',
            description: 'Những thiết kế lộng lẫy cho các buổi tiệc'
        },
        {
            name: 'Công Sở',
            image: 'srcimg/collection3.jpg',
            description: 'Trang phục thanh lịch dành cho văn phòng'
        },
        {
            name: 'Cuối Tuần',
            image: 'srcimg/collection4.jpg',
            description: 'Phong cách thoải mái cho những ngày nghỉ'
        }
    ];
    
    collectionsGrid.innerHTML = collections.map(collection => `
        <div class="collection-card">
            <div class="collection-img" style="background-image: url('${collection.image}')">
                <div class="collection-overlay">
                    <h3>${collection.name}</h3>
                    <p>${collection.description}</p>
                    <button class="btn btn-outline">Khám phá</button>
                </div>
            </div>
        </div>
    `).join('');
}



console.log('✅ Modal functions loaded - Có thể gọi openModal() từ console');
