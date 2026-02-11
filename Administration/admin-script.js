// ====== API CONFIGURATION ======
const API_BASE_URL = ''; // Empty string for same-origin requests
const ADMIN_API_KEY = 'velora-admin-secret-key-2024'; // This should match your Worker env.ADMIN_API_KEY

// API Headers
const adminHeaders = {
    'Content-Type': 'application/json',
    'X-API-Key': ADMIN_API_KEY
};

// ====== API FUNCTIONS ======
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...adminHeaders,
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

// Dashboard functions
async function loadDashboardStats() {
    try {
        const data = await fetchAPI('/api/admin/stats');
        
        // Update dashboard cards
        document.querySelectorAll('.card-value')[0].textContent = data.data.totalProducts || 0;
        document.querySelectorAll('.card-value')[1].textContent = data.data.totalOrders || 0;
        document.querySelectorAll('.card-value')[2].textContent = formatCurrency(data.data.totalRevenue || 0);
        document.querySelectorAll('.card-value')[3].textContent = data.data.totalOrders || 0; // Simplified for customers
        
        // Update recent orders
        await loadRecentOrders();
        
    } catch (error) {
        // Fallback to static data
        console.log('Using fallback data for dashboard');
    }
}

async function loadRecentOrders() {
    try {
        const data = await fetchAPI('/api/admin/orders?limit=5');
        const ordersBody = document.getElementById('recent-orders-body');
        
        if (ordersBody && data.data) {
            ordersBody.innerHTML = '';
            data.data.slice(0, 5).forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id || order.orderNumber}</td>
                    <td>${order.customerName || 'Khách hàng'}</td>
                    <td>${order.itemCount || order.items?.length || 0} sản phẩm</td>
                    <td>${formatCurrency(order.totalAmount || 0)}</td>
                    <td><span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status || 'pending')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewOrderDetails('${order.id || order.orderNumber}')" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="editOrderStatus('${order.id || order.orderNumber}')" title="Chỉnh sửa">
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
    }
}

// Products functions
async function loadProducts() {
    try {
        const data = await fetchAPI('/api/admin/products');
        const productsBody = document.getElementById('products-table-body');
        
        if (productsBody && data.data) {
            productsBody.innerHTML = '';
            data.data.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${product.id}</td>
                    <td><div class="product-thumb" style="background-image: url('${product.image}')"></div></td>
                    <td>${product.name}</td>
                    <td>${getCategoryText(product.category)}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>${product.stock || 0}</td>
                    <td>
                        <span class="status-badge status-${product.stock > 5 ? 'active' : product.stock > 0 ? 'low' : 'out'}">
                            ${getProductStatusText(product.stock > 5 ? 'active' : product.stock > 0 ? 'low' : 'out')}
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
    }
}

// Orders functions
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
                    <td>${order.id || order.orderNumber}</td>
                    <td>${formatDate(order.createdAt)}</td>
                    <td>${order.customerName || 'Khách hàng'}</td>
                    <td>${order.itemCount || order.items?.length || 0} sản phẩm</td>
                    <td>${formatCurrency(order.totalAmount || 0)}</td>
                    <td><span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status || 'pending')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewOrderDetails('${order.id || order.orderNumber}')" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="editOrderStatus('${order.id || order.orderNumber}')" title="Cập nhật trạng thái">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                `;
                ordersBody.appendChild(row);
            });
        }
    } catch (error) {
        console.log('Using fallback data for all orders');
    }
}

// Customers functions
async function loadCustomers() {
    try {
        const data = await fetchAPI('/api/admin/customers');
        const customersBody = document.getElementById('customers-table-body');
        
        if (customersBody && data.data) {
            customersBody.innerHTML = '';
            data.data.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${customer.id || 'CUST' + customer.email?.hashCode()}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone || 'Chưa cập nhật'}</td>
                    <td>${customer.orderCount || 0}</td>
                    <td>${formatCurrency(customer.totalSpent || 0)}</td>
                    <td>${formatDate(customer.joinDate)}</td>
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
    }
}

