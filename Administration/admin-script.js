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
            window.location.href = 'index.html';
        });
    });
});

// ====== ADMIN AUTHENTICATION ======
async function checkAdminAuth() {
    // Check if already authenticated
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    
    if (!isAuthenticated) {
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
        
        if (!response.ok || !data.success) {
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
        
        // Load products data for charts
        const productsData = await fetchAPI('/api/admin/products');
        updateProductsChart(productsData.data);
        
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
        cards[1].querySelector('.card-change').textContent = `${stats.pendingOrders || 0} chờ xử lý`;
        
        // Revenue
        const revenue = stats.totalRevenue || 0;
        cards[2].querySelector('.card-value').textContent = formatCurrency(revenue);
        cards[2].querySelector('.card-change').textContent = formatCurrency(stats.todayRevenue || 0) + ' hôm nay';
        
        // Customers
        cards[3].querySelector('.card-value').textContent = stats.totalCustomers || 0;
        cards[3].querySelector('.card-change').textContent = `${stats.newCustomersToday || 0} mới hôm nay`;
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
    }
}

// ====== PRODUCTS MANAGEMENT ======
async function loadProducts() {
    try {
        const data = await fetchAPI('/api/admin/products');
        const productsBody = document.getElementById('products-table-body');
        
        if (productsBody && data.data) {
            productsBody.innerHTML = '';
            
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
                    <td>${product.stock}</td>
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
        }, 1000);
        
        return response;
        
    } catch (error) {
        showToast('Lỗi khi thêm sản phẩm: ' + error.message, 'error');
        throw error;
    }
}

async function updateProduct(productId, formData) {
    try {
        const response = await fetchAPI(`/api/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showToast('Sản phẩm đã được cập nhật!');
        
        // Reload products
        loadProducts();
        
        return response;
        
    } catch (error) {
        showToast('Lỗi khi cập nhật sản phẩm: ' + error.message, 'error');
        throw error;
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
            
            filteredOrders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.orderNumber || order.id}</td>
                    <td>${formatDate(order.createdAt)}</td>
                    <td>${order.customerName || 'Khách hàng'}</td>
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
            
            data.data.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.id || customer.email?.substring(0, 8)}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone || 'Chưa cập nhật'}</td>
                    <td>${customer.orderCount || 0}</td>
                    <td>${formatCurrency(customer.totalSpent || 0)}</td>
                    <td>${formatDate(customer.firstOrder)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" title="Xem chi tiết">
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

// ====== MESSAGES MANAGEMENT ======
async function loadMessages() {
    try {
        const data = await fetchAPI('/api/admin/messages');
        // Update your messages UI here
        console.log('Messages loaded:', data.data);
    } catch (error) {
        console.log('Error loading messages:', error);
    }
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
}

function loadSampleProducts() {
    const productsBody = document.getElementById('products-table-body');
    if (!productsBody) return;
    
    // ... your sample products HTML ...
}

function loadSampleOrders() {
    const ordersBody = document.getElementById('orders-table-body');
    if (!ordersBody) return;
    
    // ... your sample orders HTML ...
}

function loadSampleCustomers() {
    const customersBody = document.getElementById('customers-table-body');
    if (!customersBody) return;
    
    // ... your sample customers HTML ...
}

// ====== INITIALIZATION ======
// Update your existing initSidebarNavigation to load data
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
                    }
                }, 100);
            }
        });
    });
}

// Update your existing initForms to use API
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
                featured: document.getElementById('product-featured').checked,
                image: document.getElementById('product-images-input').files[0] ? 
                       'srcimg/' + document.getElementById('product-images-input').files[0].name : 
                       'srcimg/default-product.jpg'
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
}
