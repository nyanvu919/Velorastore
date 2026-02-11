// script/products.js
import { addToCart } from './cart.js';
import { showNotification, formatPrice } from './utils.js';

// =========================
// INIT PRODUCTS
// =========================
export async function initProducts() {      
    console.log('🔄 Đang tải sản phẩm...');
    
    // Load sample products
    const products = getSampleProducts();
    window.allProducts = products;
    
    // Render products
    renderProducts();
    
    // Initialize filters
    initFilters();
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }
    
    return products;
}

// =========================
// SAMPLE PRODUCTS
// =========================
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

// =========================
// RENDER PRODUCTS
// =========================
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    const products = window.allProducts || [];
    
    productsGrid.innerHTML = products.map(product => {
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-img" style="background-image: url('${product.image}')">
                    <div class="product-overlay">
                        <div class="product-actions">
                            <button class="action-btn view-btn" data-id="${product.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn cart-add-btn" data-id="${product.id}">
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
                    <p class="product-price">${formatPrice(product.price)}</p>
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
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            showNotification('Xem chi tiết sản phẩm ID: ' + productId, 'info');
        });
    });
    
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const product = (window.allProducts || []).find(p => p.id == productId);
            if (product) {
                showNotification(`Đã thêm "${product.name}" vào yêu thích`, 'success');
            }
        });
    });
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
            // Thực hiện lọc theo size
            showNotification('Đã lọc theo kích thước ' + this.dataset.size, 'info');
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
    const productCards = document.querySelectorAll('.product-card');
    const countElement = document.querySelector('.category-count[data-category="' + category + '"]');
    
    let visibleCount = 0;
    
    productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    showNotification(`Hiển thị ${visibleCount} sản phẩm`, 'info');
}

// =========================
// FILTER BY PRICE
// =========================
function filterProductsByPrice(priceRange) {
    const products = window.allProducts || [];
    const filteredProducts = products.filter(product => {
        switch(priceRange) {
            case 'low': return product.price < 2000000;
            case 'medium': return product.price >= 2000000 && product.price <= 5000000;
            case 'high': return product.price > 5000000;
            default: return true;
        }
    });
    
    renderFilteredProducts(filteredProducts);
    showNotification(`Lọc theo mức giá: ${getPriceRangeName(priceRange)}`, 'info');
}

// =========================
// SORT PRODUCTS
// =========================
function sortProducts(sortBy) {
    const products = [...(window.allProducts || [])];
    
    switch(sortBy) {
        case 'newest':
            // Giả sử sản phẩm mới thêm sau
            products.reverse();
            break;
        case 'price-low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            // Giả sử sản phẩm đầu tiên là phổ biến nhất
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
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-img" style="background-image: url('${product.image}')">
                    <div class="product-overlay">
                        <div class="product-actions">
                            <button class="action-btn view-btn" data-id="${product.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn cart-add-btn" data-id="${product.id}">
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
                    <p class="product-price">${formatPrice(product.price)}</p>
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
    // Thêm sản phẩm giả cho demo
    const newProducts = [
        {
            id: "9",
            name: "Áo dài cách tân",
            category: "dress",
            price: 2500000,
            image: "srcimg/sample.jpg",
            description: "Áo dài cách tân hiện đại"
        },
        {
            id: "10",
            name: "Set vest nữ cao cấp",
            category: "jacket",
            price: 3800000,
            image: "srcimg/sample.jpg",
            description: "Set vest công sở"
        }
    ];
    
    window.allProducts = [...window.allProducts, ...newProducts];
    
    renderProducts();
    showNotification('Đã tải thêm 2 sản phẩm mới', 'success');
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
