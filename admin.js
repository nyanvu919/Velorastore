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
                        <div>${order.itemCount || 0} sản phẩm</div>
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
                            <button class="btn btn-sm btn-primary" onclick="window.adminViewOrderDetails('${order.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${order.status === 'pending' ? `
                                <button class="btn btn-sm btn-success" onclick="window.adminUpdateOrderStatus('${order.id}', 'processing')">
                                    <i class="fas fa-play"></i>
                                </button>
                            ` : ''}
                            ${order.status === 'processing' ? `
                                <button class="btn btn-sm btn-warning" onclick="window.adminUpdateOrderStatus('${order.id}', 'shipped')">
                                    <i class="fas fa-shipping-fast"></i>
                                </button>
                            ` : ''}
                            ${order.status === 'shipped' ? `
                                <button class="btn btn-sm btn-success" onclick="window.adminUpdateOrderStatus('${order.id}', 'delivered')">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-danger" onclick="window.adminUpdateOrderStatus('${order.id}', 'cancelled')">
                                <i class="fas fa-times"></i>
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
            const response = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: {
                    'X-API-Key': adminKey
                }
            });
            
            if (!response.ok) throw new Error('Không thể lấy danh sách đơn hàng');
            
            const result = await response.json();
            
            if (result.success) {
                const order = result.data.find(o => o.id === orderId);
                if (order) {
                    showOrderDetails(order);
                }
            }
            
        } catch (error) {
            showAlert('Lỗi: ' + error.message, 'error');
        }
    }
    
    function showOrderDetails(order) {
        const modal = document.getElementById('orderModal');
        const details = document.getElementById('orderDetails');
        
        details.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 15px;">
                        <i class="fas fa-user"></i> Thông tin khách hàng
                    </h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <p><strong>Tên:</strong> ${order.customerName || 'N/A'}</p>
                        <p><strong>SĐT:</strong> ${order.customerPhone || 'N/A'}</p>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 15px;">
                        <i class="fas fa-receipt"></i> Thông tin đơn hàng
                    </h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <p><strong>Mã đơn:</strong> ${order.id}</p>
                        <p><strong>Trạng thái:</strong> 
                            <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                        </p>
                        <p><strong>Tạo lúc:</strong> ${formatDate(order.createdAt)}</p>
                        <p><strong>Cập nhật:</strong> ${formatDate(order.updatedAt || order.createdAt)}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 style="color: var(--primary); margin-bottom: 15px;">
                    <i class="fas fa-boxes"></i> Sản phẩm (${order.itemCount || 0})
                </h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 2px solid #ddd; font-weight: 600;">
                        <div>Tổng số lượng</div>
                        <div>Tổng tiền</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 15px 10px; font-weight: 600; border-top: 2px solid var(--primary);">
                        <div>Tổng cộng:</div>
                        <div style="font-size: 1.2rem; color: var(--primary);">
                            ${formatPrice(order.totalAmount || 0)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
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
    
    function closeModal() {
        document.getElementById('orderModal').classList.remove('active');
    }
    // =================== DELETE ORDER ===================

async function adminDeleteOrder(orderId) {
    if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn hàng ${orderId}? Hành động này không thể hoàn tác!`)) {
        return;
    }
    
    try {
        // Lưu ý: Backend chưa có endpoint xóa, bạn cần thêm vào worker
        // Tạm thời dùng alert cho đến khi thêm backend
        showAlert('Tính năng xóa đang được phát triển. Vui lòng đánh dấu "đã hủy" thay vì xóa.', 'warning');
        
        // Khi backend đã có endpoint, bạn có thể dùng code sau:
        /*
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'X-API-Key': adminKey
            }
        });
        
        if (!response.ok) throw new Error('Không thể xóa đơn hàng');
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Đã xóa đơn hàng thành công!', 'success');
            loadData(); // Refresh danh sách
        } else {
            showAlert('Lỗi: ' + result.error, 'error');
        }
        */
        
    } catch (error) {
        showAlert('Lỗi: ' + error.message, 'error');
    }
}

// Thêm vào phần expose functions
window.adminDeleteOrder = adminDeleteOrder;
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
    window.closeModal = closeModal;
});
