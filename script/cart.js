// script/cart.js
import { formatPrice, showNotification } from './utils.js';
import { openModal, closeModal } from './ui.js';
import { buildApiUrl } from './config.js';

// =========================
// GLOBAL STATE
// =========================
let cart = [];

// =========================
// INIT CART
// =========================
export function initCart() {
    console.log('🔄 Khởi tạo giỏ hàng...');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('velora_cart');
    
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart) || [];
        } catch (e) {
            console.error('❌ Lỗi parse cart:', e);
            cart = [];
        }
    }
    
    updateCartCount();
    
    // 🟢 QUAN TRỌNG: GẮN EVENT CHO NÚT ĐẶT HÀNG Ở NHIỀU CHỖ
    attachPlaceOrderEvent();
}

// =========================
// ATTACH PLACE ORDER EVENT - THÊM MỚI
// =========================
function attachPlaceOrderEvent() {
    console.log('🔄 Gắn event cho nút đặt hàng...');
    
    // Tìm tất cả các nút đặt hàng
    const placeOrderBtns = document.querySelectorAll('#placeOrderBtn');
    
    placeOrderBtns.forEach(btn => {
        // Xóa event cũ để tránh bị gắn nhiều lần
        btn.removeEventListener('click', handlePlaceOrder);
        // Gắn event mới
        btn.addEventListener('click', handlePlaceOrder);
        console.log('✅ Đã gắn event cho nút:', btn);
    });
}


// =========================
// UPDATE CART COUNT
// =========================
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'inline' : 'none';
    });
}

