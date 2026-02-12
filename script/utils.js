// script/utils.js - FIXED SEARCH CLICK HANDLER

// =========================
// FORMAT PRICE
// =========================
export function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// =========================
// SHOW NOTIFICATION
// =========================
export function showNotification(message, type = 'info') {
    // Xóa thông báo cũ nếu có
    const oldNotification = document.querySelector('.custom-notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Hiển thị thông báo
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Tự động ẩn sau 3 giây
    const autoHide = setTimeout(() => {
        closeNotification(notification);
    }, 3000);
    
    // Nút đóng thông báo
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.onclick = () => {
        clearTimeout(autoHide);
        closeNotification(notification);
    };
    
    function closeNotification(notif) {
        notif.classList.remove('show');
        setTimeout(() => {
            if (notif.parentNode) {
                notif.remove();
            }
        }, 300);
    }
}

// =========================
// MODAL FUNCTIONS - FIXED
// =========================
export function openModal(modalOrId) {
    let modal;
    
    if (typeof modalOrId === 'string') {
        modal = document.getElementById(modalOrId);
    } else {
        modal = modalOrId;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal opened:', modal.id);
        return true;
    } else {
        console.error('❌ Cannot open modal - not found:', modalOrId);
        return false;
    }
}

export function closeModal(modalOrId) {
    let modal;
    
    if (typeof modalOrId === 'string') {
        modal = document.getElementById(modalOrId);
    } else {
        modal = modalOrId;
    }
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('✅ Modal closed:', modal.id);
        return true;
    } else {
        console.error('❌ Cannot close modal - not found:', modalOrId);
        return false;
    }
}

// 🟢 THÊM VÀO WINDOW ĐỂ DÙNG TỪ CONSOLE
window.openModal = openModal;
window.closeModal = closeModal;

