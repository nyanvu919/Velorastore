// ====== ADMIN SCRIPT WITH API INTEGRATION ======
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initSidebarNavigation();
    initModals();
    initForms();
    initCharts();
    initImageUpload();
    initEditor();
    
    // Load admin data
    checkAdminAuth();
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        showConfirm('Bạn có chắc chắn muốn đăng xuất?', function() {
            localStorage.removeItem('admin_authenticated');
            localStorage.removeItem('admin_api_key');
            window.location.href = 'index.html';
        });
    });
});

// ====== ADMIN AUTHENTICATION ======
async function checkAdminAuth() {
    // Check if already authenticated
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    const savedApiKey = localStorage.getItem('admin_api_key');
    
    if (!isAuthenticated || !savedApiKey) {
        // Prompt for API key
        const apiKey = prompt('Vui lòng nhập API Key để truy cập trang quản trị:');
        
        if (!apiKey) {
            window.location.href = 'index.html';
            return;
        }
        
        // Test API key
        try {
            const response = await fetch('/api/admin/health', {
                method: 'GET',
                headers: {
                    'X-API-Key': apiKey
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.admin === true) {
                localStorage.setItem('admin_authenticated', 'true');
                localStorage.setItem('admin_api_key', apiKey);
                showToast('Xác thực thành công!');
                loadDashboardData();
            } else {
                alert('API Key không hợp lệ!');
                window.location.href = 'index.html';
            }
        } catch (error) {
            alert('Không thể kết nối đến server!');
            window.location.href = 'index.html';
        }
    } else {
        loadDashboardData();
    }
}

// ====== API FUNCTIONS ======
async function fetchAPI(endpoint, options = {}) {
    const apiKey = localStorage.getItem('admin_api_key');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
    };
    
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message || 'Không thể kết nối với server', 'error');
        throw error;
    }
}

// ====== DASHBOARD FUNCTIONS ======
async function loadDashboardData() {
    try {
        // Load stats
        const statsData = await fetchAPI('/api/admin/stats');
        updateDashboardStats(statsData.data);
        
        // Load recent orders
        const ordersData = await fetchAPI('/api/admin/orders?limit=5');
        updateRecentOrders(ordersData.data);
        
        // Load analytics for charts
        const analyticsData = await fetchAPI('/api/admin/analytics');
        updateCharts(analyticsData.data);
        
    } catch (error) {
        // Fallback to static data
        console.log('Using fallback data for dashboard');
        loadSampleDashboardData();
    }
}

function updateDashboardStats(stats) {
    const cards = document.querySelectorAll('.dashboard-cards .card');
    
    if (cards.length >= 4 && stats) {
        // Total products
        cards[0].querySelector('.card-value').textContent = stats.totalProducts || 0;
        cards[0].querySelector('.card-change').textContent = `${stats.activeProducts || 0} đang bán`;
        
        // New orders
        cards[1].querySelector('.card-value').textContent = stats.todayOrders || 0;
        const pendingOrders = stats.pendingOrders || 0;
        cards[1].querySelector('.card-change').textContent = `${pendingOrders} chờ xử lý`;
        if (pendingOrders > 0) {
            cards[1].querySelector('.card-change').classList.add('warning');
        }
        
        // Revenue
        const revenue = stats.todayRevenue || 0;
        cards[2].querySelector('.card-value').textContent = formatCurrency(revenue);
        cards[2].querySelector('.card-change').textContent = formatCurrency(stats.monthRevenue || 0) + ' tháng này';
        
        // Customers
        cards[3].querySelector('.card-value').textContent = stats.totalCustomers || 0;
        cards[3].querySelector('.card-change').textContent = `${stats.newCustomersToday || 0} mới hôm nay`;
        
        // Update additional stats if available
        updateAdditionalStats(stats);
    }
}