// ====== FORM HANDLERS ======
async function submitProductForm(formData) {
    try {
        const response = await fetchAPI('/api/admin/products', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showToast('Sản phẩm đã được thêm thành công!');
        
        // Reload products list
        await loadProducts();
        
        // Switch to products view
        document.querySelector('a[data-section="products"]').click();
        
        return response;
    } catch (error) {
        showToast('Lỗi khi thêm sản phẩm', 'error');
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
        await loadProducts();
        
        return response;
    } catch (error) {
        showToast('Lỗi khi cập nhật sản phẩm', 'error');
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
            await loadProducts();
        } catch (error) {
            showToast('Lỗi khi xóa sản phẩm', 'error');
        }
    });
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await fetchAPI(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        showToast('Trạng thái đơn hàng đã được cập nhật!');
        await loadRecentOrders();
        await loadAllOrders();
    } catch (error) {
        showToast('Lỗi khi cập nhật trạng thái', 'error');
    }
}

// ====== HELPER FUNCTIONS ======
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
}

// String hash function for customer IDs
String.prototype.hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString().slice(0, 6);
};

// ====== MODAL FUNCTIONS ======
function viewOrderDetails(orderId) {
    fetchAPI(`/api/admin/orders/${orderId}`)
        .then(data => {
            const modal = document.getElementById('editModal');
            const modalBody = modal.querySelector('.modal-body');
            
            modalBody.innerHTML = `
                <div class="order-details">
                    <h4>Chi tiết đơn hàng: ${data.data.id}</h4>
                    <div class="detail-row">
                        <strong>Khách hàng:</strong> ${data.data.customer?.name || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Email:</strong> ${data.data.customer?.email || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>SĐT:</strong> ${data.data.customer?.phone || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Địa chỉ:</strong> ${data.data.customer?.address || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Ngày đặt:</strong> ${formatDate(data.data.createdAt)}
                    </div>
                    <div class="detail-row">
                        <strong>Trạng thái:</strong> <span class="status-badge status-${data.data.status}">${getStatusText(data.data.status)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Tổng tiền:</strong> ${formatCurrency(data.data.totalAmount)}
                    </div>
                    
                    <h5 style="margin-top: 20px;">Sản phẩm:</h5>
                    <div class="order-items">
                        ${data.data.items?.map(item => `
                            <div class="order-item">
                                <div>${item.name || 'Sản phẩm'}</div>
                                <div>Số lượng: ${item.quantity || 1}</div>
                                <div>Giá: ${formatCurrency(item.price || 0)}</div>
                            </div>
                        `).join('') || '<p>Không có thông tin sản phẩm</p>'}
                    </div>
                </div>
            `;
            
            modal.classList.add('active');
        })
        .catch(error => {
            showToast('Không thể tải chi tiết đơn hàng', 'error');
        });
}

