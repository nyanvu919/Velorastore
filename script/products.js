// script/products.js
import { addToCart } from './cart.js';
import { showNotification, formatPrice } from './utils.js';

// =========================
// INIT PRODUCTS
// =========================
export async function initProducts() {      
    console.log('🔄 Đang tải sản phẩm...');
    
    try {
        // Load products from API
        await loadProductsFromAPI();
        
        // Initialize filters
        initFilters();
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreProducts);
        }
        
        console.log(`✅ Đã tải ${window.allProducts.length} sản phẩm`);
        return window.allProducts;
        
    } catch (error) {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
        loadSampleProducts(); // Fallback
        return window.allProducts;
    }
}

// =========================
// LOAD FROM API
// =========================
async function loadProductsFromAPI() {
    try {
        console.log('📡 Đang tải sản phẩm từ API...');
        
        const response = await fetch('/api/products');
        
        if (!response.ok) {
            throw new Error(`API trả về mã lỗi: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            window.allProducts = data.data;
            renderProducts();
            updateCategoryCounts();
        } else {
            throw new Error('API trả về dữ liệu không hợp lệ');
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi tải từ API:', error);
        throw error; // Rethrow để xử lý ở trên
    }
}

// =========================
// UPDATE CATEGORY COUNTS
// =========================
function updateCategoryCounts() {
    const products = window.allProducts || [];
    
    // Tính số lượng sản phẩm theo danh mục
    const categoryCounts = {
        'all': products.length,
        'dress': products.filter(p => p.category === 'dress').length,
        'shirt': products.filter(p => p.category === 'shirt').length,
        'pants': products.filter(p => p.category === 'pants').length,
        'jacket': products.filter(p => p.category === 'jacket').length,
        'accessories': products.filter(p => p.category === 'accessories').length,
        'evening': products.filter(p => p.category === 'evening').length
    };
    
    // Cập nhật UI
    Object.entries(categoryCounts).forEach(([category, count]) => {
        const countElement = document.querySelector(`.category-count[data-category="${category}"]`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// =========================
// SAMPLE PRODUCTS FALLBACK
// =========================
function loadSampleProducts() {
    console.log('🔄 Đang tải sản phẩm mẫu...');
    
    window.allProducts = getSampleProducts();
    renderProducts();
    updateCategoryCounts();
}

function getSampleProducts() {
    return [
        {
            id: "1",
            name: "Đầm dạ hội lộng lẫy",
            category: "evening",
            price: 3500000,
            image: "srcimg/5 (3).png",
            description: "Đầm dạ hội cao cấp với chất liệu lụa mềm mại",
            stock: 10,
            featured: true,
            active: true
        },
        {
            id: "2",
            name: "Áo sơ mi trắng công sở",
            category: "shirt",
            price: 850000,
            image: "srcimg/5 (2).png",
            description: "Áo sơ mi trắng thanh lịch",
            stock: 25,
            featured: true,
            active: true
        },
        {
            id: "3",
            name: "Quần âu dáng đứng",
            category: "pants",
            price: 1200000,
            image: "srcimg/5 (1).png",
            description: "Quần âu cao cấp",
            stock: 15,
            featured: false,
            active: true
        },
        {
            id: "4",
            name: "Áo khoác len cao cấp",
            category: "jacket",
            price: 2200000,
            image: "srcimg/default-product.jpg",
            description: "Áo khoác len ấm áp",
            stock: 8,
            featured: true,
            active: true
        },
        {
            id: "5",
            name: "Váy công sở thanh lịch",
            category: "dress",
            price: 1500000,
            image: "srcimg/default-product.jpg",
            description: "Váy công sở phong cách Hàn Quốc",
            stock: 12,
            featured: true,
            active: true
        }
    ];
}

// =========================
// RENDER PRODUCTS
// =========================
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    const products = window.allProducts || [];
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Không có sản phẩm nào</h3>
                <p>Vui lòng quay lại sau</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => {
        const isOutOfStock = product.stock <= 0;
        const stockStatus = isOutOfStock ? 'Hết hàng' : 
                          product.stock < 5 ? 'Sắp hết' : 'Còn hàng';
        
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-img" style="background-image: url('${product.image}')">
                    ${product.featured ? '<span class="featured-badge">Nổi bật</span>' : ''}
                    ${isOutOfStock ? '<div class="out-of-stock-overlay">Hết hàng</div>' : ''}
                    <div class="product-overlay">
                        <div class="product-actions">
                            <button class="action-btn view-btn" data-id="${product.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn cart-add-btn" data-id="${product.id}" 
                                    ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i>
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
                    <div class="product-details">
                        <p class="product-description">${product.description.substring(0, 60)}...</p>
                        <div class="product-footer">
                            <p class="product-price">${formatPrice(product.price)}</p>
                            <span class="stock-status ${isOutOfStock ? 'out' : product.stock < 5 ? 'low' : 'in'}">
                                ${stockStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners
    attachProductEvents();
}

// =========================
// ATTACH PRODUCT EVENTS
// =========================
function attachProductEvents() {
    document.querySelectorAll('.cart-add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            viewProductDetails(productId);
        });
    });
    
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const product = (window.allProducts || []).find(p => p.id == productId);
            if (product) {
                addToFavorites(productId);
                showNotification(`Đã thêm "${product.name}" vào yêu thích`, 'success');
            }
        });
    });
}

// =========================
// VIEW PRODUCT DETAILS
// =========================
function viewProductDetails(productId) {
    const product = (window.allProducts || []).find(p => p.id == productId);
    if (!product) return;
    
    // Tạo modal chi tiết sản phẩm
    const modal = document.getElementById('productDetailModal') || createProductDetailModal();
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-images">
                <div class="main-image">
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.src='srcimg/default-product.jpg'">
                </div>
            </div>
            <div class="product-detail-info">
                <h2>${product.name}</h2>
                <p class="product-category">${getCategoryName(product.category)}</p>
                <p class="product-price">${formatPrice(product.price)}</p>
                
                <div class="stock-info">
                    <span class="stock-label">Tình trạng:</span>
                    <span class="stock-status ${product.stock <= 0 ? 'out' : product.stock < 5 ? 'low' : 'in'}">
                        ${product.stock <= 0 ? 'Hết hàng' : 
                         product.stock < 5 ? `Còn ${product.stock} sản phẩm` : 'Còn hàng'}
                    </span>
                </div>
                
                <div class="product-description">
                    <h4>Mô tả sản phẩm</h4>
                    <p>${product.description}</p>
                </div>
                
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="qty-btn minus">-</button>
                        <input type="number" class="qty-input" value="1" min="1" max="${product.stock}">
                        <button class="qty-btn plus">+</button>
                    </div>
                    <button class="btn btn-primary add-to-cart-detail" 
                            ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    const addToCartBtn = modal.querySelector('.add-to-cart-detail');
    if (addToCartBtn && !addToCartBtn.disabled) {
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(modal.querySelector('.qty-input').value) || 1;
            for (let i = 0; i < quantity; i++) {
                addToCart(productId);
            }
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Quantity controls
    modal.querySelector('.qty-btn.minus').addEventListener('click', () => {
        const input = modal.querySelector('.qty-input');
        let value = parseInt(input.value) || 1;
        if (value > 1) {
            input.value = value - 1;
        }
    });
    
    modal.querySelector('.qty-btn.plus').addEventListener('click', () => {
        const input = modal.querySelector('.qty-input');
        let value = parseInt(input.value) || 1;
        if (value < product.stock) {
            input.value = value + 1;
        }
    });
}

function createProductDetailModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'productDetailModal';
    modal.innerHTML = `
        <div class="modal-content product-detail-modal">
            <div class="modal-header">
                <h2>Chi tiết sản phẩm</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add close functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    return modal;
}

// =========================
// ADD TO FAVORITES
// =========================
function addToFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('velora_favorites') || '[]');
    
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem('velora_favorites', JSON.stringify(favorites));
    }
}

