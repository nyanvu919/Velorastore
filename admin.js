// admin.js - Velora Fashion Admin Script
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_BASE_URL = 'https://velora-api.nyaochen9.workers.dev/api';
    let adminKey = '';
    let refreshInterval = null;
    let countdownInterval = null;
    
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
                            <button class="btn btn-sm btn-primary" onclick="window.adminViewOrderDetails('${order.id}')" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${order.status === 'pending' ? `
                                <button class="btn btn-sm btn-success" onclick="window.adminUpdateOrderStatus('${order.id}', 'processing')" title="Xử lý">
                                    <i class="fas fa-play"></i>
                                </button>
                            ` : ''}
                            ${order.status === 'processing' ? `
                                <button class="btn btn-sm btn-warning" onclick="window.adminUpdateOrderStatus('${order.id}', 'shipped')" title="Đang giao">
                                    <i class="fas fa-shipping-fast"></i>
                                </button>
                            ` : ''}
                            ${order.status === 'shipped' ? `
                                <button class="btn btn-sm btn-success" onclick="window.adminUpdateOrderStatus('${order.id}', 'delivered')" title="Đã giao">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-danger" onclick="window.adminUpdateOrderStatus('${order.id}', 'cancelled')" title="Hủy đơn">
                                <i class="fas fa-times"></i>
                            </button>
                            <button class="btn btn-sm btn-dark" onclick="window.adminDeleteOrder('${order.id}')" title="Xóa đơn">
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
                // Nếu endpoint chưa tồn tại, thử lấy từ danh sách
                if (response.status === 404) {
                    const allOrdersResponse = await fetch(`${API_BASE_URL}/admin/orders`, {
                        headers: { 'X-API-Key': adminKey }
                    });
                    
                    if (!allOrdersResponse.ok) throw new Error('Không thể lấy chi tiết đơn hàng');
                    
                    const allOrdersResult = await allOrdersResponse.json();
                    
                    if (allOrdersResult.success) {
                        const order = allOrdersResult.data.find(o => o.id === orderId);
                        if (order) {
                            showOrderDetails(order);
                            return;
                        }
                    }
                }
                throw new Error('Không thể lấy chi tiết đơn hàng');
            }
            
            const result = await response.json();
            
            if (result.success) {
                showOrderDetails(result.data);
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
            
        } catch (error) {
            showAlert('Lỗi: ' + error.message, 'error');
        }
    }
    
    function showOrderDetails(order) {
    const modal = document.getElementById('orderModal');
    const details = document.getElementById('orderDetails');
    
    // Kiểm tra và làm giàu thông tin sản phẩm từ cache
    const enrichedItems = (order.items || []).map(item => {
        const productInfo = productsCache[item.id] || {};
        return {
            ...item,
            fullName: productInfo.name || item.name,
            description: productInfo.description || '',
            image: productInfo.image || item.image,
            category: productInfo.category || item.category,
            url: productInfo.url || `#product-${item.id}`
        };
    });
    
    // Tạo HTML cho danh sách sản phẩm
    let itemsHTML = '';
    let totalQuantity = 0;
    
    if (enrichedItems.length > 0) {
        enrichedItems.forEach((item, index) => {
            totalQuantity += item.quantity || 0;
            const itemTotal = (item.price || 0) * (item.quantity || 0);
            const productLink = item.id ? `javascript:window.viewProductDetail('${item.id}')` : '#';
            
            itemsHTML += `
                <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee; background: ${index % 2 === 0 ? '#f9f9f9' : 'white'}">
                    <div style="width: 60px; height: 60px; margin-right: 15px; border-radius: 8px; overflow: hidden; background: #f0f0f0;">
                        ${item.image ? 
                            `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.fullName}">` : 
                            `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999;">
                                <i class="fas fa-image"></i>
                            </div>`
                        }
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--primary); margin-bottom: 5px; cursor: pointer;" 
                             onclick="window.viewProductDetail('${item.id}')">
                            ${item.fullName || 'Sản phẩm'}
                        </div>
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 3px;">
                            <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; margin-right: 5px;">
                                Mã: ${item.id || 'N/A'}
                            </span>
                            ${item.category ? `<span style="background: #d4edda; padding: 2px 6px; border-radius: 4px; margin-right: 5px;">${item.category}</span>` : ''}
                            ${item.size ? `<span style="background: #cce5ff; padding: 2px 6px; border-radius: 4px;">Size: ${item.size}</span>` : ''}
                        </div>
                        ${item.description ? `<div style="font-size: 0.85rem; color: #888; margin-top: 3px;">${item.description.substring(0, 50)}...</div>` : ''}
                    </div>
                    <div style="width: 120px; text-align: center;">
                        <div style="font-weight: 600; background: #e9ecef; padding: 6px 10px; border-radius: 6px; display: inline-block;">
                            ${item.quantity || 1} cái
                        </div>
                    </div>
                    <div style="width: 180px; text-align: right;">
                        <div style="color: #666; font-size: 0.9rem;">${formatPrice(item.price || 0)}/cái</div>
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
                <button onclick="window.location.href='index.html'" style="margin-top: 15px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-external-link-alt"></i> Xem danh sách sản phẩm
                </button>
            </div>
        `;
    }
    
    // Cập nhật nội dung modal
    details.innerHTML = `
        <!-- Header và thông tin cơ bản -->
        <div style="margin-bottom: 25px;">
            <h2 style="color: var(--primary); display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-receipt"></i> Đơn hàng: ${order.id}
                <span class="status-badge status-${order.status}" style="font-size: 0.9rem; margin-left: 10px;">
                    ${getStatusText(order.status)}
                </span>
            </h2>
            <div style="display: flex; gap: 15px; font-size: 0.9rem; color: #666; margin-top: 10px;">
                <div><i class="fas fa-calendar-plus"></i> ${formatDate(order.createdAt)}</div>
                <div><i class="fas fa-user"></i> ${order.customer?.name || order.customerName || 'Khách hàng'}</div>
                <div><i class="fas fa-phone"></i> ${order.customer?.phone || order.customerPhone || 'N/A'}</div>
            </div>
        </div>
        
        <!-- Grid 2 cột cho thông tin -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <!-- Thông tin khách hàng -->
            <div>
                <h3 style="color: var(--primary); margin-bottom: 12px; font-size: 1.1rem;">
                    <i class="fas fa-user-circle"></i> Thông tin khách hàng
                </h3>
                <div style="background: #f8f9fa; padding: 18px; border-radius: 10px; border-left: 4px solid var(--primary);">
                    <p><strong><i class="fas fa-user"></i> Họ tên:</strong> ${order.customer?.name || order.customerName || 'N/A'}</p>
                    <p><strong><i class="fas fa-phone"></i> Điện thoại:</strong> ${order.customer?.phone || order.customerPhone || 'N/A'}</p>
                    <p><strong><i class="fas fa-envelope"></i> Email:</strong> ${order.customer?.email || 'N/A'}</p>
                    <p><strong><i class="fas fa-map-marker-alt"></i> Địa chỉ:</strong> ${order.customer?.address || 'N/A'}</p>
                    ${order.customer?.notes ? `
                        <p style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd;">
                            <strong><i class="fas fa-sticky-note"></i> Ghi chú:</strong><br>
                            <span style="font-style: italic;">${order.customer.notes}</span>
                        </p>
                    ` : ''}
                </div>
            </div>
            
            <!-- Thông tin đơn hàng -->
            <div>
                <h3 style="color: var(--primary); margin-bottom: 12px; font-size: 1.1rem;">
                    <i class="fas fa-info-circle"></i> Thông tin đơn hàng
                </h3>
                <div style="background: #f8f9fa; padding: 18px; border-radius: 10px; border-left: 4px solid var(--primary);">
                    <p><strong><i class="fas fa-hashtag"></i> Mã đơn:</strong> <code>${order.id}</code></p>
                    <p><strong><i class="fas fa-credit-card"></i> Thanh toán:</strong> 
                        <span style="background: ${order.paymentMethod === 'cod' ? '#d4edda' : '#d1ecf1'}; 
                              color: ${order.paymentMethod === 'cod' ? '#155724' : '#0c5460'}; 
                              padding: 3px 8px; border-radius: 4px; margin-left: 8px;">
                            ${order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'Thẻ'}
                        </span>
                    </p>
                    <p><strong><i class="fas fa-truck"></i> Vận chuyển:</strong> Giao hàng tiêu chuẩn</p>
                    <p><strong><i class="fas fa-calendar-check"></i> Cập nhật:</strong> ${formatDate(order.updatedAt || order.createdAt)}</p>
                </div>
            </div>
        </div>
        
        <!-- Danh sách sản phẩm -->
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: var(--primary); font-size: 1.1rem;">
                    <i class="fas fa-shopping-cart"></i> Sản phẩm đã đặt
                    <span style="background: var(--primary); color: white; padding: 3px 10px; border-radius: 20px; font-size: 0.9rem; margin-left: 10px;">
                        ${enrichedItems.length} sản phẩm
                    </span>
                </h3>
                <button onclick="window.open('index.html', '_blank')" 
                        style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                    <i class="fas fa-external-link-alt"></i> Xem cửa hàng
                </button>
            </div>
            
            <div style="background: white; border-radius: 10px; overflow: hidden; border: 1px solid #dee2e6; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <!-- Header bảng -->
                <div style="display: flex; padding: 15px; background: #f8f9fa; font-weight: 600; border-bottom: 2px solid var(--primary);">
                    <div style="flex: 1;"><i class="fas fa-box"></i> Sản phẩm (Click để xem)</div>
                    <div style="width: 120px; text-align: center;"><i class="fas fa-layer-group"></i> Số lượng</div>
                    <div style="width: 180px; text-align: right;"><i class="fas fa-money-bill"></i> Thành tiền</div>
                </div>
                
                <!-- Danh sách sản phẩm -->
                <div style="max-height: 400px; overflow-y: auto;">
                    ${itemsHTML}
                </div>
                
                <!-- Tổng cộng -->
                <div style="display: flex; justify-content: space-between; padding: 20px; background: #f8f9fa; border-top: 2px solid #dee2e6;">
                    <div style="font-size: 1.1rem; font-weight: 600;">
                        <i class="fas fa-calculator"></i> Tổng cộng (${totalQuantity} sản phẩm):
                    </div>
                    <div style="font-size: 1.5rem; color: var(--primary); font-weight: 700;">
                        ${formatPrice(order.totalAmount || 0)}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer với nút hành động -->
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <button class="btn btn-primary" onclick="printOrderDetails('${order.id}')" style="margin-right: 10px;">
                <i class="fas fa-print"></i> In đơn hàng
            </button>
            <button class="btn btn-secondary" onclick="closeModal()">
                <i class="fas fa-times"></i> Đóng
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Thêm hàm viewProductDetail
window.viewProductDetail = function(productId) {
    // Tạo URL đến trang sản phẩm
    const productUrl = `index.html?product=${productId}`;
    
    // Mở trong tab mới
    window.open(productUrl, '_blank');
    
    // Hoặc hiển thị thông báo
    showAlert(`Đang mở chi tiết sản phẩm ${productId}...`, 'info');
};
    
    // Hàm in đơn hàng
    function printOrderDetails(orderId) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Đơn hàng ${orderId} - Velora Fashion</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #8B7355; }
                        .section { margin-bottom: 20px; }
                        .section-title { color: #8B7355; border-bottom: 2px solid #8B7355; padding-bottom: 5px; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th { background: #8B7355; color: white; padding: 10px; text-align: left; }
                        td { padding: 10px; border-bottom: 1px solid #ddd; }
                        .total { font-weight: bold; font-size: 1.2em; }
                        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 0.9em; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>VELORA FASHION</h1>
                        <p>Đơn hàng: <strong>${document.querySelector('#orderDetails .order-id')?.textContent || orderId}</strong></p>
                        <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div class="section">
                        <h3 class="section-title">Thông tin đơn hàng</h3>
                        ${document.querySelector('#orderDetails .order-info')?.innerHTML || ''}
                    </div>
                    <div class="section">
                        <h3 class="section-title">Sản phẩm đã đặt</h3>
                        ${document.querySelector('#orderDetails .order-items')?.innerHTML || ''}
                    </div>
                    <div class="footer">
                        <p>Cảm ơn quý khách đã mua hàng tại Velora Fashion!</p>
                        <p>Hotline: (028) 1234 5678 | Email: info@velora.com</p>
                    </div>
                    <div class="no-print" style="margin-top: 20px;">
                        <button onclick="window.print()">In trang</button>
                        <button onclick="window.close()">Đóng</button>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
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
            
            // Kiểm tra xem backend có hỗ trợ xóa không
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'X-API-Key': adminKey,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                // Nếu backend chưa hỗ trợ DELETE
                if (response.status === 404 || response.status === 405) {
                    showAlert('Tính năng xóa đang được phát triển. Vui lòng đánh dấu "đã hủy" thay vì xóa.', 'warning');
                    return;
                }
                throw new Error('Không thể xóa đơn hàng');
            }
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('✅ Đã xóa đơn hàng thành công!', 'success');
                loadData(); // Refresh danh sách
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
            // Thêm khởi tạo cache sản phẩm
    if (adminKey) {
        setTimeout(() => {
            initializeProductsCache();
        }, 1000);
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
        
        // Expose functions to global scope for inline onclick
        window.adminViewOrderDetails = adminViewOrderDetails;
        window.adminUpdateOrderStatus = adminUpdateOrderStatus;
        window.adminDeleteOrder = adminDeleteOrder;
        window.printOrderDetails = printOrderDetails;
        window.closeModal = closeModal;
        
        console.log('✅ Admin script loaded successfully');
    }
    
    // Start initialization
    init();
    
    // Expose functions for use in HTML onclick
    window.connectAdmin = connectAdmin;
    window.loadData = loadData;
    window.exportData = function() {
        showAlert('Tính năng xuất Excel đang được phát triển', 'info');
    };
    window.filterOrders = filterOrders;
});
// Thêm vào phần HELPER FUNCTIONS trong admin.js
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
    return [];
}

// Tạo mapping giữa product ID và thông tin chi tiết
let productsCache = {};

async function initializeProductsCache() {
    const products = await loadProducts();
    productsCache = {};
    products.forEach(product => {
        if (product.id) {
            productsCache[product.id] = product;
        }
    });
    console.log('Products cache initialized:', productsCache);
}