function updateAdditionalStats(stats) {
    // Update low stock warning
    if (stats.lowStockProducts > 0) {
        const lowStockElement = document.getElementById('low-stock-warning');
        if (lowStockElement) {
            lowStockElement.textContent = `${stats.lowStockProducts} sản phẩm sắp hết hàng`;
            lowStockElement.style.display = 'block';
        }
    }
    
    // Update out of stock warning
    if (stats.outOfStockProducts > 0) {
        const outOfStockElement = document.getElementById('out-of-stock-warning');
        if (outOfStockElement) {
            outOfStockElement.textContent = `${stats.outOfStockProducts} sản phẩm hết hàng`;
            outOfStockElement.style.display = 'block';
        }
    }
    
    // Update unread messages
    if (stats.unreadMessages > 0) {
        const messagesBadge = document.querySelector('[data-section="messages"] .notification-badge');
        if (messagesBadge) {
            messagesBadge.textContent = stats.unreadMessages;
            messagesBadge.style.display = 'inline-block';
        }
    }
}

function updateRecentOrders(orders) {
    const ordersBody = document.getElementById('recent-orders-body');
    
    if (ordersBody && orders && orders.length > 0) {
        ordersBody.innerHTML = '';
        
        // Take first 5 orders
        orders.slice(0, 5).forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderNumber || order.id}</td>
                <td>${order.customerName || 'Khách hàng'}</td>
                <td>${order.itemCount || 1} sản phẩm</td>
                <td>${formatCurrency(order.totalAmount)}</td>
                <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="viewOrderDetails('${order.id}')" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="editOrderStatus('${order.id}')" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            ordersBody.appendChild(row);
        });
    } else {
        ordersBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Chưa có đơn hàng nào</td>
            </tr>
        `;
    }
}

// ====== PRODUCTS MANAGEMENT ======
async function loadProducts() {
    try {
        const data = await fetchAPI('/api/admin/products');
        const productsBody = document.getElementById('products-table-body');
        
        if (productsBody && data.data) {
            productsBody.innerHTML = '';
            
            if (data.data.length === 0) {
                productsBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">Chưa có sản phẩm nào</td>
                    </tr>
                `;
                return;
            }
            
            data.data.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>
                        <div class="product-thumb" style="background-image: url('${product.image}')">
                            ${!product.image ? '<i class="fas fa-image"></i>' : ''}
                        </div>
                    </td>
                    <td>
                        <strong>${product.name}</strong>
                        <div class="product-description">${product.description.substring(0, 50)}...</div>
                    </td>
                    <td>${getCategoryText(product.category)}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>
                        ${product.stock}
                        ${product.stock <= 5 ? '<span class="stock-warning">⚠️</span>' : ''}
                    </td>
                    <td>
                        <span class="status-badge status-${getProductStockStatus(product.stock)}">
                            ${getProductStockStatusText(product.stock)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit-btn" onclick="editProduct('${product.id}')" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}', '${product.name}')" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                productsBody.appendChild(row);
            });
        }
    } catch (error) {
        console.log('Using fallback data for products');
        loadSampleProducts();
    }
}