// =========================
// INIT FILTERS
// =========================
function initFilters() {
    // Category filters
    document.querySelectorAll('.categories a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
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
            filterProductsBySize(this.dataset.size);
        });
    });
    
    // Sort filter
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
}

// =========================
// FILTER BY CATEGORY
// =========================
function filterProductsByCategory(category) {
    const products = window.allProducts || [];
    let filteredProducts;
    
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(p => p.category === category);
    }
    
    renderFilteredProducts(filteredProducts);
    showNotification(`Hiển thị ${filteredProducts.length} sản phẩm`, 'info');
}

// =========================
// FILTER BY PRICE
// =========================
function filterProductsByPrice(priceRange) {
    const products = window.allProducts || [];
    let filteredProducts;
    
    switch(priceRange) {
        case 'low':
            filteredProducts = products.filter(p => p.price < 2000000);
            break;
        case 'medium':
            filteredProducts = products.filter(p => p.price >= 2000000 && p.price <= 5000000);
            break;
        case 'high':
            filteredProducts = products.filter(p => p.price > 5000000);
            break;
        default:
            filteredProducts = products;
    }
    
    renderFilteredProducts(filteredProducts);
    showNotification(`Lọc theo mức giá: ${getPriceRangeName(priceRange)}`, 'info');
}

