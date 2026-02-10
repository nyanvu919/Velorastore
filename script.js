// ============================================
// VELORA FASHION - FRONTEND SCRIPT
// Đã tích hợp với Backend API
// Backend URL: https://velora-api.nyaochen9.workers.dev
// ============================================

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', async function() {
  // ============================================
  // 1. CẤU HÌNH API & KHỞI TẠO
  // ============================================
  
  const API_BASE_URL = 'https://velora-api.nyaochen9.workers.dev/api';
  let backendAvailable = false;
  let apiService = null;
  
  // Kiểm tra kết nối backend
  async function checkBackendConnection() {
    try {
      console.log('🔍 Kiểm tra kết nối backend...');
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connected:', data);
        showNotification('Đã kết nối với máy chủ', 'success');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Backend unavailable, using demo mode');
    }
    return false;
  }
  
  // API Service Class
  class VeloraAPI {
    constructor() {
      this.baseURL = API_BASE_URL;
      this.connected = false;
    }
    
    async init() {
      this.connected = await checkBackendConnection();
      return this.connected;
    }
    
    // Lấy danh sách sản phẩm
    async getProducts() {
      if (!this.connected) {
        return {
          success: true,
          data: allProducts,
          source: 'local'
        };
      }
      
      try {
        const response = await fetch(`${this.baseURL}/products`);
        if (!response.ok) throw new Error('API error');
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch products:', error);
        return {
          success: true,
          data: allProducts,
          source: 'fallback'
        };
      }
    }
    
    // Tạo đơn hàng
    async createOrder(orderData) {
      if (!this.connected) {
        // Demo mode
        const demoOrderId = `DEMO_${Date.now()}`;
        return {
          success: true,
          message: 'Order created (demo mode)',
          data: {
            orderId: demoOrderId,
            orderNumber: demoOrderId,
            status: 'pending',
            customerName: orderData.customer?.name || 'Customer',
            totalAmount: orderData.totalAmount,
            currency: 'VND'
          },
          demo: true
        };
      }
      
      try {
        const response = await fetch(`${this.baseURL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Order creation failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Create order error:', error);
        throw error;
      }
    }
    
    // Gửi liên hệ
    async sendContact(formData) {
      if (!this.connected) {
        return {
          success: true,
          message: 'Message sent (demo mode)'
        };
      }
      
      try {
        const response = await fetch(`${this.baseURL}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        return await response.json();
      } catch (error) {
        console.error('Contact form error:', error);
        throw error;
      }
    }
    
    // Test KV storage
    async testKV() {
      if (!this.connected) return null;
      
      try {
        const response = await fetch(`${this.baseURL}/test-kv`);
        return await response.json();
      } catch (error) {
        return null;
      }
    }
  }
  
  // ============================================
  // 2. DỮ LIỆU & BIẾN TOÀN CỤC
  // ============================================
  
  // Dữ liệu sản phẩm mẫu (fallback)
  let allProducts = [
    {
      id: "1",
      name: "Đầm dạ hội lộng lẫy",
      category: "ĐẦM DẠ HỘI",
      price: 3500000,
      image: "srcimg/5 (3).png"
    },
    {
      id: "2",
      name: "Áo sơ mi lụa cao cấp",
      category: "ÁO SƠ MI",
      price: 1200000,
      image: "srcimg/6 (3).png"
    },
    {
      id: "3",
      name: "Quần âu sang trọng",
      category: "QUẦN ÂU",
      price: 1800000,
      image: "srcimg/7 (1).png"
    },
    {
      id: "4",
      name: "Áo khoác da thật",
      category: "ÁO KHOÁC",
      price: 4500000,
      image: "srcimg/7 (2).png"
    },
    {
      id: "5",
      name: "Váy công sở thanh lịch",
      category: "VÁY",
      price: 1600000,
      image: "srcimg/5f7d5610fa1a74442d0b.jpg"
    },
    {
      id: "6",
      name: "Set đồ thể thao cao cấp",
      category: "ĐỒ THỂ THAO",
      price: 2200000,
      image: "srcimg/6912a04bf25b7c05254a.jpg"
    },
    {
      id: "7",
      name: "Áo len cashmere",
      category: "ÁO LEN",
      price: 2800000,
      image: "srcimg/8186fcbeaeae20f079bf.jpg"
    },
    {
      id: "8",
      name: "Chân váy bút chì",
      category: "CHÂN VÁY",
      price: 1400000,
      image: "srcimg/a48eb8a7b3b73de964a6.jpg"
    }
  ];
  
  // Giỏ hàng
  let cart = [
    {id: "1", name: "Đầm dạ hội lộng lẫy", price: 3500000, quantity: 1, image: "srcimg/5 (3).png"},
    {id: "2", name: "Áo sơ mi lụa cao cấp", price: 1200000, quantity: 2, image: "srcimg/6 (3).png"},
    {id: "3", name: "Quần âu sang trọng", price: 1800000, quantity: 1, image: "srcimg/7 (1).png"},
    {id: "4", name: "Áo khoác da thật", price: 4500000, quantity: 1, image: "srcimg/7 (2).png"}
  ];
  
  // Biến để theo dõi số lượng sản phẩm hiển thị
  let displayedProducts = 8;
  
  // ============================================
  // 3. DOM ELEMENTS
  // ============================================
  
  const productsGrid = document.querySelector('.products-grid');
  const cartModal = document.getElementById('cartModal');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const orderModal = document.getElementById('orderModal');
  const successModal = document.getElementById('successModal');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const showRegisterBtn = document.getElementById('showRegister');
  const showLoginBtn = document.getElementById('showLogin');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const closeSuccessBtn = document.getElementById('closeSuccess');
  const loadMoreBtn = document.getElementById('loadMoreProducts');
  
  // ============================================
  // 4. HELPER FUNCTIONS
  // ============================================
  
  // Định dạng giá tiền
  function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
  
  // Hiển thị thông báo
  function showNotification(message, type = 'info') {
    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Thêm icon tùy theo loại
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `${icon} ${message}`;
    
    // Thêm vào body
    document.body.appendChild(notification);
    
    // Hiệu ứng xuất hiện
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
    
    // Thêm CSS cho thông báo nếu chưa có
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification {
          position: fixed;
          top: 100px;
          right: 20px;
          background-color: #8B7355;
          color: white;
          padding: 15px 25px;
          border-radius: 5px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          z-index: 3000;
          transform: translateX(150%);
          transition: transform 0.3s ease;
          font-weight: 500;
          max-width: 300px;
        }
        .notification.success {
          background-color: #4CAF50;
        }
        .notification.error {
          background-color: #F44336;
        }
        .notification.warning {
          background-color: #FF9800;
        }
        .notification.show {
          transform: translateX(0);
        }
        @media (max-width: 768px) {
          .notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            transform: translateY(150%);
          }
          .notification.show {
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Mở modal
  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Đóng modal
  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  
  // ============================================
  // 5. PRODUCT FUNCTIONS
  // ============================================
  
  // Khởi tạo sản phẩm từ backend
  async function initProducts() {
    try {
      const result = await apiService.getProducts();
      
      if (result.success && result.data) {
        // Cập nhật danh sách sản phẩm
        allProducts = result.data.map(product => ({
          id: product.id.toString(),
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image || `srcimg/${product.id}.png`
        }));
        
        console.log(`📦 Loaded ${allProducts.length} products from ${result.source}`);
        
        // Render products nếu productsGrid tồn tại
        if (productsGrid) {
          renderProducts(allProducts.slice(0, displayedProducts));
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      // Fallback to local rendering
      if (productsGrid) {
        renderProducts(allProducts.slice(0, displayedProducts));
      }
    }
    
    // Thêm sự kiện cho các nút sản phẩm
    addProductEvents();
  }
  
  // Render sản phẩm
  function renderProducts(products) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
      const cartItem = cart.find(item => item.id === product.id);
      const inCart = cartItem ? true : false;
      const quantity = cartItem ? cartItem.quantity : 0;
      
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="product-img" style="background-image: url('${product.image}');">
          <div class="product-overlay">
            <div class="product-actions">
              <button class="action-btn view-btn" data-id="${product.id}">
                <i class="fas fa-eye"></i>
              </button>
              <button class="action-btn cart-add-btn ${inCart ? 'in-cart' : ''}" data-id="${product.id}">
                ${inCart ? '<i class="fas fa-check"></i>' : '<i class="fas fa-shopping-cart"></i>'}
              </button>
              <button class="action-btn favorite-btn" data-id="${product.id}">
                <i class="fas fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="product-content">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-category">${product.category}</p>
          <p class="product-price">${formatPrice(product.price)}</p>
          ${inCart ? `<p class="in-cart-text">Đã có ${quantity} sản phẩm trong giỏ</p>` : ''}
        </div>
      `;
      
      productsGrid.appendChild(productCard);
    });
    
    addProductEvents();
  }
  
  // Thêm sự kiện cho sản phẩm
  function addProductEvents() {
    // Nút thêm vào giỏ hàng
    document.querySelectorAll('.cart-add-btn').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        addToCart(productId);
      });
    });
    
    // Nút xem chi tiết
    document.querySelectorAll('.view-btn').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        viewProductDetails(productId);
      });
    });
    
    // Nút yêu thích
    document.querySelectorAll('.favorite-btn').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        toggleFavorite(productId);
      });
    });
  }
  
  // Xem chi tiết sản phẩm
  function viewProductDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${product.name}</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body product-details">
          <div class="product-details-img" style="background-image: url('${product.image}')"></div>
          <div class="product-details-info">
            <p class="product-category">${product.category}</p>
            <p class="product-price">${formatPrice(product.price)}</p>
            <p class="product-description">Sản phẩm cao cấp với chất liệu tốt nhất, thiết kế sang trọng và tinh tế. Phù hợp cho nhiều dịp khác nhau.</p>
            <div class="product-sizes">
              <h4>Kích thước:</h4>
              <div class="size-options">
                <button class="size-option active">S</button>
                <button class="size-option">M</button>
                <button class="size-option">L</button>
                <button class="size-option">XL</button>
              </div>
            </div>
            <button class="btn-primary full-width add-to-cart-details" data-id="${product.id}">
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Sự kiện đóng modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Sự kiện thêm vào giỏ hàng
    modal.querySelector('.add-to-cart-details').addEventListener('click', () => {
      addToCart(productId);
      document.body.removeChild(modal);
    });
    
    // Sự kiện chọn kích thước
    modal.querySelectorAll('.size-option').forEach(option => {
      option.addEventListener('click', function() {
        modal.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    // Đóng khi click bên ngoài
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  // Thêm/xóa yêu thích
  function toggleFavorite(productId) {
    const favorites = JSON.parse(localStorage.getItem('velora_favorites')) || [];
    const index = favorites.indexOf(productId);
    
    if (index >= 0) {
      favorites.splice(index, 1);
      showNotification("Đã xóa khỏi danh sách yêu thích");
    } else {
      favorites.push(productId);
      showNotification("Đã thêm vào danh sách yêu thích", "success");
    }
    
    localStorage.setItem('velora_favorites', JSON.stringify(favorites));
  }
  
  // ============================================
  // 6. CART FUNCTIONS
  // ============================================
  
  // Thêm vào giỏ hàng
  function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      });
    }
    
    updateCart();
    updateProductUI(productId);
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng`, "success");
  }
  
  // Cập nhật UI sản phẩm
  function updateProductUI(productId) {
    const productElement = document.querySelector(`.cart-add-btn[data-id="${productId}"]`);
    const productCard = productElement?.closest('.product-card');
    
    if (productCard) {
      const cartItem = cart.find(item => item.id === productId);
      if (cartItem) {
        // Cập nhật nút
        productElement.innerHTML = '<i class="fas fa-check"></i>';
        productElement.classList.add('in-cart');
        
        // Cập nhật text
        let inCartText = productCard.querySelector('.in-cart-text');
        if (inCartText) {
          inCartText.textContent = `Đã có ${cartItem.quantity} sản phẩm trong giỏ`;
        } else {
          const productContent = productCard.querySelector('.product-content');
          inCartText = document.createElement('p');
          inCartText.className = 'in-cart-text';
          inCartText.textContent = `Đã có ${cartItem.quantity} sản phẩm trong giỏ`;
          productContent.appendChild(inCartText);
        }
      }
    }
  }
  
  // Xóa khỏi giỏ hàng
  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    
    // Cập nhật UI sản phẩm
    const productElement = document.querySelector(`.cart-add-btn[data-id="${productId}"]`);
    const productCard = productElement?.closest('.product-card');
    
    if (productCard) {
      // Cập nhật nút
      if (productElement) {
        productElement.innerHTML = '<i class="fas fa-shopping-cart"></i>';
        productElement.classList.remove('in-cart');
      }
      
      // Xóa text
      const inCartText = productCard.querySelector('.in-cart-text');
      if (inCartText) {
        inCartText.remove();
      }
    }
    
    showNotification("Đã xóa sản phẩm khỏi giỏ hàng");
  }
  
  // Cập nhật số lượng
  function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex >= 0) {
      cart[itemIndex].quantity = newQuantity;
      updateCart();
      updateProductUI(productId);
    }
  }
  
  // Cập nhật giỏ hàng
  function updateCart() {
    // Cập nhật số lượng trên icon
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
    
    // Cập nhật modal giỏ hàng nếu đang mở
    if (cartModal && cartModal.classList.contains('active')) {
      updateCartModal();
    }
  }
  
  // Cập nhật modal giỏ hàng
  function updateCartModal() {
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Giỏ hàng của bạn đang trống</p>';
      updateCartSummary(0, 0);
      return;
    }
    
    let subtotal = 0;
    
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="cart-item-price">${formatPrice(item.price)}</p>
          <div class="cart-item-quantity">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      cartItemsContainer.appendChild(cartItem);
    });
    
    // Tính phí vận chuyển
    const shipping = subtotal > 2000000 ? 0 : 30000;
    const total = subtotal + shipping;
    
    updateCartSummary(subtotal, shipping, total);
    
    // Thêm sự kiện
    document.querySelectorAll('.cart-item-remove').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        removeFromCart(productId);
      });
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const item = cart.find(item => item.id === productId);
        if (item) {
          updateCartItemQuantity(productId, item.quantity - 1);
        }
      });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const item = cart.find(item => item.id === productId);
        if (item) {
          updateCartItemQuantity(productId, item.quantity + 1);
        }
      });
    });
  }
  
  // Cập nhật tổng kết giỏ hàng
  function updateCartSummary(subtotal, shipping, total) {
    const summaryRows = document.querySelectorAll('.summary-row .price');
    if (summaryRows.length >= 3) {
      summaryRows[0].textContent = formatPrice(subtotal);
      summaryRows[1].textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
      summaryRows[2].textContent = formatPrice(total);
    }
  }
  
  // ============================================
  // 7. ORDER FUNCTIONS (INTEGRATED WITH BACKEND)
  // ============================================
  
  // Xử lý đặt hàng
  async function handleOrder(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
      showNotification("Giỏ hàng của bạn đang trống", "error");
      return;
    }
    
    const name = document.getElementById('orderName').value;
    const phone = document.getElementById('orderPhone').value;
    const email = document.getElementById('orderEmail').value;
    const address = document.getElementById('orderAddress').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const notes = document.getElementById('orderNote').value;
    
    // Validation
    if (!name || !phone || !email || !address) {
      showNotification("Vui lòng nhập đầy đủ thông tin bắt buộc", "warning");
      return;
    }
    
    // Chuẩn bị dữ liệu đơn hàng
    const orderData = {
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      customer: {
        name: name,
        phone: phone,
        email: email,
        address: address,
        notes: notes
      },
      totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
      paymentMethod: payment,
      notes: notes
    };
    
    try {
      // Hiển thị loading
      showNotification("Đang xử lý đơn hàng...", "info");
      
      // Gửi đến backend
      const result = await apiService.createOrder(orderData);
      
      if (result.success) {
        // Xóa giỏ hàng
        cart = [];
        updateCart();
        
        // Đóng modal đặt hàng
        closeModal(orderModal);
        
        // Hiển thị modal thành công với thông tin chi tiết
        showSuccessModal(result);
        
        // Log cho debugging
        console.log('🎉 Order created successfully:', result);
      } else {
        showNotification(`Lỗi: ${result.error || 'Không thể tạo đơn hàng'}`, "error");
      }
      
    } catch (error) {
      console.error('Order error:', error);
      showNotification(`Lỗi đặt hàng: ${error.message}`, "error");
    }
  }
  
  // Hiển thị modal thành công
  function showSuccessModal(result) {
    const successModal = document.getElementById('successModal');
    
    // Cập nhật nội dung modal
    successModal.innerHTML = `
      <div class="modal-content success-modal">
        <div class="modal-body">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>Đặt Hàng Thành Công!</h2>
          
          <div class="order-details">
            <p><strong>Mã đơn hàng:</strong> ${result.data.orderNumber}</p>
            <p><strong>Khách hàng:</strong> ${result.data.customerName}</p>
            <p><strong>Tổng tiền:</strong> ${formatPrice(result.data.totalAmount)}</p>
            <p><strong>Trạng thái:</strong> ${result.data.status === 'pending' ? 'Chờ xác nhận' : result.data.status}</p>
            ${result.data.estimatedDelivery ? `<p><strong>Dự kiến giao hàng:</strong> ${result.data.estimatedDelivery}</p>` : ''}
          </div>
          
          <p>Cảm ơn bạn đã đặt hàng. ${
            result.demo 
              ? '(Chế độ demo - Đơn hàng chưa được lưu trữ)' 
              : 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận.'
          }</p>
          
          <button class="btn-primary" id="closeSuccess">Tiếp tục mua sắm</button>
          ${result.demo ? '<p class="demo-note"><small>⚠️ Đang chạy ở chế độ demo. Kết nối backend để lưu đơn hàng thật.</small></p>' : ''}
        </div>
      </div>
    `;
    
    // Hiển thị modal
    openModal(successModal);
    
    // Thêm sự kiện cho nút đóng
    document.getElementById('closeSuccess').addEventListener('click', () => {
      closeModal(successModal);
    });
  }
  
  // ============================================
  // 8. AUTH FUNCTIONS
  // ============================================
  
  // Xử lý đăng nhập
  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
      showNotification("Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }
    
    // Lưu thông tin (demo)
    localStorage.setItem('velora_user_email', email);
    localStorage.setItem('velora_user_name', email.split('@')[0]);
    
    // Cập nhật icon user
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
      userBtn.innerHTML = '<i class="fas fa-user-check"></i>';
    }
    
    showNotification("Đăng nhập thành công!", "success");
    closeModal(loginModal);
  }
  
  // Xử lý đăng ký
  function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      showNotification("Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }
    
    if (password !== confirmPassword) {
      showNotification("Mật khẩu xác nhận không khớp", "error");
      return;
    }
    
    // Lưu thông tin (demo)
    localStorage.setItem('velora_user_name', name);
    localStorage.setItem('velora_user_email', email);
    localStorage.setItem('velora_user_phone', phone);
    
    // Cập nhật icon user
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
      userBtn.innerHTML = '<i class="fas fa-user-check"></i>';
    }
    
    showNotification("Đăng ký thành công! Bạn đã được đăng nhập.", "success");
    closeModal(registerModal);
  }
  
  // Hiển thị menu tài khoản
  function showAccountMenu() {
    const userName = localStorage.getItem('velora_user_name') || 'Khách hàng';
    const userEmail = localStorage.getItem('velora_user_email') || '';
    
    const accountMenu = document.createElement('div');
    accountMenu.className = 'modal active';
    accountMenu.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Tài khoản của tôi</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body account-menu">
          <div class="account-info">
            <div class="account-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="account-details">
              <h3>${userName}</h3>
              <p>${userEmail}</p>
            </div>
          </div>
          <div class="account-actions">
            <button class="account-action-btn" id="viewOrders">
              <i class="fas fa-box"></i>
              <span>Đơn hàng của tôi</span>
            </button>
            <button class="account-action-btn" id="viewFavorites">
              <i class="fas fa-heart"></i>
              <span>Sản phẩm yêu thích</span>
            </button>
            <button class="account-action-btn" id="logoutBtn">
              <i class="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(accountMenu);
    
    // Sự kiện đóng
    accountMenu.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(accountMenu);
    });
    
    // Đóng khi click bên ngoài
    accountMenu.addEventListener('click', (e) => {
      if (e.target === accountMenu) {
        document.body.removeChild(accountMenu);
      }
    });
    
    // Đăng xuất
    accountMenu.querySelector('#logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('velora_user_name');
      localStorage.removeItem('velora_user_email');
      localStorage.removeItem('velora_user_phone');
      
      // Reset icon user
      const userBtn = document.getElementById('user-btn');
      if (userBtn) {
        userBtn.innerHTML = '<i class="fas fa-user"></i>';
      }
      
      showNotification("Đã đăng xuất");
      document.body.removeChild(accountMenu);
    });
    
    // Xem đơn hàng
    accountMenu.querySelector('#viewOrders').addEventListener('click', () => {
      showNotification("Tính năng đang phát triển", "info");
    });
    
    // Xem yêu thích
    accountMenu.querySelector('#viewFavorites').addEventListener('click', () => {
      const favorites = JSON.parse(localStorage.getItem('velora_favorites')) || [];
      showNotification(`Bạn có ${favorites.length} sản phẩm yêu thích`, "info");
    });
  }
  
  // ============================================
  // 9. EVENT HANDLERS & INITIALIZATION
  // ============================================
  
  // Khởi tạo sự kiện
  function initEvents() {
    // Menu hamburger
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        if (navMenu) navMenu.classList.toggle('active');
      });
    }
    
    // Đóng menu khi click link
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
      });
    });
    
    // Nút user
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
      userBtn.addEventListener('click', () => {
        if (localStorage.getItem('velora_user_email')) {
          showAccountMenu();
        } else {
          openModal(loginModal);
        }
      });
    }
    
    // Nút giỏ hàng
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        updateCartModal();
        openModal(cartModal);
      });
    }
    
    // Đóng modal
    closeModalButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
      });
    });
    
    // Đóng modal khi click bên ngoài
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });
    
    // Chuyển đổi giữa login/register
    if (showRegisterBtn) {
      showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(registerModal);
      });
    }
    
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(registerModal);
        openModal(loginModal);
      });
    }
    
    // Form đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    // Form đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }
    
    // Nút thanh toán
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
          showNotification("Giỏ hàng của bạn đang trống", "warning");
          closeModal(cartModal);
          return;
        }
        
        closeModal(cartModal);
        openModal(orderModal);
        
        // Điền thông tin nếu đã đăng nhập
        if (localStorage.getItem('velora_user_email')) {
          document.getElementById('orderName').value = localStorage.getItem('velora_user_name') || '';
          document.getElementById('orderEmail').value = localStorage.getItem('velora_user_email') || '';
          document.getElementById('orderPhone').value = localStorage.getItem('velora_user_phone') || '';
        }
      });
    }
    
    // Form đặt hàng
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
      orderForm.addEventListener('submit', handleOrder);
    }
    
    // Nút đóng success modal
    if (closeSuccessBtn) {
      closeSuccessBtn.addEventListener('click', () => {
        closeModal(successModal);
      });
    }
    
    // Nút tìm kiếm
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        showNotification("Tính năng tìm kiếm đang được phát triển", "info");
      });
    }
    
    // Nút tải thêm sản phẩm
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.style.display = 'none';
        showNotification("Đã hiển thị tất cả sản phẩm nổi bật", "info");
      });
    }
    
    // Test backend connection button (thêm nếu cần)
    const testBackendBtn = document.createElement('button');
    testBackendBtn.id = 'testBackendBtn';
    testBackendBtn.innerHTML = '<i class="fas fa-server"></i>';
    testBackendBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #8B7355;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      display: ${backendAvailable ? 'block' : 'none'};
    `;
    document.body.appendChild(testBackendBtn);
    
    testBackendBtn.addEventListener('click', async () => {
      const result = await apiService.testKV();
      if (result) {
        showNotification(`KV Storage: ${result.message}`, "success");
        console.log('KV Test Result:', result);
      } else {
        showNotification("Không thể test backend", "error");
      }
    });
  }
  
  // Hiệu ứng scroll header
  function initScrollEffect() {
    window.addEventListener('scroll', function() {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 100) {
          header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        } else {
          header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
      }
    });
  }
  
  // ============================================
  // 10. KHỞI CHẠY ỨNG DỤNG
  // ============================================
  
  async function initApp() {
    console.log('🚀 Khởi động Velora Fashion...');
    
    // Khởi tạo API service
    apiService = new VeloraAPI();
    backendAvailable = await apiService.init();
    
    // Khởi tạo sản phẩm
    await initProducts();
    
    // Khởi tạo sự kiện
    initEvents();
    
    // Cập nhật giỏ hàng
    updateCart();
    
    // Kiểm tra đăng nhập
    if (localStorage.getItem('velora_user_email')) {
      const userBtn = document.getElementById('user-btn');
      if (userBtn) {
        userBtn.innerHTML = '<i class="fas fa-user-check"></i>';
      }
    }
    
    // Hiệu ứng scroll
    initScrollEffect();
    
    // Hiển thị thông báo khởi động
    setTimeout(() => {
      if (backendAvailable) {
        showNotification('Velora Fashion đã sẵn sàng!', 'success');
      } else {
        showNotification('Đang chạy ở chế độ demo', 'warning');
      }
    }, 1000);
    
    console.log('✅ Ứng dụng đã sẵn sàng!');
  }
  
  // Khởi chạy ứng dụng
  await initApp();
});