async function submitProductForm(formData) {
    try {
        const response = await fetchAPI('/api/admin/products', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showToast('Sản phẩm đã được thêm thành công!');
        
        // Reset form
        document.getElementById('product-form').reset();
        document.getElementById('image-preview').innerHTML = '';
        
        // Reload products list
        setTimeout(() => {
            loadProducts();
            loadDashboardData(); // Refresh stats
        }, 1000);
        
        return response;
        
    } catch (error) {
        showToast('Lỗi khi thêm sản phẩm: ' + error.message, 'error');
        throw error;
    }
}

async function editProduct(productId) {
    try {
        // Get product details
        const productData = await fetchAPI(`/api/admin/products`);
        const product = productData.data.find(p => p.id === productId);
        
        if (!product) {
            showToast('Không tìm thấy sản phẩm', 'error');
            return;
        }
        
        // Show edit modal
        const modal = document.getElementById('editModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <form id="edit-product-form" class="admin-form">
                <div class="form-group">
                    <label for="edit-product-name">Tên sản phẩm *</label>
                    <input type="text" id="edit-product-name" value="${product.name}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-product-category">Danh mục *</label>
                        <select id="edit-product-category" required>
                            <option value="">Chọn danh mục</option>
                            <option value="dress" ${product.category === 'dress' ? 'selected' : ''}>Đầm/Váy</option>
                            <option value="shirt" ${product.category === 'shirt' ? 'selected' : ''}>Áo sơ mi</option>
                            <option value="pants" ${product.category === 'pants' ? 'selected' : ''}>Quần</option>
                            <option value="jacket" ${product.category === 'jacket' ? 'selected' : ''}>Áo khoác</option>
                            <option value="accessories" ${product.category === 'accessories' ? 'selected' : ''}>Phụ kiện</option>
                            <option value="evening" ${product.category === 'evening' ? 'selected' : ''}>Đầm dạ hội</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-price">Giá (VND) *</label>
                        <input type="number" id="edit-product-price" value="${product.price}" required min="0" step="1000">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-product-stock">Số lượng tồn kho</label>
                        <input type="number" id="edit-product-stock" value="${product.stock}" min="0">
                    </div>
                    <div class="form-group">
                        <label for="edit-product-featured">Sản phẩm nổi bật</label>
                        <select id="edit-product-featured">
                            <option value="false" ${!product.featured ? 'selected' : ''}>Không</option>
                            <option value="true" ${product.featured ? 'selected' : ''}>Có</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-product-image">URL hình ảnh</label>
                    <input type="text" id="edit-product-image" value="${product.image}" placeholder="srcimg/product-name.jpg">
                </div>
                
                <div class="form-group">
                    <label for="edit-product-description">Mô tả sản phẩm *</label>
                    <textarea id="edit-product-description" rows="4" required>${product.description}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-product-active">Trạng thái sản phẩm</label>
                    <select id="edit-product-active">
                        <option value="true" ${product.active !== false ? 'selected' : ''}>Đang bán</option>
                        <option value="false" ${product.active === false ? 'selected' : ''}>Ngừng bán</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-primary" onclick="updateProduct('${productId}')">
                        <i class="fas fa-save"></i> Cập nhật
                    </button>
                    <button type="button" class="btn btn-secondary close-modal">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </form>
        `;
        
        showModal('editModal');
        
    } catch (error) {
        showToast('Lỗi khi tải thông tin sản phẩm', 'error');
    }
}

async function updateProduct(productId) {
    try {
        const formData = {
            name: document.getElementById('edit-product-name').value,
            category: document.getElementById('edit-product-category').value,
            price: document.getElementById('edit-product-price').value,
            stock: document.getElementById('edit-product-stock').value,
            description: document.getElementById('edit-product-description').value,
            image: document.getElementById('edit-product-image').value,
            featured: document.getElementById('edit-product-featured').value === 'true',
            active: document.getElementById('edit-product-active').value === 'true'
        };
        
        const response = await fetchAPI(`/api/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showToast('Sản phẩm đã được cập nhật!');
        
        // Close modal
        closeModal('editModal');
        
        // Reload products
        loadProducts();
        loadDashboardData();
        
        return response;
        
    } catch (error) {
        showToast('Lỗi khi cập nhật sản phẩm: ' + error.message, 'error');
    }
}

async function deleteProduct(productId, productName) {
    showConfirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`, async () => {
        try {
            await fetchAPI(`/api/admin/products/${productId}`, {
                method: 'DELETE'
            });
            
            showToast('Sản phẩm đã được xóa!');
            
            // Reload products
            loadProducts();
            loadDashboardData();
            
        } catch (error) {
            showToast('Lỗi khi xóa sản phẩm: ' + error.message, 'error');
        }
    });
}

// ====== ORDERS MANAGEMENT ======
async function loadAllOrders() {
    try {
        const filter = document.getElementById('order-filter')?.value || 'all';
        const data = await fetchAPI('/api/admin/orders');
        const ordersBody = document.getElementById('orders-table-body');
        
        if (ordersBody && data.data) {
            ordersBody.innerHTML = '';
            
            const filteredOrders = filter === 'all' 
                ? data.data 
                : data.data.filter(order => order.status === filter);
            
            if (filteredOrders.length === 0) {
                ordersBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">Không có đơn hàng nào</td>
                    </tr>
                `;
                return;
            }
            
            filteredOrders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.orderNumber || order.id}</td>
                    <td>${formatDate(order.createdAt)}</td>
                    <td>
                        <strong>${order.customerName || 'Khách hàng'}</strong><br>
                        <small>${order.customerPhone || ''}</small>
                    </td>
                    <td>${order.itemCount || 1} sản phẩm</td>
                    <td>${formatCurrency(order.totalAmount)}</td>
                    <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewOrderDetails('${order.id}')" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="editOrderStatus('${order.id}')" title="Cập nhật trạng thái">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteOrder('${order.id}')" title="Xóa đơn hàng">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                ordersBody.appendChild(row);
            });
        }
    } catch (error) {
        console.log('Using fallback data for orders');
        loadSampleOrders();
    }
}