// =========================
// FILTER BY SIZE
// =========================
function filterProductsBySize(size) {
    // This is a demo - in a real app, products would have size information
    showNotification('Đã lọc theo kích thước ' + size, 'info');
}

// =========================
// SORT PRODUCTS
// =========================
function sortProducts(sortBy) {
    const products = [...(window.allProducts || [])];
    
    switch(sortBy) {
        case 'newest':
            // Sort by creation date (newest first)
            products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
        case 'price-low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            // Sort by featured first, then by name
            products.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.name.localeCompare(b.name);
            });
            break;
    }
    
    renderFilteredProducts(products);
    showNotification(`Sắp xếp theo: ${getSortName(sortBy)}`, 'info');
}

// =========================
// RENDER FILTERED PRODUCTS
// =========================
function renderFilteredProducts(filteredProducts) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử tìm kiếm với bộ lọc khác</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        const isOutOfStock = product.stock <= 0;
        const stockStatus = isOutOfStock ? 'Hết hàng' : 
                          product.stock < 5 ? 'Sắp hết' : 'Còn hàng';
        
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-img" style="background-image: url('${product.image}')">
                    ${product.featured ? '<span class="featured-badge">Nổi bật</span>' : ''}
                    ${isOutOfStock ? '<div class="out-of-stock-overlay">Hết hàng</div>' : ''}
                    <div class="product-overlay">
                        <div class="product-actions">
                            <button class="action-btn view-btn" data-id="${product.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn cart-add-btn" data-id="${product.id}" 
                                    ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i>
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
                    <div class="product-details">
                        <p class="product-description">${product.description.substring(0, 60)}...</p>
                        <div class="product-footer">
                            <p class="product-price">${formatPrice(product.price)}</p>
                            <span class="stock-status ${isOutOfStock ? 'out' : product.stock < 5 ? 'low' : 'in'}">
                                ${stockStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    attachProductEvents();
}

// =========================
// LOAD MORE PRODUCTS
// =========================
function loadMoreProducts() {
    showNotification('Đang tải thêm sản phẩm...', 'info');
    
    // In a real app, you would fetch more products from API
    // For demo, just show a message
    setTimeout(() => {
        showNotification('Đã tải xong tất cả sản phẩm', 'success');
        
        // Disable the button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> Đã tải hết sản phẩm';
        }
    }, 1000);
}

// =========================
// HELPER FUNCTIONS
// =========================
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

function getPriceRangeName(range) {
    const ranges = {
        'all': 'Tất cả mức giá',
        'low': 'Dưới 2 triệu',
        'medium': '2-5 triệu',
        'high': 'Trên 5 triệu'
    };
    return ranges[range] || range;
}

function getSortName(sort) {
    const sorts = {
        'popular': 'Phổ biến nhất',
        'newest': 'Mới nhất',
        'price-low': 'Giá thấp đến cao',
        'price-high': 'Giá cao đến thấp'
    };
    return sorts[sort] || sort;
}
