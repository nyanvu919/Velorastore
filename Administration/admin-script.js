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