async function viewOrderDetails(orderId) {
    try {
        const data = await fetchAPI(`/api/admin/orders/${orderId}`);
        const order = data.data;
        
        // Show order details in modal
        const modal = document.getElementById('editModal');
        const modalBody = modal.querySelector('.modal-body');
        
        let itemsHtml = '';
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                itemsHtml += `
                    <div class="order-item">
                        <div>${item.name || 'Sản phẩm'} x ${item.quantity || 1}</div>
                        <div>${formatCurrency(item.price * (item.quantity || 1))}</div>
                    </div>
                `;
            });
        }
        
        modalBody.innerHTML = `
            <div class="order-details">
                <div class="detail-row">
                    <strong>Mã đơn hàng:</strong> ${order.orderNumber}
                </div>
                <div class="detail-row">
                    <strong>Ngày đặt:</strong> ${formatDate(order.createdAt)}
                </div>
                <div class="detail-row">
                    <strong>Khách hàng:</strong> ${order.customer?.name || order.customerName}<br>
                    <strong>Email:</strong> ${order.customer?.email || ''}<br>
                    <strong>Điện thoại:</strong> ${order.customer?.phone || ''}<br>
                    <strong>Địa chỉ:</strong> ${order.shippingAddress || order.customer?.address || ''}
                </div>
                <div class="detail-row">
                    <strong>Ghi chú:</strong> ${order.notes || 'Không có'}
                </div>
                <div class="detail-row">
                    <strong>Trạng thái:</strong> <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                </div>
                <div class="order-items">
                    <h4>Sản phẩm:</h4>
                    ${itemsHtml || '<p>Không có thông tin sản phẩm</p>'}
                </div>
                <div class="detail-row total-row">
                    <strong>Tổng cộng:</strong> ${formatCurrency(order.totalAmount)}
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary close-modal">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            </div>
        `;
        
        showModal('editModal');
        
    } catch (error) {
        showToast('Lỗi khi tải chi tiết đơn hàng', 'error');
    }
}

