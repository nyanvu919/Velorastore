// script/products.js
import { formatPrice, getCategoryName } from './ui.js';
import { addToCart } from './cart.js';

let allProducts = [];

// =================== PRODUCTS INITIALIZATION ===================
async function initProducts(apiBaseUrl) {
    try {
        const response = await fetch(`${apiBaseUrl}/products`);
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
    initFilters();
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

// =================== RENDER PRODUCTS ===================
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = allProducts.map(product => {
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
    console.log('Filter by price:', range);
    // Implement price filtering logic here
}

function sortProducts(sortBy) {
    console.log('Sort by:', sortBy);
    // Implement sorting logic here
}

// =================== PRODUCT DETAILS ===================
function viewProductDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Create and show product details modal
    const modalContent = `
        <div class="product-details">
            <div class="product-details-img" style="background-image: url('${product.image}')"></div>
            <div class="product-details-info">
                <h2>${product.name}</h2>
                <p class="product-category">${getCategoryName(product.category)}</p>
                <p class="product-price-large">${formatPrice(product.price)}</p>
                <p class="product-description">${product.description}</p>
                
                <div class="product-actions" style="margin-top: 20px;">
                    <button class="btn btn-primary" id="addToCartDetail" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-heart"></i> Yêu thích
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // You can create a modal for product details here
    console.log('Viewing product:', product.name);
}

function toggleFavorite(productId) {
    let favorites = JSON.parse(localStorage.getItem('velora_favorites')) || [];
    const index = favorites.indexOf(productId);
    
    if (index >= 0) {
        favorites.splice(index, 1);
        console.log('Removed from favorites');
    } else {
        favorites.push(productId);
        console.log('Added to favorites');
    }
    
    localStorage.setItem('velora_favorites', JSON.stringify(favorites));
}

// =================== EXPORTS ===================
export {
    allProducts,
    initProducts,
    renderProducts,
    getAllProducts: () => allProducts
};
