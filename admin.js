// admin.js - Velora Fashion Admin Script (FULLY UPDATED)
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_BASE_URL = 'https://velora-api.nyaochen9.workers.dev/api';
    let adminKey = '';
    let refreshInterval = null;
    let countdownInterval = null;
    let productsCache = {};
    let currentOrder = null;
    
    // DOM Elements
    const connectionStatus = document.getElementById('connectionStatus');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    // =================== HELPER FUNCTIONS ===================
    
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function getStatusText(status) {
        const statusMap = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'shipped': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }
    
    function showAlert(message, type = 'info') {
        // Remove existing alert
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) existingAlert.remove();
        
        const alert = document.createElement('div');
        alert.className = `custom-alert ${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} 
                ${message}
            </div>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) alert.remove();
            }, 300);
        }, 3000);
        
        // Add styles if not exist
        if (!document.querySelector('#alert-styles')) {
            const style = document.createElement('style');
            style.id = 'alert-styles';
            style.textContent = `
                .custom-alert {
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
                .custom-alert.success {
                    border-left-color: #4CAF50;
                }
                .custom-alert.error {
                    border-left-color: #F44336;
                }
                .custom-alert.warning {
                    border-left-color: #FF9800;
                }
                .custom-alert.show {
                    transform: translateX(0);
                }
                .alert-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                }
                @media (max-width: 768px) {
                    .custom-alert {
                        top: auto;
                        bottom: 20px;
                        left: 20px;
                        right: 20px;
                        transform: translateY(150%);
                    }
                    .custom-alert.show {
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // =================== PRODUCT FUNCTIONS ===================
    
    async function loadProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                headers: {
                    'X-API-Key': adminKey
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    return result.data || [];
                }
            }
        } catch (error) {
            console.error('Load products error:', error);
        }
        return getSampleProducts();
    }
    
    function getSampleProducts() {
        return [
            {
                id: "1",
                name: "Đầm dạ hội lộng lẫy",
                category: "ĐẦM DẠ HỘI",
                price: 3500000,
                image: "srcimg/5 (3).png",
                description: "Đầm dạ hội cao cấp",
                stock: 10,
                featured: true
            },
            {
                id: "2",
                name: "Áo sơ mi lụa cao cấp",
                category: "ÁO SƠ MI",
                price: 1200000,
                image: "srcimg/6 (3).png",
                description: "Áo sơ mi lụa sang trọng",
                stock: 15,
                featured: true
            },
            {
                id: "3",
                name: "Quần âu sang trọng",
                category: "QUẦN ÂU",
                price: 1800000,
                image: "srcimg/7 (1).png",
                description: "Quần âu cao cấp",
                stock: 8,
                featured: true
            },
            {
                id: "4",
                name: "Áo khoác da thật",
                category: "ÁO KHOÁC",
                price: 4500000,
                image: "srcimg/7 (2).png",
                description: "Áo khoác da thật",
                stock: 5,
                featured: true
            },
            {
                id: "5",
                name: "Váy công sở thanh lịch",
                category: "VÁY",
                price: 1600000,
                image: "srcimg/5f7d5610fa1a74442d0b.jpg",
                description: "Váy công sở thanh lịch",
                stock: 12,
                featured: false
            },
            {
                id: "6",
                name: "Set đồ thể thao cao cấp",
                category: "ĐỒ THỂ THAO",
                price: 2200000,
                image: "srcimg/6912a04bf25b7c05254a.jpg",
                description: "Set đồ thể thao cao cấp",
                stock: 20,
                featured: false
            },
            {
                id: "7",
                name: "Áo len cashmere",
                category: "ÁO LEN",
                price: 2800000,
                image: "srcimg/8186fcbeaeae20f079bf.jpg",
                description: "Áo len cashmere cao cấp",
                stock: 7,
                featured: true
            },
            {
                id: "8",
                name: "Chân váy bút chì",
                category: "CHÂN VÁY",
                price: 1400000,
                image: "srcimg/a48eb8a7b3b73de964a6.jpg",
                description: "Chân váy bút chì công sở",
                stock: 18,
                featured: false
            }
        ];
    }
    
    async function initializeProductsCache() {
        try {
            const products = await loadProducts();
            productsCache = {};
            products.forEach(product => {
                if (product.id) {
                    productsCache[product.id] = product;
                }
            });
            console.log('Products cache initialized:', Object.keys(productsCache).length, 'products');
            return true;
        } catch (error) {
            console.error('Failed to initialize products cache:', error);
            // Fallback to sample products
            const sampleProducts = getSampleProducts();
            productsCache = {};
            sampleProducts.forEach(product => {
                if (product.id) {
                    productsCache[product.id] = product;
                }
            });
            return false;
        }
    }
    
    function getProductUrl(productId) {
        // Get base URL
        const baseUrl = window.location.origin;
        // Get current path and adjust for admin.html
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.includes('admin.html');
        const productPath = isAdminPage ? 'index.html' : currentPath;
        
        // Create product URL with hash
        return `${baseUrl}/${productPath}#product-${productId}`;
    }
    
    function openProductPage(productId, productName = '') {
        const url = getProductUrl(productId);
        
        // Try to open in new tab
        const productWindow = window.open(url, '_blank');
        
        if (productWindow) {
            productWindow.focus();
            showAlert(`Đang mở: ${productName || `Sản phẩm ${productId}`}`, 'info');
        } else {
            // If popup blocked, show notification
            showAlert(`Vui lòng cho phép popup để xem chi tiết sản phẩm. Hoặc truy cập: ${url}`, 'warning');
        }
    }
    
    // =================== CONNECTION FUNCTIONS ===================
    
    function connectAdmin() {
        adminKey = document.getElementById('adminKey').value.trim();
        
        if (!adminKey) {
            showAlert('Vui lòng nhập Admin API Key', 'error');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('velora_admin_key', adminKey);
        
        // Update UI
        connectionStatus.innerHTML = `
            <i class="fas fa-circle" style="color: #28a745; margin-right: 5px;"></i>
            <span>Đã kết nối</span>
        `;
        
        refreshBtn.disabled = false;
        exportBtn.disabled = false;
        
        // Load data
        loadData();
        
        // Initialize products cache
        setTimeout(() => {
            initializeProductsCache();
        }, 500);
        
        // Start auto-refresh
        startAutoRefresh();
        
        showAlert('Kết nối thành công!', 'success');
    }
    
    // =================== DATA LOADING ===================
    
    async function loadData() {
        if (!adminKey) {
            showAlert('Vui lòng kết nối trước', 'error');
            return;
        }
        
        try {
            // Load stats
            await loadStats();
            
            // Load orders
            await loadOrders();
            
            // Reset countdown
            resetCountdown();
            
        } catch (error) {
            console.error('Load data error:', error);
            showAlert('Lỗi kết nối: ' + error.message, 'error');
        }
    }
    
    async function loadStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                headers: {
                    'X-API-Key': adminKey
                }
            });
            
            if (!response.ok) throw new Error('Không thể lấy thống kê');
            
            const result = await response.json();
            
            if (result.success) {
                const stats = result.data;
                
                // Update stats cards
                document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
                document.getElementById('ordersChange').textContent = `+${stats.todayOrders || 0} hôm nay`;
                
                document.getElementById('totalRevenue').textContent = formatPrice(stats.totalRevenue || 0);
                document.getElementById('revenueChange').textContent = `+${formatPrice(stats.todayRevenue || 0)} hôm nay`;
                
                document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
                document.getElementById('pendingChange').textContent = stats.pendingOrders > 0 ? 'Cần xử lý ngay' : 'Tất cả đã xử lý';
                
                document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
                document.getElementById('productsChange').textContent = `${stats.lowStockProducts || 0} sắp hết hàng`;
            }
            
        } catch (error) {
            console.error('Load stats error:', error);
        }
    }
    
    async function loadOrders() {
        const ordersTable = document.getElementById('ordersTable');
        ordersTable.innerHTML = `
            <div class="loading">
                <div class="loader"></div>
                <p>Đang tải đơn hàng...</p>
            </div>
        `;
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: {
                    'X-API-Key': adminKey
                }
            });
            
            if (!response.ok) throw new Error('Không thể lấy danh sách đơn hàng');
            
            const result = await response.json();
            
            if (result.success) {
                renderOrders(result.data);
                document.getElementById('ordersCount').textContent = result.count || 0;
            } else {
                showAlert(result.error || 'Không thể tải đơn hàng', 'error');
                ordersTable.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #dc3545;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>${result.error || 'Không thể tải đơn hàng'}</p>
                    </div>
                `;
            }
            
        } catch (error) {
            ordersTable.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Lỗi kết nối: ${error.message}</p>
                </div>
            `;
        }
    }
    
    // =================== RENDER FUNCTIONS ===================
    
    function renderOrders(orders) {
        const ordersTable = document.getElementById('ordersTable');
        
        if (!orders || orders.length === 0) {
            ordersTable.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Chưa có đơn hàng nào</p>
                </div>
            `;
            return;
        }
        
        const filteredOrders = filterOrdersByStatus(orders);
        
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Sản phẩm</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Thời gian</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        filteredOrders.forEach(order => {
            const statusClass = `status-${order.status || 'pending'}`;
            const statusText = getStatusText(order.status);
            
            // Tính tổng số lượng sản phẩm
            const totalItems = order.itemCount || 0;
            
            tableHTML += `
                <tr>
                    <td><strong>${order.id || ''}</strong></td>
                    <td>
                        <div style="font-weight: 600;">${order.customerName || 'N/A'}</div>
                        <div style="font-size: 0.85rem; color: #666;">
                            ${order.customerPhone || ''}
                        </div>
                    </td>
                    <td>
                        <div>${totalItems} sản phẩm</div>
                        <div style="font-size: 0.85rem; color: #666;">
                            ${order.items ? 'Click xem chi tiết' : 'Không có thông tin'}
                        </div>
                    </td>
                    <td style="font-weight: 600; color: var(--primary);">
                        ${formatPrice(order.totalAmount || 0)}
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <div>${formatDate(order.createdAt)}</div>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="btn btn-sm btn-primary" onclick="adminViewOrderDetails('${order.id}')" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${order.status === 'pending' ? `
                                <button class="btn btn-sm btn-success" onclick="adminUpdateOrderStatus('${order.id}', 'processing')" title="Xử lý">
                                    <i class="fas fa-play"></i>
                                </button>
                            ` : ''}
                            ${order.status === 'processing' ? `
                                <button class="btn btn-sm btn-warning" onclick="adminUpdateOrderStatus('${order.id}', 'shipped')" title="Đang giao">
                                    <i class="fas fa-shipping-fast"></i>
                                </button>
                            ` : ''}
                            ${order.status === 'shipped' ? `
                                <button class="btn btn-sm btn-success" onclick="adminUpdateOrderStatus('${order.id}', 'delivered')" title="Đã giao">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-danger" onclick="adminUpdateOrderStatus('${order.id}', 'cancelled')" title="Hủy đơn">
                                <i class="fas fa-times"></i>
                            </button>
                            <button class="btn btn-sm btn-dark" onclick="adminDeleteOrder('${order.id}')" title="Xóa đơn">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        ordersTable.innerHTML = tableHTML;
    }
    
    function filterOrdersByStatus(orders) {
        const filter = document.getElementById('statusFilter').value;
        if (!filter) return orders;
        return orders.filter(order => order.status === filter);
    }
    
    function filterOrders() {
        loadOrders();
    }
    
    // =================== ORDER ACTIONS ===================
    
    async function adminViewOrderDetails(orderId) {
        try {
            showAlert('Đang tải chi tiết đơn hàng...', 'info');
            
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
                headers: {
                    'X-API-Key': adminKey
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Lưu order vào global để sử dụng cho export
                currentOrder = result.data;
                
                // Hiển thị chi tiết
                showOrderDetails(result.data);
            } else {
                showAlert('Lỗi: ' + (result.error || 'Không thể tải chi tiết'), 'error');
            }
            
        } catch (error) {
            console.error('View order details error:', error);
            showAlert('Lỗi: ' + error.message, 'error');
            
            // Fallback: thử tìm trong danh sách orders
            try {
                const allOrdersResponse = await fetch(`${API_BASE_URL}/admin/orders`, {
                    headers: { 'X-API-Key': adminKey }
                });
                
                if (allOrdersResponse.ok) {
                    const allOrdersResult = await allOrdersResponse.json();
                    if (allOrdersResult.success) {
                        const order = allOrdersResult.data.find(o => o.id === orderId);
                        if (order) {
                            currentOrder = order;
                            showOrderDetails(order);
                            return;
                        }
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        }
    }
    
    async function showOrderDetails(order) {
        const modal = document.getElementById('orderModal');
        const details = document.getElementById('orderDetails');
        
        // Hiển thị loading
        details.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="loader"></div>
                <p>Đang tải chi tiết đơn hàng...</p>
            </div>
        `;
        
        modal.classList.add('active');
        
        try {
            // Làm giàu thông tin sản phẩm
            const enrichedItems = [];
            
            if (order.items && order.items.length > 0) {
                // Sử dụng Promise.all để load song song
                const productPromises = order.items.map(async (item) => {
                    const productId = item.id || item.productId || '';
                    const productInfo = productsCache[productId] || {};
                    
                    return {
                        ...item,
                        id: productId,
                        fullName: productInfo.name || item.name || `Sản phẩm ${productId}`,
                        category: productInfo.category || item.category || 'Không xác định',
                        description: productInfo.description || '',
                        image: productInfo.image || item.image || '',
                        price: item.price || productInfo.price || 0,
                        quantity: item.quantity || 1,
                        productUrl: getProductUrl(productId)
                    };
                });
                
                enrichedItems.push(...await Promise.all(productPromises));
            }
            
            // Tính tổng số lượng
            const totalQuantity = enrichedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            
            // Tạo HTML cho sản phẩm
            let itemsHTML = '';
            
            if (enrichedItems.length > 0) {
                enrichedItems.forEach((item, index) => {
                    const itemTotal = (item.price || 0) * (item.quantity || 0);
                    
                    itemsHTML += `
                        <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee; background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                            <!-- Product Image -->
                            <div style="width: 60px; height: 60px; margin-right: 15px; border-radius: 8px; overflow: hidden; background: #f0f0f0; cursor: pointer;" 
                                 onclick="openProductPage('${item.id}', '${item.fullName.replace(/'/g, "\\'")}')">
                                ${item.image ? 
                                    `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.fullName}">` : 
                                    `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999; background: #e9ecef;">
                                        <i class="fas fa-image"></i>
                                    </div>`
                                }
                            </div>
                            
                            <!-- Product Info -->
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--primary); margin-bottom: 5px; cursor: pointer;" 
                                     onclick="openProductPage('${item.id}', '${item.fullName.replace(/'/g, "\\'")}')">
                                    ${item.fullName}
                                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem; margin-left: 5px; color: #666;"></i>
                                </div>
                                
                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 3px;">
                                    <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; margin-right: 5px; font-family: monospace;">
                                        Mã: ${item.id}
                                    </span>
                                    <span style="background: #d4edda; padding: 2px 6px; border-radius: 4px; margin-right: 5px;">
                                        ${item.category}
                                    </span>
                                    ${item.color ? `<span style="background: #cce5ff; padding: 2px 6px; border-radius: 4px; margin-right: 5px;">Màu: ${item.color}</span>` : ''}
                                    ${item.size ? `<span style="background: #f8d7da; padding: 2px 6px; border-radius: 4px;">Size: ${item.size}</span>` : ''}
                                </div>
                                
                                ${item.description ? `
                                    <div style="font-size: 0.85rem; color: #888; margin-top: 3px; font-style: italic;">
                                        <i class="fas fa-info-circle"></i> ${item.description.substring(0, 80)}${item.description.length > 80 ? '...' : ''}
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- Quantity -->
                            <div style="width: 100px; text-align: center;">
                                <div style="font-weight: 600; background: var(--primary); color: white; padding: 6px 10px; border-radius: 6px; display: inline-block;">
                                    ${item.quantity || 1} cái
                                </div>
                            </div>
                            
                            <!-- Price -->
                            <div style="width: 180px; text-align: right;">
                                <div style="color: #666; font-size: 0.9rem;">
                                    ${formatPrice(item.price || 0)}/cái
                                </div>
                                <div style="font-weight: 700; color: var(--primary); font-size: 1.1rem; margin-top: 5px;">
                                    ${formatPrice(itemTotal)}
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                itemsHTML = `
                    <div style="padding: 40px; text-align: center; color: #666;">
                        <i class="fas fa-box-open" style="font-size: 2.5rem; margin-bottom: 15px; opacity: 0.5;"></i>
                        <p>Không có thông tin sản phẩm chi tiết</p>
                        <button onclick="window.open('index.html', '_blank')" 
                                style="margin-top: 15px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                            <i class="fas fa-external-link-alt"></i> Xem danh sách sản phẩm
                        </button>
                    </div>
                `;
            }
            
            // Tạo HTML hoàn chỉnh
            const fullHTML = `
                <!-- Header -->
                <div style="margin-bottom: 25px;">
                    <h2 style="color: var(--primary); display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <i class="fas fa-receipt"></i> Đơn hàng: ${order.id}
                        <span class="status-badge status-${order.status}" style="font-size: 0.9rem; margin-left: 10px;">
                            ${getStatusText(order.status)}
                        </span>
                    </h2>
                    
                    <div style="display: flex; gap: 15px; font-size: 0.9rem; color: #666; flex-wrap: wrap;">
                        <div><i class="fas fa-calendar-plus"></i> ${formatDate(order.createdAt)}</div>
                        <div><i class="fas fa-user"></i> ${order.customer?.name || order.customerName || 'Khách hàng'}</div>
                        <div><i class="fas fa-phone"></i> ${order.customer?.phone || order.customerPhone || 'N/A'}</div>
                        <div><i class="fas fa-money-bill-wave"></i> ${formatPrice(order.totalAmount || 0)}</div>
                    </div>
                </div>
                
                <!-- Customer and Order Info Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <!-- Customer Info -->
                    <div>
                        <h3 style="color: var(--primary); margin-bottom: 12px; font-size: 1.1rem;">
                            <i class="fas fa-user-circle"></i> Thông tin khách hàng
                        </h3>
                        <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 18px; border-radius: 10px; border-left: 4px solid var(--primary);">
                            <p style="margin-bottom: 10px;">
                                <strong><i class="fas fa-user"></i> Họ tên:</strong> 
                                ${order.customer?.name || order.customerName || 'N/A'}
                            </p>
                            <p style="margin-bottom: 10px;">
                                <strong><i class="fas fa-phone"></i> Điện thoại:</strong> 
                                ${order.customer?.phone || order.customerPhone || 'N/A'}
                            </p>
                            <p style="margin-bottom: 10px;">
                                <strong><i class="fas fa-envelope"></i> Email:</strong> 
                                ${order.customer?.email || 'N/A'}
                            </p>
                            <p style="margin-bottom: 10px;">
                                <strong><i class="fas fa-map-marker-alt"></i> Địa chỉ:</strong> 
                                ${order.customer?.address || 'N/A'}
                            </p>
                            ${order.customer?.notes ? `
                                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd;">
                                    <strong><i class="fas fa-sticky-note"></i> Ghi chú:</strong><br>
                                    <span style="font-style: italic; color: #666;">${order.customer.notes}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Order Info -->
                    <div>
                        <h3 style="color: var(--primary); margin-bottom: 12px; font-size: 1.1rem;">
                            <i class="fas fa-info-circle"></i> Thông tin đơn hàng
                        </h3>
                        <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 18px; border-radius: 10px; border-left: 4px solid var(--primary);">
                            <p style="margin-bottom: 10px;">
                                <strong><i class="fas fa-hashtag"></i> Mã đơn:</strong> 
                                <code style="background: #e9ecef; padding: 3px 8px; border-radius: 4px; font-family: monospace;">${order.id}</code>
                            </p>
                            <p style="margin-bottom: 10px;">
                                <strong><i class="fas fa-credit-card"></i> Thanh toán:</strong> 
                                <span style="background: ${order.paymentMethod === 'cod' ? '#d4edda' : '#cce5ff'}; 
                                      color: ${order.paymentMethod === 'cod' ? '#155724' : '#004085'}; 
                                      padding: 4px 10px; border-radius: 20px; margin-left: 8px; font-size: 0.9rem;">
                                    ${order.paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận)' : 
                                      order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
                                </span>
                            </p>
                            <p style="margin-bottom: 10px;">
                                <strong><i class="fas fa-truck"></i> Vận chuyển:</strong> 
                                <span style="color: #666;">Giao hàng tiêu chuẩn</span>
                            </p>
                            <p>
                                <strong><i class="fas fa-calendar-check"></i> Cập nhật:</strong> 
                                ${formatDate(order.updatedAt || order.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Products Section -->
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-shopping-cart"></i> Sản phẩm đã đặt
                            <span style="background: var(--primary); color: white; padding: 3px 12px; border-radius: 20px; font-size: 0.9rem;">
                                ${enrichedItems.length} sản phẩm • ${totalQuantity} cái
                            </span>
                        </h3>
                        
                        <div>
                            <button onclick="window.open('index.html', '_blank')" 
                                    style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-right: 10px;">
                                <i class="fas fa-store"></i> Xem cửa hàng
                            </button>
                            <button onclick="exportOrderToCSV('${order.id}')" 
                                    style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                                <i class="fas fa-file-export"></i> Xuất CSV
                            </button>
                        </div>
                    </div>
                    
                    <!-- Products Table -->
                    <div style="background: white; border-radius: 10px; overflow: hidden; border: 1px solid #dee2e6; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                        <!-- Table Header -->
                        <div style="display: flex; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); font-weight: 600; border-bottom: 2px solid var(--primary);">
                            <div style="flex: 1; color: var(--primary);">
                                <i class="fas fa-box"></i> Sản phẩm (Click để xem chi tiết)
                            </div>
                            <div style="width: 100px; text-align: center; color: var(--primary);">
                                <i class="fas fa-layer-group"></i> Số lượng
                            </div>
                            <div style="width: 180px; text-align: right; color: var(--primary);">
                                <i class="fas fa-money-bill-wave"></i> Thành tiền
                            </div>
                        </div>
                        
                        <!-- Products List -->
                        <div style="max-height: 400px; overflow-y: auto;">
                            ${itemsHTML}
                        </div>
                        
                        <!-- Total -->
                        <div style="display: flex; justify-content: space-between; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-top: 2px solid #dee2e6;">
                            <div style="font-size: 1.2rem; font-weight: 700;">
                                <i class="fas fa-calculator"></i> Tổng đơn hàng:
                            </div>
                            <div style="font-size: 1.6rem; color: var(--primary); font-weight: 800;">
                                ${formatPrice(order.totalAmount || 0)}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${order.notes ? `
                <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-sticky-note"></i> Ghi chú đơn hàng
                    </h4>
                    <p style="color: #856404; margin: 0;">${order.notes}</p>
                </div>
                ` : ''}
                
                <!-- Action Buttons -->
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                    <button class="btn btn-primary" onclick="printOrderDetails('${order.id}')" style="margin-right: 10px;">
                        <i class="fas fa-print"></i> In đơn hàng
                    </button>
                    <button class="btn btn-warning" onclick="window.open('index.html', '_blank')" style="margin-right: 10px;">
                        <i class="fas fa-external-link-alt"></i> Mở cửa hàng
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            `;
            
            details.innerHTML = fullHTML;
            
        } catch (error) {
            console.error('Error showing order details:', error);
            details.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <h3>Lỗi tải chi tiết đơn hàng</h3>
                    <p>${error.message}</p>
                    <button onclick="closeModal()" style="margin-top: 20px; padding: 10px 20px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Đóng
                    </button>
                </div>
            `;
        }
    }
    
    // Hàm in đơn hàng
    function printOrderDetails(orderId) {
        try {
            const order = currentOrder || {};
            const printWindow = window.open('', '_blank');
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Đơn hàng ${orderId} - Velora Fashion</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                                padding: 30px;
                                background: #f8f9fa;
                                color: #333;
                                line-height: 1.6;
                            }
                            .print-container {
                                max-width: 800px;
                                margin: 0 auto;
                                background: white;
                                padding: 40px;
                                border-radius: 12px;
                                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                            }
                            .header { 
                                text-align: center; 
                                margin-bottom: 40px;
                                padding-bottom: 20px;
                                border-bottom: 2px solid #8B7355;
                            }
                            .header h1 { 
                                color: #8B7355; 
                                font-size: 2.2rem;
                                margin-bottom: 10px;
                                font-weight: 700;
                            }
                            .header .order-info {
                                display: flex;
                                justify-content: center;
                                gap: 20px;
                                margin-top: 15px;
                                font-size: 0.95rem;
                                color: #666;
                            }
                            .section { 
                                margin-bottom: 30px; 
                            }
                            .section-title { 
                                color: #8B7355; 
                                border-bottom: 2px solid #8B7355; 
                                padding-bottom: 8px; 
                                margin-bottom: 15px;
                                font-size: 1.2rem;
                                font-weight: 600;
                            }
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin: 20px 0;
                                font-size: 0.9rem;
                            }
                            th { 
                                background: #8B7355; 
                                color: white; 
                                padding: 12px 15px; 
                                text-align: left; 
                                font-weight: 600;
                            }
                            td { 
                                padding: 12px 15px; 
                                border-bottom: 1px solid #e0e0e0; 
                                vertical-align: top;
                            }
                            tr:nth-child(even) {
                                background: #f9f9f9;
                            }
                            .price-cell {
                                text-align: right;
                                font-weight: 600;
                            }
                            .total-row { 
                                font-weight: bold; 
                                font-size: 1.1rem;
                                background: #f0f7ff;
                            }
                            .total-row td {
                                padding: 15px;
                                border-top: 2px solid #8B7355;
                            }
                            .footer { 
                                margin-top: 40px; 
                                text-align: center; 
                                color: #666; 
                                font-size: 0.9rem;
                                padding-top: 20px;
                                border-top: 1px solid #ddd;
                            }
                            .info-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 20px;
                                margin: 20px 0;
                            }
                            .info-card {
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 8px;
                                border-left: 4px solid #8B7355;
                            }
                            .status-badge {
                                display: inline-block;
                                padding: 5px 12px;
                                border-radius: 20px;
                                font-size: 0.85rem;
                                font-weight: 600;
                                text-transform: uppercase;
                            }
                            .status-pending { background: #fff3cd; color: #856404; }
                            .status-processing { background: #cce5ff; color: #004085; }
                            .status-shipped { background: #d4edda; color: #155724; }
                            .status-delivered { background: #d1ecf1; color: #0c5460; }
                            .status-cancelled { background: #f8d7da; color: #721c24; }
                            @media print {
                                body { padding: 0; background: white; }
                                .print-container { 
                                    box-shadow: none; 
                                    padding: 20px;
                                }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            <div class="header">
                                <h1>VELORA FASHION</h1>
                                <p>Hóa đơn đơn hàng</p>
                                <div class="order-info">
                                    <div><strong>Mã đơn:</strong> ${orderId}</div>
                                    <div><strong>Ngày:</strong> ${formatDate(order.createdAt || new Date().toISOString())}</div>
                                    <div><strong>Trạng thái:</strong> <span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span></div>
                                </div>
                            </div>
                            
                            <div class="info-grid">
                                <div class="info-card">
                                    <h3 class="section-title" style="font-size: 1rem; margin-bottom: 10px;">Thông tin khách hàng</h3>
                                    <p><strong>Tên:</strong> ${order.customer?.name || order.customerName || 'N/A'}</p>
                                    <p><strong>Điện thoại:</strong> ${order.customer?.phone || order.customerPhone || 'N/A'}</p>
                                    <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
                                    <p><strong>Địa chỉ:</strong> ${order.customer?.address || 'N/A'}</p>
                                </div>
                                
                                <div class="info-card">
                                    <h3 class="section-title" style="font-size: 1rem; margin-bottom: 10px;">Thông tin đơn hàng</h3>
                                    <p><strong>Mã đơn:</strong> ${orderId}</p>
                                    <p><strong>Thanh toán:</strong> ${order.paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận)' : 'Chuyển khoản'}</p>
                                    <p><strong>Ngày đặt:</strong> ${formatDate(order.createdAt || new Date().toISOString())}</p>
                                </div>
                            </div>
                            
                            <div class="section">
                                <h3 class="section-title">Sản phẩm đã đặt</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Sản phẩm</th>
                                            <th>Số lượng</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
            `);
            
            // Add products
            if (order.items && order.items.length > 0) {
                order.items.forEach((item, index) => {
                    const itemTotal = (item.price || 0) * (item.quantity || 0);
                    printWindow.document.write(`
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name || `Sản phẩm ${item.id}`}</td>
                            <td>${item.quantity || 1}</td>
                            <td>${formatPrice(item.price || 0)}</td>
                            <td class="price-cell">${formatPrice(itemTotal)}</td>
                        </tr>
                    `);
                });
            } else {
                printWindow.document.write(`
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 30px; color: #666;">
                            Không có thông tin sản phẩm
                        </td>
                    </tr>
                `);
            }
            
            // Add total
            printWindow.document.write(`
                                        <tr class="total-row">
                                            <td colspan="4" style="text-align: right;"><strong>TỔNG CỘNG:</strong></td>
                                            <td class="price-cell"><strong>${formatPrice(order.totalAmount || 0)}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            ${order.notes ? `
                            <div class="section">
                                <h3 class="section-title">Ghi chú</h3>
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                    <p>${order.notes}</p>
                                </div>
                            </div>
                            ` : ''}
                            
                            <div class="footer">
                                <p><strong>Cảm ơn quý khách đã mua hàng tại Velora Fashion!</strong></p>
                                <p>Hotline: (028) 1234 5678 | Email: info@velora.com</p>
                                <p>Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                                <p style="margin-top: 15px; font-size: 0.8rem; color: #999;">
                                    Hóa đơn được tạo tự động từ hệ thống Velora Fashion
                                </p>
                            </div>
                            
                            <div class="no-print" style="margin-top: 30px; text-align: center;">
                                <button onclick="window.print()" style="padding: 10px 25px; background: #8B7355; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; margin-right: 10px;">
                                    <i class="fas fa-print"></i> In hóa đơn
                                </button>
                                <button onclick="window.close()" style="padding: 10px 25px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                                    <i class="fas fa-times"></i> Đóng
                                </button>
                            </div>
                        </div>
                        <script>
                            // Auto focus print dialog
                            setTimeout(() => {
                                window.focus();
                            }, 500);
                        </script>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            
        } catch (error) {
            console.error('Print error:', error);
            showAlert('Lỗi khi in đơn hàng: ' + error.message, 'error');
        }
    }
    
    async function adminUpdateOrderStatus(orderId, newStatus) {
        if (!confirm(`Xác nhận chuyển trạng thái đơn hàng ${orderId} sang "${getStatusText(newStatus)}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': adminKey
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.ok) throw new Error('Không thể cập nhật trạng thái');
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('Cập nhật trạng thái thành công!', 'success');
                loadData();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
            
        } catch (error) {
            showAlert('Lỗi: ' + error.message, 'error');
        }
    }
    
    // =================== DELETE ORDER ===================
    
    async function adminDeleteOrder(orderId) {
        if (!confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn hàng ${orderId}?\n\nHành động này sẽ:\n• Xóa đơn hàng khỏi hệ thống\n• Không thể khôi phục\n• Ảnh hưởng đến thống kê\n\nChỉ xóa nếu đây là đơn hàng test hoặc sai sót.`)) {
            return;
        }
        
        try {
            showAlert('Đang xóa đơn hàng...', 'info');
            
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'X-API-Key': adminKey,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404 || response.status === 405) {
                    showAlert('Tính năng xóa đang được phát triển. Vui lòng đánh dấu "đã hủy" thay vì xóa.', 'warning');
                    return;
                }
                throw new Error('Không thể xóa đơn hàng');
            }
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('✅ Đã xóa đơn hàng thành công!', 'success');
                loadData();
            } else {
                showAlert('❌ Lỗi: ' + result.error, 'error');
            }
            
        } catch (error) {
            console.error('Delete error:', error);
            showAlert('⚠️ Lỗi: ' + error.message, 'error');
        }
    }
    
    function closeModal() {
        document.getElementById('orderModal').classList.remove('active');
    }
    
    // =================== EXPORT FUNCTIONS ===================
    
    function exportOrderToCSV(orderId) {
        try {
            const order = currentOrder || {};
            const customer = order.customer || {};
            const items = order.items || [];
            
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "VELORA FASHION - CHI TIẾT ĐƠN HÀNG\n";
            csvContent += `Mã đơn hàng:,${orderId}\n`;
            csvContent += `Ngày đặt:,${formatDate(order.createdAt)}\n`;
            csvContent += `Trạng thái:,${getStatusText(order.status)}\n`;
            csvContent += `Phương thức thanh toán:,${order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}\n\n`;
            
            csvContent += "THÔNG TIN KHÁCH HÀNG\n";
            csvContent += `Họ tên:,${customer.name || ''}\n`;
            csvContent += `Điện thoại:,${customer.phone || ''}\n`;
            csvContent += `Email:,${customer.email || ''}\n`;
            csvContent += `Địa chỉ:,${customer.address || ''}\n`;
            csvContent += `Ghi chú:,${customer.notes || ''}\n\n`;
            
            csvContent += "CHI TIẾT SẢN PHẨM\n";
            csvContent += "STT,Mã sản phẩm,Tên sản phẩm,Danh mục,Số lượng,Đơn giá (VND),Thành tiền (VND)\n";
            
            let totalAmount = 0;
            items.forEach((item, index) => {
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                totalAmount += itemTotal;
                
                csvContent += `${index + 1},${item.id || ''},"${item.name || ''}",${item.category || ''},${item.quantity || 1},${item.price || 0},${itemTotal}\n`;
            });
            
            csvContent += `\nTỔNG CỘNG,,,,,,${totalAmount}\n`;
            csvContent += `\nNgày xuất:,${new Date().toLocaleDateString('vi-VN')}\n`;
            csvContent += `Xuất bởi:,Hệ thống quản trị Velora Fashion\n`;
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `don-hang-${orderId}-${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showAlert(`Đã xuất đơn hàng ${orderId} thành CSV`, 'success');
            
        } catch (error) {
            console.error('Export CSV error:', error);
            showAlert('Lỗi xuất CSV: ' + error.message, 'error');
        }
    }
    
    // =================== AUTO REFRESH ===================
    
    function startAutoRefresh() {
        if (refreshInterval) clearInterval(refreshInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        
        let countdown = 30;
        const countdownElement = document.getElementById('countdown');
        
        countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                loadData();
                countdown = 30;
            }
        }, 1000);
        
        refreshInterval = setInterval(() => {
            loadData();
        }, 30000); // 30 seconds
    }
    
    function resetCountdown() {
        const countdownElement = document.getElementById('countdown');
        countdownElement.textContent = 30;
    }
    
    // =================== INITIALIZATION ===================
    
    function init() {
        // Load saved admin key
        const savedKey = localStorage.getItem('velora_admin_key');
        if (savedKey) {
            document.getElementById('adminKey').value = savedKey;
            adminKey = savedKey;
            connectAdmin();
        }
        
        // Close modal on click outside
        document.getElementById('orderModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Initialize products cache if already connected
        if (adminKey) {
            setTimeout(() => {
                initializeProductsCache();
            }, 1000);
        }
        
        console.log('✅ Admin script loaded successfully');
    }
    
    // Start initialization
    init();
    
    // =================== EXPOSE FUNCTIONS TO GLOBAL SCOPE ===================
    
    // Expose functions for use in HTML onclick
    window.connectAdmin = connectAdmin;
    window.loadData = loadData;
    window.filterOrders = filterOrders;
    window.adminViewOrderDetails = adminViewOrderDetails;
    window.adminUpdateOrderStatus = adminUpdateOrderStatus;
    window.adminDeleteOrder = adminDeleteOrder;
    window.printOrderDetails = printOrderDetails;
    window.closeModal = closeModal;
    window.openProductPage = openProductPage;
    window.exportOrderToCSV = exportOrderToCSV;
    window.exportData = function() {
        showAlert('Tính năng xuất Excel đang được phát triển', 'info');
    };
});