async function editOrderStatus(orderId) {
    try {
        const data = await fetchAPI(`/api/admin/orders/${orderId}`);
        const order = data.data;
        
        const modal = document.getElementById('editModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="order-status-edit">
                <h4>Cập nhật trạng thái đơn hàng</h4>
                <p>Mã đơn: ${order.orderNumber}</p>
                <p>Khách hàng: ${order.customer?.name || order.customerName}</p>
                
                <div class="form-group">
                    <label for="order-status-select">Trạng thái:</label>
                    <select id="order-status-select" class="full-width">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Đã giao hàng</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã nhận hàng</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-primary" onclick="saveOrderStatus('${orderId}')">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                    <button type="button" class="btn btn-secondary close-modal">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </div>
        `;
        
        showModal('editModal');
        
    } catch (error) {
        showToast('Lỗi khi tải thông tin đơn hàng', 'error');
    }
}

async function saveOrderStatus(orderId) {
    try {
        const status = document.getElementById('order-status-select').value;
        
        await updateOrderStatus(orderId, status);
        
        closeModal('editModal');
        
    } catch (error) {
        showToast('Lỗi khi cập nhật trạng thái', 'error');
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        await fetchAPI(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        showToast('Trạng thái đơn hàng đã được cập nhật!');
        
        // Reload orders
        loadAllOrders();
        loadDashboardData(); // Refresh dashboard stats
        
    } catch (error) {
        showToast('Lỗi khi cập nhật trạng thái: ' + error.message, 'error');
    }
}

async function deleteOrder(orderId) {
    showConfirm('Bạn có chắc chắn muốn xóa đơn hàng này?', async () => {
        try {
            await fetchAPI(`/api/admin/orders/${orderId}`, {
                method: 'DELETE'
            });
            
            showToast('Đơn hàng đã được xóa!');
            
            // Reload orders
            loadAllOrders();
            loadDashboardData(); // Refresh dashboard stats
            
        } catch (error) {
            showToast('Lỗi khi xóa đơn hàng: ' + error.message, 'error');
        }
    });
}

// ====== CUSTOMERS MANAGEMENT ======
async function loadCustomers() {
    try {
        const data = await fetchAPI('/api/admin/customers');
        const customersBody = document.getElementById('customers-table-body');
        
        if (customersBody && data.data) {
            customersBody.innerHTML = '';
            
            if (data.data.length === 0) {
                customersBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">Chưa có khách hàng nào</td>
                    </tr>
                `;
                return;
            }
            
            data.data.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.id || customer.email?.substring(0, 8)}</td>
                    <td>${customer.name || 'Khách hàng'}</td>
                    <td>${customer.email || 'Chưa có'}</td>
                    <td>${customer.phone || 'Chưa cập nhật'}</td>
                    <td>${customer.orderCount || 0}</td>
                    <td>${formatCurrency(customer.totalSpent || 0)}</td>
                    <td>${formatDate(customer.firstOrder)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewCustomerDetails('${customer.id}')" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                `;
                customersBody.appendChild(row);
            });
        }
    } catch (error) {
        console.log('Using fallback data for customers');
        loadSampleCustomers();
    }
}