function editOrderStatus(orderId) {
    const modal = document.getElementById('editModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <h4>Cập nhật trạng thái đơn hàng</h4>
        <p>Đơn hàng: ${orderId}</p>
        
        <div class="form-group">
            <label for="order-status-select">Trạng thái mới:</label>
            <select id="order-status-select" class="form-control">
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đã giao hàng</option>
                <option value="delivered">Đã nhận hàng</option>
                <option value="cancelled">Đã hủy</option>
            </select>
        </div>
        
        <div class="modal-actions" style="margin-top: 20px;">
            <button class="btn btn-secondary close-modal">Hủy</button>
            <button class="btn btn-primary" onclick="saveOrderStatus('${orderId}')">Lưu thay đổi</button>
        </div>
    `;
    
    modal.classList.add('active');
}

function saveOrderStatus(orderId) {
    const newStatus = document.getElementById('order-status-select').value;
    updateOrderStatus(orderId, newStatus);
    document.querySelector('.close-modal').click();
}

function editProduct(productId) {
    fetchAPI(`/api/admin/products`)
        .then(data => {
            const product = data.data.find(p => p.id === productId);
            if (!product) {
                showToast('Không tìm thấy sản phẩm', 'error');
                return;
            }
            
            const modal = document.getElementById('editModal');
            const modalBody = modal.querySelector('.modal-body');
            
            modalBody.innerHTML = `
                <h4>Chỉnh sửa sản phẩm</h4>
                <form id="edit-product-form" class="admin-form" style="padding: 0; box-shadow: none;">
                    <div class="form-group">
                        <label>Tên sản phẩm</label>
                        <input type="text" id="edit-product-name" value="${product.name}" class="form-control">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Danh mục</label>
                            <select id="edit-product-category" class="form-control">
                                <option value="dress" ${product.category === 'dress' ? 'selected' : ''}>Đầm/Váy</option>
                                <option value="shirt" ${product.category === 'shirt' ? 'selected' : ''}>Áo sơ mi</option>
                                <option value="pants" ${product.category === 'pants' ? 'selected' : ''}>Quần</option>
                                <option value="jacket" ${product.category === 'jacket' ? 'selected' : ''}>Áo khoác</option>
                                <option value="accessories" ${product.category === 'accessories' ? 'selected' : ''}>Phụ kiện</option>
                                <option value="evening" ${product.category === 'evening' ? 'selected' : ''}>Đầm dạ hội</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Giá (VND)</label>
                            <input type="number" id="edit-product-price" value="${product.price}" class="form-control">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Số lượng tồn kho</label>
                            <input type="number" id="edit-product-stock" value="${product.stock || 0}" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label>URL hình ảnh</label>
                            <input type="text" id="edit-product-image" value="${product.image}" class="form-control">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Mô tả</label>
                        <textarea id="edit-product-description" rows="3" class="form-control">${product.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="edit-product-featured" ${product.featured ? 'checked' : ''}>
                            <span>Sản phẩm nổi bật</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="edit-product-active" ${product.active !== false ? 'checked' : ''}>
                            <span>Hiển thị sản phẩm</span>
                        </label>
                    </div>
                    
                    <div class="modal-actions" style="margin-top: 20px;">
                        <button type="button" class="btn btn-secondary close-modal">Hủy</button>
                        <button type="button" class="btn btn-primary" onclick="saveProductChanges('${productId}')">Lưu thay đổi</button>
                    </div>
                </form>
            `;
            
            modal.classList.add('active');
        })
        .catch(error => {
            showToast('Không thể tải thông tin sản phẩm', 'error');
        });
}

function saveProductChanges(productId) {
    const formData = {
        name: document.getElementById('edit-product-name').value,
        category: document.getElementById('edit-product-category').value,
        price: Number(document.getElementById('edit-product-price').value),
        stock: Number(document.getElementById('edit-product-stock').value),
        image: document.getElementById('edit-product-image').value,
        description: document.getElementById('edit-product-description').value,
        featured: document.getElementById('edit-product-featured').checked,
        active: document.getElementById('edit-product-active').checked
    };
    
    updateProduct(productId, formData);
    document.querySelector('.close-modal').click();
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Load data when switching sections
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            
            // Load data based on section
            setTimeout(() => {
                switch(sectionId) {
                    case 'dashboard':
                        loadDashboardStats();
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
        });
    });
    
    // Initial load for dashboard
    loadDashboardStats();
});
// ====== ADMIN SCRIPT ======
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initSidebarNavigation();
    initModals();
    initForms();
    initCharts();
    loadSampleData();
    initImageUpload();
    initEditor();
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        showConfirm('Bạn có chắc chắn muốn đăng xuất?', function() {
            window.location.href = 'index.html';
        });
    });
});

// ====== SIDEBAR NAVIGATION ======
function initSidebarNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    
    // Page titles mapping
    const pageTitles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Tổng quan hệ thống quản trị' },
        'products': { title: 'Quản lý Sản phẩm', subtitle: 'Xem và chỉnh sửa sản phẩm' },
        'add-product': { title: 'Thêm sản phẩm mới', subtitle: 'Tạo sản phẩm mới cho cửa hàng' },
        'posts': { title: 'Quản lý Bài viết', subtitle: 'Xem và quản lý bài viết blog' },
        'add-post': { title: 'Đăng bài viết mới', subtitle: 'Viết và đăng bài viết mới' },
        'categories': { title: 'Quản lý Danh mục', subtitle: 'Quản lý danh mục sản phẩm' },
        'orders': { title: 'Quản lý Đơn hàng', subtitle: 'Xem và xử lý đơn hàng' },
        'customers': { title: 'Quản lý Khách hàng', subtitle: 'Quản lý thông tin khách hàng' },
        'settings': { title: 'Cài đặt hệ thống', subtitle: 'Cấu hình hệ thống cửa hàng' }
    };
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section
            const sectionId = this.dataset.section;
            
            // Show target section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Update page title and subtitle
                if (pageTitles[sectionId]) {
                    pageTitle.textContent = pageTitles[sectionId].title;
                    pageSubtitle.textContent = pageTitles[sectionId].subtitle;
                }
            }
            
            // If clicking "Add product" button from products section
            if (this.dataset.section) {
                const sectionLink = document.querySelector(`a[data-section="${this.dataset.section}"]`);
                if (sectionLink) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    sectionLink.classList.add('active');
                }
            }
        });
    });
    
    // Handle "Add product" button in products section
    document.querySelectorAll('[data-section]').forEach(button => {
        if (button.tagName === 'BUTTON') {
            button.addEventListener('click', function() {
                const sectionId = this.dataset.section;
                const sectionLink = document.querySelector(`a[data-section="${sectionId}"]`);
                if (sectionLink) {
                    sectionLink.click();
                }
            });
        }
    });
}

// ====== MODALS ======
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal, #confirm-cancel');
    
    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modals.forEach(modal => modal.classList.remove('active'));
        });
    });
    
    // Close modal on outside click
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Confirm modal
    window.showConfirm = function(message, callback) {
        document.getElementById('confirm-message').textContent = message;
        const confirmModal = document.getElementById('confirmModal');
        confirmModal.classList.add('active');
        
        const confirmOk = document.getElementById('confirm-ok');
        const confirmCancel = document.getElementById('confirm-cancel');
        
        // Remove previous listeners
        const newConfirmOk = confirmOk.cloneNode(true);
        const newConfirmCancel = confirmCancel.cloneNode(true);
        
        confirmOk.parentNode.replaceChild(newConfirmOk, confirmOk);
        confirmCancel.parentNode.replaceChild(newConfirmCancel, confirmCancel);
        
        // Add new listeners
        newConfirmOk.addEventListener('click', function() {
            confirmModal.classList.remove('active');
            if (callback) callback();
        });
        
        newConfirmCancel.addEventListener('click', function() {
            confirmModal.classList.remove('active');
        });
    };
}

// ====== FORMS ======
function initForms() {
    // Product form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: document.getElementById('product-price').value,
                stock: document.getElementById('product-stock').value,
                description: document.getElementById('product-description').value,
                featured: document.getElementById('product-featured').checked,
                active: document.getElementById('product-active').checked
            };
            
            // Validate
            if (!formData.name || !formData.category || !formData.price || !formData.stock || !formData.description) {
                showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
                return;
            }
            
            // Simulate save
            console.log('Saving product:', formData);
            showToast('Sản phẩm đã được lưu thành công!');
            this.reset();
            document.getElementById('image-preview').innerHTML = '';
        });
    }
    
    // Post form
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const content = document.getElementById('post-content').innerHTML;
            document.getElementById('post-content-hidden').value = content;
            
            const formData = {
                title: document.getElementById('post-title').value,
                category: document.getElementById('post-category').value,
                content: content,
                excerpt: document.getElementById('post-excerpt').value
            };
            
            if (!formData.title || !content) {
                showToast('Vui lòng điền tiêu đề và nội dung bài viết', 'warning');
                return;
            }
            
            console.log('Publishing post:', formData);
            showToast('Bài viết đã được đăng thành công!');
            this.reset();
            document.getElementById('post-content').innerHTML = '';
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
    
    // Save draft button
    const saveDraftBtn = document.getElementById('save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            showToast('Đã lưu bài viết vào bản nháp');
        });
    }
}

// ====== IMAGE UPLOAD ======
function initImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('product-images-input');
    const imagePreview = document.getElementById('image-preview');
    
    if (!uploadArea || !fileInput || !imagePreview) return;
    
    // Click to select files
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary)';
        this.style.background = 'rgba(139, 115, 85, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        this.style.borderColor = '';
        this.style.background = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    // File input change
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
        for (let file of files) {
            if (!file.type.startsWith('image/')) continue;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = function() {
                    previewItem.remove();
                };
                
                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                imagePreview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    }
}

// ====== EDITOR ======
function initEditor() {
    const editorButtons = document.querySelectorAll('.editor-btn');
    
    editorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const command = this.dataset.command;
            const contentEditable = document.getElementById('post-content');
            
            if (command === 'createLink') {
                const url = prompt('Nhập URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, null);
            }
            
            contentEditable.focus();
        });
    });
}

// ====== CHARTS ======
function initCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: [{
                    label: 'Doanh thu (triệu VND)',
                    data: [85, 92, 78, 105, 120, 95, 110, 125, 140, 130, 150, 165],
                    borderColor: '#8B7355',
                    backgroundColor: 'rgba(139, 115, 85, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Products Chart
    const productsCtx = document.getElementById('productsChart');
    if (productsCtx) {
        new Chart(productsCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Đầm dạ hội', 'Áo sơ mi', 'Quần âu', 'Áo khoác', 'Phụ kiện', 'Đầm công sở'],
                datasets: [{
                    label: 'Số lượng bán',
                    data: [45, 78, 52, 65, 92, 120],
                    backgroundColor: [
                        'rgba(139, 115, 85, 0.7)',
                        'rgba(139, 115, 85, 0.8)',
                        'rgba(139, 115, 85, 0.7)',
                        'rgba(139, 115, 85, 0.8)',
                        'rgba(139, 115, 85, 0.7)',
                        'rgba(139, 115, 85, 0.8)'
                    ],
                    borderColor: '#8B7355',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// ====== SAMPLE DATA ======
function loadSampleData() {
    // Recent Orders
    const ordersBody = document.getElementById('recent-orders-body');
    if (ordersBody) {
        const orders = [
            { id: 'VLR-2023-001', customer: 'Nguyễn Thị Mai', products: 2, total: '4,850,000', status: 'processing' },
            { id: 'VLR-2023-002', customer: 'Trần Văn Nam', products: 1, total: '2,150,000', status: 'pending' },
            { id: 'VLR-2023-003', customer: 'Lê Thị Hoa', products: 3, total: '8,750,000', status: 'shipped' },
            { id: 'VLR-2023-004', customer: 'Phạm Văn Bình', products: 1, total: '1,950,000', status: 'delivered' },
            { id: 'VLR-2023-005', customer: 'Hoàng Thị Lan', products: 2, total: '5,250,000', status: 'cancelled' }
        ];
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.products} sản phẩm</td>
                <td>${order.total}₫</td>
                <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            ordersBody.appendChild(row);
        });
    }
    
    // Products Table
    const productsBody = document.getElementById('products-table-body');
    if (productsBody) {
        const products = [
            { id: 1, name: 'Đầm dạ hội lụa đen', category: 'evening', price: '8,500,000', stock: 15, status: 'active' },
            { id: 2, name: 'Áo sơ mi trắng cổ cách điệu', category: 'shirt', price: '1,850,000', stock: 42, status: 'active' },
            { id: 3, name: 'Quần âu cao cấp', category: 'pants', price: '2,350,000', stock: 28, status: 'active' },
            { id: 4, name: 'Áo khoác len mỏng', category: 'jacket', price: '3,250,000', stock: 8, status: 'low' },
            { id: 5, name: 'Vòng cổ ngọc trai', category: 'accessories', price: '1,250,000', stock: 0, status: 'out' }
        ];
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${product.id}</td>
                <td><div class="product-thumb">IMG</div></td>
                <td>${product.name}</td>
                <td>${getCategoryText(product.category)}</td>
                <td>${product.price}₫</td>
                <td>${product.stock}</td>
                <td><span class="status-badge status-${product.status}">${getProductStatusText(product.status)}</span></td>
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
            `;
            productsBody.appendChild(row);
        });
    }
    
    // Orders Table
    const ordersTableBody = document.getElementById('orders-table-body');
    if (ordersTableBody) {
        const orders = [
            { id: 'VLR-2023-001', date: '15/11/2023', customer: 'Nguyễn Thị Mai', products: 2, total: '4,850,000', status: 'processing' },
            { id: 'VLR-2023-002', date: '14/11/2023', customer: 'Trần Văn Nam', products: 1, total: '2,150,000', status: 'pending' },
            { id: 'VLR-2023-003', date: '13/11/2023', customer: 'Lê Thị Hoa', products: 3, total: '8,750,000', status: 'shipped' },
            { id: 'VLR-2023-004', date: '12/11/2023', customer: 'Phạm Văn Bình', products: 1, total: '1,950,000', status: 'delivered' },
            { id: 'VLR-2023-005', date: '11/11/2023', customer: 'Hoàng Thị Lan', products: 2, total: '5,250,000', status: 'cancelled' }
        ];
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.date}</td>
                <td>${order.customer}</td>
                <td>${order.products} sản phẩm</td>
                <td>${order.total}₫</td>
                <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
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
            `;
            ordersTableBody.appendChild(row);
        });
    }
    
    // Customers Table
    const customersBody = document.getElementById('customers-table-body');
    if (customersBody) {
        const customers = [
            { id: 1, name: 'Nguyễn Thị Mai', email: 'mainguyen@email.com', phone: '0987654321', orders: 5, total: '25,500,000', joinDate: '15/08/2022' },
            { id: 2, name: 'Trần Văn Nam', email: 'namtran@email.com', phone: '0912345678', orders: 3, total: '12,750,000', joinDate: '22/09/2022' },
            { id: 3, name: 'Lê Thị Hoa', email: 'hoale@email.com', phone: '0978123456', orders: 8, total: '45,200,000', joinDate: '10/11/2022' },
            { id: 4, name: 'Phạm Văn Bình', email: 'binhpham@email.com', phone: '0965874123', orders: 2, total: '8,950,000', joinDate: '05/12/2022' },
            { id: 5, name: 'Hoàng Thị Lan', email: 'lanhoang@email.com', phone: '0932147856', orders: 4, total: '18,500,000', joinDate: '18/01/2023' }
        ];
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.orders}</td>
                <td>${customer.total}₫</td>
                <td>${customer.joinDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            customersBody.appendChild(row);
        });
    }
}

// ====== HELPER FUNCTIONS ======
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

function getProductStatusText(status) {
    const statusMap = {
        'active': 'Đang bán',
        'low': 'Sắp hết hàng',
        'out': 'Hết hàng'
    };
    return statusMap[status] || status;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    
    // Set color based on type
    if (type === 'warning') {
        toast.style.background = 'var(--warning)';
    } else if (type === 'error') {
        toast.style.background = 'var(--danger)';
    } else {
        toast.style.background = 'var(--success)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ====== TAB FUNCTIONALITY ======
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding pane
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
});

// ====== ADD CATEGORY BUTTON ======
document.addEventListener('DOMContentLoaded', function() {
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            const categoryName = prompt('Nhập tên danh mục mới:');
            if (categoryName && categoryName.trim()) {
                showToast(`Đã thêm danh mục "${categoryName}"`);
            }
        });
    }
});

// ====== SEARCH FUNCTIONALITY ======
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('.search-box input');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableId = this.id === 'product-search' ? 'products-table-body' : 
                          this.id === 'customer-search' ? 'customers-table-body' : null;
            
            if (tableId) {
                const tableRows = document.querySelectorAll(`#${tableId} tr`);
                tableRows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    });
});

// ====== FILTER FUNCTIONALITY ======
document.addEventListener('DOMContentLoaded', function() {
    const orderFilter = document.getElementById('order-filter');
    if (orderFilter) {
        orderFilter.addEventListener('change', function() {
            const status = this.value;
            const tableRows = document.querySelectorAll('#orders-table-body tr');
            
            tableRows.forEach(row => {
                if (status === 'all') {
                    row.style.display = '';
                } else {
                    const rowStatus = row.querySelector('.status-badge').className.includes(status);
                    row.style.display = rowStatus ? '' : 'none';
                }
            });
        });
    }
});
