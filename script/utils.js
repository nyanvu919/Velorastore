// script/utils.js

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
// MODAL FUNCTIONS
// =========================
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

export function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// =========================
// SEARCH FUNCTION
// =========================
export function performSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    query = query.toLowerCase().trim();
    
    if (query.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-results">Nhập từ khóa để tìm kiếm...</p>';
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
            <div class="empty-results">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy sản phẩm nào với từ khóa "${query}"</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="search-results-header">
            <h4>Tìm thấy ${filteredProducts.length} sản phẩm</h4>
        </div>
        <div class="search-results-grid">
            ${filteredProducts.map(product => `
                <div class="search-result-item" data-id="${product.id}">
                    <div class="search-result-img" style="background-image: url('${product.image}')"></div>
                    <div class="search-result-info">
                        <h5>${product.name}</h5>
                        <p class="search-result-category">${getCategoryName(product.category)}</p>
                        <p class="search-result-price">${formatPrice(product.price)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Thêm sự kiện click cho kết quả tìm kiếm
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.onclick = () => {
            const productId = item.getAttribute('data-id');
            closeModal(document.getElementById('searchModal'));
            showNotification(`Đã chọn sản phẩm ID: ${productId}`, 'info');
        };
    });
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