async function viewCustomerDetails(customerId) {
    try {
        // Note: We don't have a specific endpoint for customer details
        // So we'll use the customer list and find the customer
        const data = await fetchAPI('/api/admin/customers');
        const customer = data.data.find(c => c.id === customerId);
        
        if (!customer) {
            showToast('Không tìm thấy thông tin khách hàng', 'error');
            return;
        }
        
        const modal = document.getElementById('editModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="customer-details">
                <h4>Thông tin khách hàng</h4>
                <div class="detail-row">
                    <strong>ID:</strong> ${customer.id}
                </div>
                <div class="detail-row">
                    <strong>Họ tên:</strong> ${customer.name}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${customer.email || 'Chưa có'}
                </div>
                <div class="detail-row">
                    <strong>Điện thoại:</strong> ${customer.phone || 'Chưa có'}
                </div>
                <div class="detail-row">
                    <strong>Số đơn hàng:</strong> ${customer.orderCount || 0}
                </div>
                <div class="detail-row">
                    <strong>Tổng chi tiêu:</strong> ${formatCurrency(customer.totalSpent || 0)}
                </div>
                <div class="detail-row">
                    <strong>Đơn hàng đầu tiên:</strong> ${formatDate(customer.firstOrder)}
                </div>
                <div class="detail-row">
                    <strong>Đơn hàng gần nhất:</strong> ${formatDate(customer.lastOrder)}
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary close-modal">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            </div>
        `;
        
        showModal('editModal');
        
    } catch (error) {
        showToast('Lỗi khi tải thông tin khách hàng', 'error');
    }
}

// ====== MESSAGES MANAGEMENT ======
async function loadMessages() {
    try {
        const data = await fetchAPI('/api/admin/messages');
        
        // If you have a messages section in your HTML, update it here
        console.log('Messages loaded:', data.data);
        
        // You can create a messages section similar to products/orders
        // For now, just log the data
        
    } catch (error) {
        console.log('Error loading messages:', error);
    }
}

// ====== CHART FUNCTIONS ======
let revenueChart = null;
let productsChart = null;

function initCharts() {
    // Charts will be created when data is loaded
}

function updateCharts(analyticsData) {
    if (!analyticsData) return;
    
    // Update revenue chart
    updateRevenueChart(analyticsData.monthlyRevenue);
    
    // Update products chart
    updateProductsChart(analyticsData.topProducts);
}

function updateRevenueChart(monthlyRevenue) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    const labels = monthlyRevenue.map(item => item.month);
    const revenues = monthlyRevenue.map(item => item.revenue);
    const orders = monthlyRevenue.map(item => item.orders);
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Doanh thu (VND)',
                    data: revenues,
                    borderColor: '#8B7355',
                    backgroundColor: 'rgba(139, 115, 85, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Số đơn hàng',
                    data: orders,
                    borderColor: '#E8D8C4',
                    backgroundColor: 'rgba(232, 216, 196, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Doanh thu (VND)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Số đơn hàng'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function updateProductsChart(topProducts) {
    const ctx = document.getElementById('productsChart');
    if (!ctx) return;
    
    if (productsChart) {
        productsChart.destroy();
    }
    
    const labels = topProducts.map(item => item.name);
    const revenues = topProducts.map(item => item.revenue);
    
    productsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: revenues,
                backgroundColor: [
                    '#8B7355',
                    '#A8927A',
                    '#C5B29A',
                    '#E8D8C4',
                    '#F5F0E6'
                ],
                borderColor: [
                    '#6B5A45',
                    '#8B7355',
                    '#A8927A',
                    '#C5B29A',
                    '#E8D8C4'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Doanh thu (VND)'
                    }
                }
            }
        }
    });
}

// ====== HELPER FUNCTIONS ======
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
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
        'shipped': 'Đã giao hàng',
        'delivered': 'Đã nhận hàng',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function getCategoryText(category) {
    const categoryMap = {
        'dress': 'Đầm/Váy',
        'shirt': 'Áo sơ mi',
        'pants': 'Quần',
        'jacket': 'Áo khoác',
        'accessories': 'Phụ kiện',
        'evening': 'Đầm dạ hội'
    };
    return categoryMap[category] || category;
}

function getProductStockStatus(stock) {
    if (stock === 0) return 'out';
    if (stock < 10) return 'low';
    return 'active';
}

function getProductStockStatusText(stock) {
    if (stock === 0) return 'Hết hàng';
    if (stock < 10) return 'Sắp hết';
    return 'Còn hàng';
}

// ====== SAMPLE DATA (FALLBACK) ======
function loadSampleDashboardData() {
    // This is fallback data if API fails
    const sampleStats = {
        totalProducts: 15,
        totalOrders: 28,
        totalRevenue: 152500000,
        pendingOrders: 5,
        todayOrders: 3,
        todayRevenue: 18500000,
        totalCustomers: 2458,
        newCustomersToday: 12
    };
    
    updateDashboardStats(sampleStats);
    
    // Sample recent orders
    const sampleOrders = [
        {
            id: 'ORD001',
            orderNumber: 'ORD001',
            customerName: 'Nguyễn Văn A',
            itemCount: 2,
            totalAmount: 1850000,
            status: 'pending',
            createdAt: new Date().toISOString()
        },
        {
            id: 'ORD002',
            orderNumber: 'ORD002',
            customerName: 'Trần Thị B',
            itemCount: 1,
            totalAmount: 850000,
            status: 'processing',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
    
    updateRecentOrders(sampleOrders);
}

function loadSampleProducts() {
    const productsBody = document.getElementById('products-table-body');
    if (!productsBody) return;
    
    productsBody.innerHTML = `
        <tr>
            <td>PROD001</td>
            <td>
                <div class="product-thumb" style="background-image: url('srcimg/5 (3).png')"></div>
            </td>
            <td>
                <strong>Đầm dạ hội lộng lẫy</strong>
                <div class="product-description">Đầm dạ hội cao cấp với chất liệu lụa mềm mại...</div>
            </td>
            <td>Đầm dạ hội</td>
            <td>3,500,000 ₫</td>
            <td>10</td>
            <td><span class="status-badge status-active">Còn hàng</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function loadSampleOrders() {
    const ordersBody = document.getElementById('orders-table-body');
    if (!ordersBody) return;
    
    ordersBody.innerHTML = `
        <tr>
            <td>ORD001</td>
            <td>${formatDate(new Date().toISOString())}</td>
            <td>Nguyễn Văn A</td>
            <td>2 sản phẩm</td>
            <td>1,850,000 ₫</td>
            <td><span class="status-badge status-pending">Chờ xử lý</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Cập nhật trạng thái">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function loadSampleCustomers() {
    const customersBody = document.getElementById('customers-table-body');
    if (!customersBody) return;
    
    customersBody.innerHTML = `
        <tr>
            <td>CUST001</td>
            <td>Nguyễn Văn A</td>
            <td>nguyenvana@email.com</td>
            <td>0901234567</td>
            <td>3</td>
            <td>5,200,000 ₫</td>
            <td>${formatDate(new Date().toISOString())}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// ====== MODAL FUNCTIONS ======
function initModals() {
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Confirm modal
    const confirmModal = document.getElementById('confirmModal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmOk = document.getElementById('confirm-ok');
    
    if (confirmCancel) {
        confirmCancel.addEventListener('click', () => {
            confirmModal.classList.remove('active');
        });
    }
    
    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showConfirm(message, onConfirm) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmOk = document.getElementById('confirm-ok');
    
    if (confirmMessage) {
        confirmMessage.textContent = message;
    }
    
    // Remove previous event listeners
    const newConfirmOk = confirmOk.cloneNode(true);
    confirmOk.parentNode.replaceChild(newConfirmOk, confirmOk);
    
    newConfirmOk.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        if (onConfirm) onConfirm();
    });
    
    confirmModal.classList.add('active');
}

// ====== TOAST FUNCTIONS ======
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Set type (color)
    toast.className = 'toast';
    toast.classList.add(type);
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ====== FORM FUNCTIONS ======
function initForms() {
    // Product form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: document.getElementById('product-price').value,
                stock: document.getElementById('product-stock').value,
                description: document.getElementById('product-description').value,
                image: document.getElementById('product-image').value || 'srcimg/default-product.jpg',
                featured: document.getElementById('product-featured').value === 'true',
                active: document.getElementById('product-active').value === 'true'
            };
            
            // Validate
            if (!formData.name || !formData.category || !formData.price || !formData.description) {
                showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
                return;
            }
            
            try {
                await submitProductForm(formData);
            } catch (error) {
                console.error('Product form error:', error);
            }
        });
    }
    
    // Reset product form
    const resetBtn = document.getElementById('reset-product-form');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            productForm.reset();
            document.getElementById('image-preview').innerHTML = '';
        });
    }
    
    // Order filter
    const orderFilter = document.getElementById('order-filter');
    if (orderFilter) {
        orderFilter.addEventListener('change', function() {
            loadAllOrders();
        });
    }
    
    // Customer search
    const customerSearch = document.getElementById('customer-search');
    if (customerSearch) {
        customerSearch.addEventListener('input', debounce(function() {
            filterCustomers(this.value);
        }, 300));
    }
    
    // Product search
    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(function() {
            filterProducts(this.value);
        }, 300));
    }
}