// =========================
// SEARCH FUNCTION - FIXED WITH CLICK HANDLER
// =========================
export function performSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    query = query.toLowerCase().trim();
    
    if (query.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-results" style="text-align: center; padding: 20px; color: #666;">Nhập từ khóa để tìm kiếm...</p>';
        return;
    }
    
    const allProducts = window.allProducts || [];
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
    
    if (filteredProducts.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-results" style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
                <p style="font-size: 1.1rem; color: #666;">Không tìm thấy sản phẩm nào với từ khóa "${query}"</p>
                <p style="color: #999; margin-top: 10px;">Thử tìm kiếm với từ khóa khác</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="search-results-header" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0; color: #8B7355;">Tìm thấy ${filteredProducts.length} sản phẩm</h4>
            <span style="color: #666; font-size: 0.9rem;">Click vào sản phẩm để xem chi tiết</span>
        </div>
        <div class="search-results-grid" style="display: grid; grid-template-columns: 1fr; gap: 15px; max-height: 400px; overflow-y: auto; padding-right: 5px;">
            ${filteredProducts.map(product => `
                <div class="search-result-item" data-id="${product.id}" 
                     style="display: flex; gap: 15px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: white;"
                     onmouseover="this.style.backgroundColor='#f8f9fa'; this.style.borderColor='#8B7355';"
                     onmouseout="this.style.backgroundColor='white'; this.style.borderColor='#e0e0e0';">
                    <div class="search-result-img" style="width: 80px; height: 80px; flex-shrink: 0;">
                        <img src="${product.image}" alt="${product.name}" 
                             style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;"
                             onerror="this.src='srcimg/default-product.jpg'">
                    </div>
                    <div class="search-result-info" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                        <h5 style="margin: 0 0 5px 0; font-size: 1rem; color: #333; font-weight: 600;">${product.name}</h5>
                        <p class="search-result-category" style="margin: 0 0 5px 0; font-size: 0.85rem; color: #8B7355; text-transform: uppercase; letter-spacing: 1px;">
                            ${getCategoryName(product.category)}
                        </p>
                        <p class="search-result-price" style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #e74c3c;">
                            ${formatPrice(product.price)}
                        </p>
                        <span style="font-size: 0.8rem; color: ${product.stock > 0 ? '#27ae60' : '#e74c3c'}; margin-top: 5px;">
                            ${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <i class="fas fa-chevron-right" style="color: #ccc;"></i>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 🟢🟢🟢 THÊM EVENT LISTENER CHO TỪNG KẾT QUẢ TÌM KIẾM 🟢🟢🟢
    document.querySelectorAll('.search-result-item').forEach(item => {
        // Xóa event cũ để tránh bị trùng
        item.removeEventListener('click', handleSearchResultClick);
        // Thêm event mới
        item.addEventListener('click', handleSearchResultClick);
    });
}

// =========================
// HANDLE SEARCH RESULT CLICK - FIXED
// =========================
function handleSearchResultClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = this.getAttribute('data-id');
    console.log('🟢 Click vào sản phẩm tìm kiếm:', productId);
    
    // Đóng modal tìm kiếm
    closeModal('searchModal');
    
    // Tìm sản phẩm
    const allProducts = window.allProducts || [];
    const product = allProducts.find(p => p.id == productId);
    
    if (product) {
        // Hiển thị thông báo
        showNotification(`Đã chọn: ${product.name}`, 'success');
        
        // Mở modal chi tiết sản phẩm
        setTimeout(() => {
            showProductDetails(productId);
        }, 300);
    } else {
        showNotification('Không tìm thấy sản phẩm', 'error');
    }
}

// =========================
// SHOW PRODUCT DETAILS - FIXED
// =========================
export function showProductDetails(productId) {
    console.log('🟢 Hiển thị chi tiết sản phẩm:', productId);
    
    const allProducts = window.allProducts || [];
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Không tìm thấy sản phẩm', 'error');
        return;
    }
    
    // Kiểm tra và tạo modal chi tiết sản phẩm nếu chưa có
    let modal = document.getElementById('productDetailModal');
    if (!modal) {
        modal = createProductDetailModal();
    }
    
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;
    
    // Render chi tiết sản phẩm
    modalBody.innerHTML = `
        <div class="product-detail" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div class="product-detail-images">
                <div class="main-image" style="border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                    <img src="${product.image}" alt="${product.name}" 
                         style="width: 100%; height: 400px; object-fit: cover;"
                         onerror="this.src='srcimg/default-product.jpg'">
                </div>
            </div>
            <div class="product-detail-info">
                <h2 style="font-size: 1.8rem; color: #8B7355; margin-bottom: 10px;">${product.name}</h2>
                <p class="product-category" style="color: #666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">
                    ${getCategoryName(product.category)}
                </p>
                <p class="product-price" style="font-size: 2rem; font-weight: 700; color: #e74c3c; margin-bottom: 20px;">
                    ${formatPrice(product.price)}
                </p>
                
                <div class="stock-info" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <span style="font-weight: 600; color: #333;">Tình trạng:</span>
                    <span style="margin-left: 10px; padding: 5px 15px; border-radius: 20px; background: ${product.stock > 0 ? '#27ae60' : '#e74c3c'}; color: white; font-size: 0.9rem;">
                        ${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                    ${product.stock > 0 && product.stock < 10 ? 
                        `<span style="margin-left: 10px; color: #f39c12;">Chỉ còn ${product.stock} sản phẩm!</span>` : ''}
                </div>
                
                <div class="product-description" style="margin-bottom: 30px;">
                    <h4 style="color: #333; margin-bottom: 10px;">Mô tả sản phẩm</h4>
                    <p style="color: #666; line-height: 1.6;">${product.description}</p>
                </div>
                
                <div class="product-actions" style="display: flex; gap: 15px; align-items: center;">
                    <div class="quantity-selector" style="display: flex; align-items: center; border: 1px solid #e0e0e0; border-radius: 5px; overflow: hidden;">
                        <button class="qty-btn minus" style="width: 40px; height: 40px; border: none; background: #f8f9fa; cursor: pointer; font-size: 1.2rem; font-weight: 600;">-</button>
                        <input type="number" class="qty-input" value="1" min="1" max="${product.stock}" 
                               style="width: 60px; height: 40px; border: none; text-align: center; font-size: 1rem; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;"
                               readonly>
                        <button class="qty-btn plus" style="width: 40px; height: 40px; border: none; background: #f8f9fa; cursor: pointer; font-size: 1.2rem; font-weight: 600;">+</button>
                    </div>
                    <button class="btn btn-primary add-to-cart-detail" 
                            ${product.stock <= 0 ? 'disabled' : ''}
                            style="flex: 1; padding: 12px 25px; background: ${product.stock > 0 ? '#8B7355' : '#ccc'}; color: white; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-shopping-cart"></i>
                        ${product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Mở modal
    openModal(modal);
    
    // Thêm event listeners cho quantity buttons
    const minusBtn = modal.querySelector('.qty-btn.minus');
    const plusBtn = modal.querySelector('.qty-btn.plus');
    const qtyInput = modal.querySelector('.qty-input');
    
    if (minusBtn && qtyInput) {
        minusBtn.onclick = () => {
            let value = parseInt(qtyInput.value) || 1;
            if (value > 1) {
                qtyInput.value = value - 1;
            }
        };
    }
    
    if (plusBtn && qtyInput) {
        plusBtn.onclick = () => {
            let value = parseInt(qtyInput.value) || 1;
            if (value < product.stock) {
                qtyInput.value = value + 1;
            }
        };
    }
    
    // Thêm event listener cho nút thêm vào giỏ
    const addToCartBtn = modal.querySelector('.add-to-cart-detail');
    if (addToCartBtn && product.stock > 0) {
        addToCartBtn.onclick = () => {
            import('./cart.js').then(cartModule => {
                const quantity = parseInt(qtyInput.value) || 1;
                for (let i = 0; i < quantity; i++) {
                    cartModule.addToCart(productId);
                }
                closeModal(modal);
            });
        };
    }
}

// =========================
// CREATE PRODUCT DETAIL MODAL
// =========================
function createProductDetailModal() {
    // Kiểm tra nếu đã tồn tại
    if (document.getElementById('productDetailModal')) {
        return document.getElementById('productDetailModal');
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'productDetailModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 1000px; width: 90%;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-bottom: 1px solid #e0e0e0;">
                <h2 style="margin: 0; color: #8B7355;">Chi tiết sản phẩm</h2>
                <button class="close-modal" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 25px;">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal(modal);
    }
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    };
    
    return modal;
}

// =========================
// CATEGORY NAME HELPER
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

// =========================
// VALIDATE FUNCTIONS
// =========================
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhone(phone) {
    const phoneRegex = /(84|0)[3|5|7|8|9][0-9]{8}\b/;
    return phoneRegex.test(phone);
}

export function validateRequired(fields) {
    for (const [field, value] of Object.entries(fields)) {
        if (!value || value.trim() === '') {
            return { valid: false, field: field, message: `Vui lòng điền ${field}` };
        }
    }
    return { valid: true };
}

// =========================
// DEBOUNCE FUNCTION
// =========================
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =========================
// LOADING INDICATOR
// =========================
export function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-spinner" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #8B7355;"></i>
                <p style="margin-top: 15px; color: #666;">Đang tải...</p>
            </div>
        `;
    }
}

export function hideLoading(elementId, content = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

// 🟢🟢🟢 EXPORT HÀM showProductDetails 🟢🟢🟢
export default {
    formatPrice,
    showNotification,
    openModal,
    closeModal,
    performSearch,
    showProductDetails,
    validateEmail,
    validatePhone,
    validateRequired,
    debounce,
    showLoading,
    hideLoading
};

console.log('✅ Utils.js loaded - Search click handler đã được fix!');