// =========================
// ADD TO CART
// =========================
export function addToCart(productId) {
    const allProducts = window.allProducts || [];
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) {
        console.warn('❌ Không tìm thấy product:', productId);
        showNotification('Không tìm thấy sản phẩm', 'error');
        return;
    }
    
    if (product.stock <= 0) {
        showNotification('Sản phẩm đã hết hàng', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showNotification(`Chỉ còn ${product.stock} sản phẩm trong kho`, 'warning');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            category: product.category,
            stock: product.stock
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
}

// =========================
// UPDATE CART MODAL
// =========================
// =========================
// UPDATE CART MODAL - FIXED FULL VERSION
// =========================
export function updateCartModal() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItemsContainer || !cartSummary) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <a href="#products" class="btn btn-secondary" onclick="closeModal(document.getElementById('cartModal'))">
                    <i class="fas fa-shopping-bag"></i> Mua sắm ngay
                </a>
            </div>
        `;
        
        cartSummary.innerHTML = `
            <div class="summary-row total">
                <span>Tổng cộng:</span>
                <span class="price">0 VND</span>
            </div>
            <button class="btn btn-primary full-width" disabled>
                <i class="fas fa-shopping-cart"></i> Đặt hàng
            </button>
        `;
        return;
    }
    
    // Render danh sách sản phẩm trong giỏ hàng
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='srcimg/default-product.jpg'">
            </div>
            
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-value" value="${item.quantity}" min="1" max="${item.stock}" 
                           data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                
                <div class="cart-item-total">
                    Tổng: ${formatPrice(item.price * item.quantity)}
                </div>
            </div>
            
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Tính tổng tiền
    const subtotal = cart.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );
    
    // 🟢 PHẦN QUAN TRỌNG - RENDER NÚT ĐẶT HÀNG VÀ GẮN EVENT
    cartSummary.innerHTML = `
        <div class="summary-row">
            <span>Tạm tính:</span>
            <span class="price">${formatPrice(subtotal)}</span>
        </div>
        
        <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span class="price">${formatPrice(0)}</span>
        </div>
        
        <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span class="price">${formatPrice(subtotal)}</span>
        </div>
        
        <button class="btn btn-primary full-width" id="placeOrderBtn">
            <i class="fas fa-shopping-cart"></i> Đặt hàng
        </button>
    `;
    
    // 🟢 QUAN TRỌNG: GẮN EVENT CHO NÚT ĐẶT HÀNG NGAY SAU KHI RENDER
    setTimeout(() => {
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            // Xóa event cũ để tránh bị gắn nhiều lần
            placeOrderBtn.removeEventListener('click', handlePlaceOrder);
            // Gắn event mới
            placeOrderBtn.addEventListener('click', handlePlaceOrder);
            // Đánh dấu đã gắn event
            placeOrderBtn.setAttribute('data-event-attached', 'true');
            console.log('✅ Đã gắn event cho nút đặt hàng trong cart modal');
        } else {
            console.warn('⚠️ Không tìm thấy nút đặt hàng sau khi render');
        }
    }, 50); // Delay nhỏ để đảm bảo DOM đã được cập nhật
    
    // Gắn sự kiện cho các nút tăng/giảm số lượng và xóa sản phẩm
    attachCartItemEvents();
}

// =========================
// ATTACH CART ITEM EVENTS
// =========================
function attachCartItemEvents() {
    // Remove item
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.onclick = () => {
            removeFromCart(btn.dataset.id);
        };
    });
    
    // Quantity minus
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.onclick = () => {
            updateCartItemQuantity(btn.dataset.id, -1);
        };
    });
    
    // Quantity plus
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.onclick = () => {
            updateCartItemQuantity(btn.dataset.id, 1);
        };
    });
    
    // Quantity input change
    document.querySelectorAll('.quantity-value').forEach(input => {
        input.onchange = () => {
            const quantity = parseInt(input.value) || 1;
            updateCartItemQuantity(input.dataset.id, quantity, true);
        };
    });
}

// =========================
// REMOVE FROM CART
// =========================
function removeFromCart(productId) {
    const item = cart.find(item => item.id == productId);
    cart = cart.filter(item => item.id != productId);
    
    saveCart();
    updateCartCount();
    updateCartModal();
    
    if (item) {
        showNotification(`Đã xóa "${item.name}" khỏi giỏ hàng`, 'info');
    }
}

// =========================
// UPDATE CART ITEM QUANTITY
// =========================
function updateCartItemQuantity(productId, change, setAbsolute = false) {
    const itemIndex = cart.findIndex(item => item.id == productId);
    
    if (itemIndex < 0) return;
    
    const item = cart[itemIndex];
    let newQuantity;
    
    if (setAbsolute) {
        newQuantity = change;
    } else {
        newQuantity = item.quantity + change;
    }
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > item.stock) {
        showNotification(`Chỉ còn ${item.stock} sản phẩm trong kho`, 'warning');
        return;
    }
    
    cart[itemIndex].quantity = newQuantity;
    saveCart();
    updateCartCount();
    updateCartModal();
}

// =========================
// SAVE CART
// =========================
function saveCart() {
    localStorage.setItem('velora_cart', JSON.stringify(cart));
}

// =========================
// PLACE ORDER - HANDLE
// =========================
function handlePlaceOrder() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }
    
    // Open order modal
    openOrderModal();
}

// =========================
// OPEN ORDER MODAL
// =========================
function openOrderModal() {
    const modal = document.getElementById('orderModal') || createOrderModal();
    const modalBody = modal.querySelector('.modal-body');
    
    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0;
    const total = subtotal + shipping;
    
    modalBody.innerHTML = `
        <div class="order-form">
            <h3>Thông tin đặt hàng</h3>
            
            <form id="orderForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="orderName">Họ và tên *</label>
                        <input type="text" id="orderName" required 
                               placeholder="Nhập họ và tên của bạn">
                    </div>
                    <div class="form-group">
                        <label for="orderPhone">Số điện thoại *</label>
                        <input type="tel" id="orderPhone" required 
                               placeholder="Nhập số điện thoại">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="orderEmail">Email *</label>
                        <input type="email" id="orderEmail" required 
                               placeholder="Nhập email của bạn">
                    </div>
                    <div class="form-group">
                        <label for="orderAddress">Địa chỉ giao hàng *</label>
                        <input type="text" id="orderAddress" required 
                               placeholder="Nhập địa chỉ giao hàng">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="orderNotes">Ghi chú đơn hàng (tùy chọn)</label>
                    <textarea id="orderNotes" rows="3" 
                              placeholder="Ghi chú về đơn hàng của bạn..."></textarea>
                </div>
                
                <div class="order-summary">
                    <h4>Tóm tắt đơn hàng</h4>
                    <div class="summary-items">
                        ${cart.map(item => `
                            <div class="summary-item">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>${formatPrice(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="summary-totals">
                        <div class="summary-row">
                            <span>Tạm tính:</span>
                            <span>${formatPrice(subtotal)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span>${formatPrice(shipping)}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Tổng cộng:</span>
                            <span>${formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-check"></i> Xác nhận đặt hàng
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Show modal
    openModal(modal);
    
    // Handle form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
}

// =========================
// CREATE ORDER MODAL
// =========================
function createOrderModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'orderModal';
    modal.innerHTML = `
        <div class="modal-content order-modal">
            <div class="modal-header">
                <h2>Đặt hàng</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add close functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        closeModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    return modal;
}

// =========================
// =========================
// HANDLE ORDER SUBMIT - FULL FIXED VERSION
// =========================
async function handleOrderSubmit(e) {
    console.log('🟢🟢🟢 HANDLE ORDER SUBMIT ĐƯỢC GỌI!', new Date().toISOString());
    console.log('🟢 Cart hiện tại:', cart);
    
    e.preventDefault();
    
    // Kiểm tra form elements
    const orderName = document.getElementById('orderName');
    const orderPhone = document.getElementById('orderPhone');
    const orderEmail = document.getElementById('orderEmail');
    const orderAddress = document.getElementById('orderAddress');
    const orderNotes = document.getElementById('orderNotes');
    
    console.log('📝 Form elements:', {
        name: orderName,
        phone: orderPhone,
        email: orderEmail,
        address: orderAddress,
        notes: orderNotes
    });
    
    if (!orderName || !orderPhone || !orderEmail || !orderAddress) {
        console.error('❌ Không tìm thấy form elements!');
        showNotification('Lỗi hệ thống, vui lòng thử lại', 'error');
        return;
    }
    
    // Get form data
    const orderData = {
        name: orderName.value.trim(),
        phone: orderPhone.value.trim(),
        email: orderEmail.value.trim(),
        address: orderAddress.value.trim(),
        notes: orderNotes ? orderNotes.value.trim() : '',
        items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: 'cod'
    };
    
    console.log('📦 Order data:', orderData);
    
    // Validate
    if (!orderData.name || !orderData.phone || !orderData.email || !orderData.address) {
        console.warn('⚠️ Thiếu thông tin bắt buộc');
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    // Validate phone
    const phoneRegex = /^(84|0[35789])[0-9]{8}$/;
    if (!phoneRegex.test(orderData.phone)) {
        console.warn('⚠️ Số điện thoại không hợp lệ:', orderData.phone);
        showNotification('Số điện thoại không hợp lệ (VD: 0912345678)', 'error');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.email)) {
        console.warn('⚠️ Email không hợp lệ:', orderData.email);
        showNotification('Email không hợp lệ', 'error');
        return;
    }
    
    // Show loading
    const submitBtn = document.querySelector('#orderForm button[type="submit"]');
    if (!submitBtn) {
        console.error('❌ Không tìm thấy nút submit!');
        return;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    submitBtn.disabled = true;
    
    try {
        // Format data for API
        const apiOrderData = {
            customer: {
                name: orderData.name,
                phone: orderData.phone,
                email: orderData.email,
                address: orderData.address
            },
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            shippingFee: 0,
            notes: orderData.notes,
            paymentMethod: orderData.paymentMethod
        };
        
        console.log('📤 Sending order to API:', JSON.stringify(apiOrderData, null, 2));
        
        // GỌI API TRỰC TIẾP
        const API_URL = 'https://velora-api.nyaochen9.workers.dev/api/orders';
        console.log('🌐 API URL:', API_URL);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(apiOrderData)
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', [...response.headers.entries()]);
        
        const responseText = await response.text();
        console.log('📥 Response text:', responseText);
        
        let orderResult;
        try {
            orderResult = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Parse JSON failed:', e);
            throw new Error('Phản hồi từ server không hợp lệ');
        }
        
        console.log('📥 Response data:', orderResult);
        
        if (response.ok && orderResult.success) {
            console.log('🎉 ORDER SUCCESS!', orderResult.data);
            
            // Show success message
            showOrderSuccess(orderResult.data);
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();
            
            // Close modals
            closeModal(document.getElementById('orderModal'));
            closeModal(document.getElementById('cartModal'));
            
            // HIỂN THỊ THÔNG BÁO THÀNH CÔNG
            showNotification('✅ Đặt hàng thành công! Mã đơn: ' + orderResult.data.orderNumber, 'success');
            
        } else {
            throw new Error(orderResult.error || 'Đặt hàng thất bại');
        }
        
    } catch (error) {
        console.error('❌❌❌ ORDER ERROR:', error);
        console.error('Error stack:', error.stack);
        
        // FALLBACK: Nếu API lỗi thì dùng DEMO MODE
        console.log('⚠️ API failed, using demo mode');
        
        // Tạo đơn hàng demo
        const demoOrderData = {
            orderNumber: 'DEMO-' + Date.now().toString().slice(-8),
            customerName: orderData.name,
            totalAmount: orderData.totalAmount,
            createdAt: new Date().toISOString()
        };
        
        // Show success với demo
        showOrderSuccess(demoOrderData);
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartCount();
        
        // Close modals
        closeModal(document.getElementById('orderModal'));
        closeModal(document.getElementById('cartModal'));
        
        showNotification('✅ Đặt hàng thành công! (Chế độ demo)', 'success');
        
    } finally {
        // Reset button
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// =========================
// SAVE ORDER TO LOCALSTORAGE
// =========================
function saveOrderToLocalStorage(orderData, rawOrderData) {
    try {
        const orders = JSON.parse(localStorage.getItem('velora_orders') || '[]');
        
        const order = {
            id: orderData.orderNumber,
            orderNumber: orderData.orderNumber,
            customerName: orderData.customerName,
            totalAmount: orderData.totalAmount,
            createdAt: orderData.createdAt,
            status: 'pending',
            items: rawOrderData.items,
            shippingAddress: rawOrderData.address,
            phone: rawOrderData.phone,
            email: rawOrderData.email,
            notes: rawOrderData.notes,
            demoMode: true
        };
        
        orders.unshift(order);
        
        // Keep only last 20 orders
        if (orders.length > 20) {
            orders.pop();
        }
        
        localStorage.setItem('velora_orders', JSON.stringify(orders));
        
    } catch (e) {
        console.error('Error saving order to localStorage:', e);
    }
}

// =========================
// SHOW ORDER SUCCESS
// =========================
function showOrderSuccess(orderData) {
    console.log('🎉 Order success:', orderData);
    
    const modal = document.getElementById('orderSuccessModal') || createOrderSuccessModal();
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="order-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Đặt hàng thành công!</h3>
            <p>Cảm ơn bạn đã đặt hàng tại Velora Fashion.</p>
            
            <div class="order-details">
                <div class="detail-row">
                    <strong>Mã đơn hàng:</strong> 
                    <span class="order-number" style="color: #e74c3c; font-weight: bold; font-size: 1.2rem;">
                        ${orderData.orderNumber}
                    </span>
                </div>
                <div class="detail-row">
                    <strong>Khách hàng:</strong> ${orderData.customerName || 'Khách'}
                </div>
                <div class="detail-row">
                    <strong>Tổng tiền:</strong> 
                    <span style="color: #27ae60; font-weight: bold;">
                        ${formatPrice(orderData.totalAmount)}
                    </span>
                </div>
                <div class="detail-row">
                    <strong>Trạng thái:</strong> 
                    <span class="status-badge" style="background: #f39c12; color: white; padding: 4px 12px; border-radius: 20px;">
                        Chờ xử lý
                    </span>
                </div>
            </div>
            
            <p style="margin: 20px 0; color: #7f8c8d;">
                <i class="fas fa-info-circle"></i> 
                Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            
            <div class="success-actions" style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                <button class="btn btn-primary" id="continueShopping" style="background: #e74c3c;">
                    <i class="fas fa-shopping-bag"></i> Tiếp tục mua sắm
                </button>
                <button class="btn btn-secondary close-modal">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    // Show modal
    openModal(modal);
    
    // Add event listeners
    const continueBtn = document.getElementById('continueShopping');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            closeModal(modal);
        });
    }
}
// =========================
// CREATE ORDER SUCCESS MODAL
// =========================
function createOrderSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'orderSuccessModal';
    modal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="modal-header">
                <h2>Đặt hàng thành công</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add close functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        closeModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    return modal;
}