// ====== IMAGE UPLOAD ======
function initImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('product-images-input');
    const previewArea = document.getElementById('image-preview');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFiles(e.target.files);
            }
        });
    }
    
    function handleFiles(files) {
        if (!previewArea) return;
        
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast('Vui lòng chọn file ảnh', 'warning');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-image" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                previewArea.appendChild(previewItem);
                
                // Add remove functionality
                previewItem.querySelector('.remove-image').addEventListener('click', () => {
                    previewItem.remove();
                });
            };
            reader.readAsDataURL(file);
        });
    }
}

// ====== EDITOR FUNCTIONS ======
function initEditor() {
    const editorBtns = document.querySelectorAll('.editor-btn');
    editorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const command = this.dataset.command;
            const content = document.getElementById('post-content');
            
            if (content) {
                document.execCommand(command, false, null);
                content.focus();
            }
        });
    });
    
    // Sync editor content with hidden textarea
    const editorContent = document.getElementById('post-content');
    const hiddenTextarea = document.getElementById('post-content-hidden');
    
    if (editorContent && hiddenTextarea) {
        editorContent.addEventListener('input', function() {
            hiddenTextarea.value = this.innerHTML;
        });
    }
}

// ====== UTILITY FUNCTIONS ======
function debounce(func, wait) {
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

// ====== INITIALIZATION ======
function initSidebarNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    
    const pageTitles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Tổng quan hệ thống quản trị' },
        'products': { title: 'Quản lý Sản phẩm', subtitle: 'Xem và chỉnh sửa sản phẩm' },
        'add-product': { title: 'Thêm sản phẩm mới', subtitle: 'Tạo sản phẩm mới cho cửa hàng' },
        'orders': { title: 'Quản lý Đơn hàng', subtitle: 'Xem và xử lý đơn hàng' },
        'customers': { title: 'Quản lý Khách hàng', subtitle: 'Quản lý thông tin khách hàng' },
        'settings': { title: 'Cài đặt hệ thống', subtitle: 'Cấu hình hệ thống cửa hàng' }
    };
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class
            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class
            this.classList.add('active');
            
            const sectionId = this.dataset.section;
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                targetSection.classList.add('active');
                
                if (pageTitles[sectionId]) {
                    pageTitle.textContent = pageTitles[sectionId].title;
                    pageSubtitle.textContent = pageTitles[sectionId].subtitle;
                }
                
                // Load data for section
                setTimeout(() => {
                    switch(sectionId) {
                        case 'dashboard':
                            loadDashboardData();
                            break;
                        case 'products':
                            loadProducts();
                            break;
                        case 'orders':
                            loadAllOrders();
                            break;
                        case 'customers':
                            loadCustomers();
                            break;
                        case 'messages':
                            loadMessages();
                            break;
                    }
                }, 100);
            }
        });
    });
}

// ====== FILTER FUNCTIONS ======
function filterProducts(searchTerm) {
    const rows = document.querySelectorAll('#products-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterCustomers(searchTerm) {
    const rows = document.querySelectorAll('#customers-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ====== EXPORT FUNCTIONS FOR HTML ONCLICK ======
// Make functions available globally for onclick attributes
window.viewOrderDetails = viewOrderDetails;
window.editOrderStatus = editOrderStatus;
window.deleteOrder = deleteOrder;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewCustomerDetails = viewCustomerDetails;
