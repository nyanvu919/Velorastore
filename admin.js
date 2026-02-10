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
        
        // Tạo HTML cho danh sách sản phẩm
        let itemsHTML = '';
        let totalQuantity = 0;
        
        if (order.items && order.items.length > 0) {
            order.items.forEach((item, index) => {
                totalQuantity += item.quantity || 0;
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                
                itemsHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #eee; align-items: center; background: ${index % 2 === 0 ? '#f9f9f9' : 'white'}">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--primary);">${item.name || 'Sản phẩm'}</div>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                                ${item.id ? `Mã: ${item.id}` : ''}
                                ${item.category ? ` • ${item.category}` : ''}
                            </div>
                        </div>
                        <div style="width: 100px; text-align: center;">
                            <div style="font-weight: 600; background: #e9ecef; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                                ${item.quantity || 1} cái
                            </div>
                        </div>
                        <div style="width: 180px; text-align: right;">
                            <div style="color: #666; font-size: 0.9rem;">${formatPrice(item.price || 0)}/cái</div>
                            <div style="font-weight: 600; color: var(--primary); font-size: 1.1rem; margin-top: 5px;">
                                ${formatPrice(itemTotal)}
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            itemsHTML = `
                <div style="padding: 30px; text-align: center; color: #666;">
                    <i class="fas fa-box-open" style="font-size: 2.5rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Không có thông tin sản phẩm</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Đơn hàng này không chứa thông tin sản phẩm chi tiết</p>
                </div>
            `;
        }
        
        details.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-user"></i> Thông tin khách hàng
                    </h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid var(--primary);">
                        <p style="margin-bottom: 10px;"><strong><i class="fas fa-user-tag"></i> Tên:</strong> ${order.customer?.name || order.customerName || 'N/A'}</p>
                        <p style="margin-bottom: 10px;"><strong><i class="fas fa-phone"></i> SĐT:</strong> ${order.customer?.phone || order.customerPhone || 'N/A'}</p>
                        <p style="margin-bottom: 10px;"><strong><i class="fas fa-envelope"></i> Email:</strong> ${order.customer?.email || 'N/A'}</p>
                        <p style="margin-bottom: 10px;"><strong><i class="fas fa-map-marker-alt"></i> Địa chỉ:</strong> ${order.customer?.address || 'N/A'}</p>
                        ${order.customer?.notes ? `
                            <p style="margin-bottom: 0; padding-top: 10px; border-top: 1px dashed #ddd;">
                                <strong><i class="fas fa-sticky-note"></i> Ghi chú khách hàng:</strong><br>
                                <span style="font-style: italic;">${order.customer.notes}</span>
                            </p>
                        ` : ''}
                    </div>
                </div>
                
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-receipt"></i> Thông tin đơn hàng
                    </h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid var(--primary);">
                        <p style="margin-bottom: 10px;"><strong><i class="fas fa-hashtag"></i> Mã đơn:</strong> <span style="background: #e9ecef; padding: 3px 8px; border-radius: 4px; font-family: monospace;">${order.id}</span></p>
                        <p style="margin-bottom: 10px;"><strong><i class="fas fa-info-circle"></i> Trạng thái:</strong> 
                            <span class="status-badge status-${order.status}" style="margin-left: 10px;">${getStatusText(order.status)}</span>
                        </p>
                        <p style="margin-bottom: 10px;"><strong><i class="fas fa-credit-card"></i> Thanh toán:</strong> 
                            <span style="background: ${order.paymentMethod === 'cod' ? '#d4edda' : '#d1ecf1'}; color: ${order.paymentMethod === 'cod' ? '#155724' : '#0c5460'}; padding: 3px 8px; border-radius: 4px;">
                                ${order.paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận hàng)' : 'Chuyển khoản'}
                            </span>
                        </p>
                        <p style="margin-bottom: 10px;"><strong><i class="fas fa-calendar-plus"></i> Tạo lúc:</strong> ${formatDate(order.createdAt)}</p>
                        <p style="margin-bottom: 0;"><strong><i class="fas fa-calendar-check"></i> Cập nhật:</strong> ${formatDate(order.updatedAt || order.createdAt)}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 style="color: var(--primary); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-boxes"></i> Sản phẩm đã đặt 
                    <span style="background: var(--primary); color: white; padding: 3px 10px; border-radius: 20px; font-size: 0.9rem;">
                        ${order.items?.length || 0} sản phẩm • ${totalQuantity} cái
                    </span>
                </h3>
                <div style="background: #f8f9fa; padding: 0; border-radius: 10px; overflow: hidden; border: 1px solid #dee2e6;">
                    <!-- Header bảng sản phẩm -->
                    <div style="display: flex; justify-content: space-between; padding: 15px; background: #e9ecef; font-weight: 600; border-bottom: 2px solid #ddd;">
                        <div style="flex: 1; font-size: 1rem;"><i class="fas fa-box"></i> Sản phẩm</div>
                        <div style="width: 100px; text-align: center; font-size: 1rem;"><i class="fas fa-layer-group"></i> Số lượng</div>
                        <div style="width: 180px; text-align: right; font-size: 1rem;"><i class="fas fa-money-bill-wave"></i> Thành tiền</div>
                    </div>
                    
                    <!-- Danh sách sản phẩm -->
                    <div style="max-height: 350px; overflow-y: auto;">
                        ${itemsHTML}
                    </div>
                    
                    <!-- Tổng cộng -->
                    <div style="display: flex; justify-content: space-between; padding: 20px 15px; font-weight: 600; border-top: 2px solid var(--primary); background: white; align-items: center;">
                        <div style="font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-calculator"></i> Tổng cộng:
                        </div>
                        <div style="font-size: 1.5rem; color: var(--primary); font-weight: 700;">
                            ${formatPrice(order.totalAmount || 0)}
                        </div>
                    </div>
                </div>
            </div>
            
            ${order.notes ? `
            <div style="margin-top: 25px;">
                <h3 style="color: var(--primary); margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-sticky-note"></i> Ghi chú đơn hàng
                </h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #FFC107;">
                    <div style="display: flex; gap: 10px;">
                        <i class="fas fa-quote-left" style="color: #FFC107; font-size: 1.2rem;"></i>
                        <div style="flex: 1; font-style: italic; color: #666;">
                            ${order.notes}
                        </div>
                        <i class="fas fa-quote-right" style="color: #FFC107; font-size: 1.2rem;"></i>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div style="margin-top: 25px; text-align: center; padding-top: 20px; border-top: 1px dashed #ddd;">
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