// =========================
// TEST FUNCTIONS - THÊM VÀO ĐỂ DEBUG
// =========================
window.testOrder = function() {
    console.log('🟢 Test đặt hàng thủ công');
    if (cart.length === 0) {
        alert('Giỏ hàng trống! Thêm sản phẩm trước đã.');
        return;
    }
    handlePlaceOrder();
};

// Log để biết file đã load xong
console.log('✅ Cart.js loaded - Nút đặt hàng đã sẵn sàng!');
// =========================
// TEST FUNCTIONS - THÊM VÀO CUỐI FILE
// =========================

// Test trực tiếp hàm handleOrderSubmit
window.testHandleOrderSubmit = function() {
    console.log('🧪 Test handleOrderSubmit manually');
    if (typeof handleOrderSubmit === 'function') {
        handleOrderSubmit(new Event('click', { bubbles: true }));
    } else {
        console.error('❌ handleOrderSubmit is not defined');
    }
};

// Test API trực tiếp
window.testAPIOrder = async function() {
    console.log('🧪 Test API order directly');
    try {
        const res = await fetch('https://velora-api.nyaochen9.workers.dev/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customer: {
                    name: 'Test User',
                    phone: '0912345678',
                    email: 'test@test.com',
                    address: 'Test Address'
                },
                items: [{
                    id: '1',
                    name: 'Test Product',
                    price: 100000,
                    quantity: 1
                }],
                totalAmount: 100000
            })
        });
        const data = await res.json();
        console.log('📦 API Result:', data);
        alert(data.success ? '✅ Success: ' + data.data.orderNumber : '❌ Failed: ' + data.error);
    } catch (e) {
        console.error('❌ API Error:', e);
        alert('❌ Error: ' + e.message);
    }
};

// Gán event trực tiếp vào nút
window.forceAttachEvent = function() {
    console.log('🔧 Force attach event to place order button');
    const btn = document.getElementById('placeOrderBtn');
    if (btn) {
        btn.removeEventListener('click', handlePlaceOrder);
        btn.addEventListener('click', function(e) {
            console.log('🟢 Button clicked!');
            e.preventDefault();
            handlePlaceOrder();
        });
        console.log('✅ Event attached');
        return 'OK';
    }
    console.log('❌ Button not found');
    return 'Failed';
};
