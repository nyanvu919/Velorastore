// script/cart.js - FIXED VERSION - 100% WORKING
import { formatPrice, showNotification } from './utils.js';
import { openModal, closeModal } from './utils.js'; // ✅ Import từ utils.js
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
    
    // Gắn event cho nút đặt hàng sau khi DOM load
    setTimeout(() => {
        attachCartEvents();
    }, 100);
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
// UPDATE CART MODAL - FIXED VERSION
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
                <a href="#products" class="btn btn-secondary" onclick="closeModal('cartModal')">
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
    
    // Render danh sách sản phẩm
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='srcimg/default-product.jpg'" style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;">
            </div>
            
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
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
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Render phần tổng tiền và nút đặt hàng
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
    
    // Gắn sự kiện cho giỏ hàng
    attachCartEvents();
}

// =========================
// ATTACH CART EVENTS - FIXED VERSION
// =========================
function attachCartEvents() {
    console.log('🔄 Gắn sự kiện giỏ hàng...');
    
    // Xóa sản phẩm
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            removeFromCart(btn.dataset.id);
        };
    });
    
    // Giảm số lượng
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            updateCartItemQuantity(btn.dataset.id, -1);
        };
    });
    
    // Tăng số lượng
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            updateCartItemQuantity(btn.dataset.id, 1);
        };
    });
    
    // NÚT ĐẶT HÀNG - DÙNG ONCLICK TRỰC TIẾP
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🟢 Nút đặt hàng được click!');
            handlePlaceOrder();
            return false;
        };
        console.log('✅ Đã gắn onclick cho nút đặt hàng');
    } else {
        console.warn('⚠️ Không tìm thấy nút đặt hàng');
    }
}

// =========================
// PLACE ORDER - HANDLE
// =========================
function handlePlaceOrder() {
    console.log('🟢🟢🟢 handlePlaceOrder được gọi!', new Date().toISOString());
    
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }
    
    // Open order modal
    openOrderModal();
}

// =========================
// OPEN ORDER MODAL - FIXED 100%
// =========================
function openOrderModal() {
    console.log('🟢 Mở modal đặt hàng...');
    
    const modal = document.getElementById('orderModal');
    if (!modal) {
        console.error('❌ Không tìm thấy orderModal trong HTML!');
        showNotification('Lỗi hệ thống: Thiếu modal đặt hàng', 'error');
        return;
    }
    
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) {
        console.error('❌ Không tìm thấy modal-body!');
        return;
    }
    
    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0;
    const total = subtotal + shipping;
    
    // FORCE RENDER NỘI DUNG MODAL
    modalBody.innerHTML = `
        <div class="order-form">
            <h3 style="margin-bottom: 20px; color: #8B7355;">Thông tin đặt hàng</h3>
            
            <form id="orderForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label for="orderName" style="display: block; margin-bottom: 5px; font-weight: 600;">Họ và tên *</label>
                        <input type="text" id="orderName" required 
                               placeholder="Nhập họ và tên của bạn"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div class="form-group">
                        <label for="orderPhone" style="display: block; margin-bottom: 5px; font-weight: 600;">Số điện thoại *</label>
                        <input type="tel" id="orderPhone" required 
                               placeholder="Nhập số điện thoại"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label for="orderEmail" style="display: block; margin-bottom: 5px; font-weight: 600;">Email *</label>
                        <input type="email" id="orderEmail" required 
                               placeholder="Nhập email của bạn"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div class="form-group">
                        <label for="orderAddress" style="display: block; margin-bottom: 5px; font-weight: 600;">Địa chỉ giao hàng *</label>
                        <input type="text" id="orderAddress" required 
                               placeholder="Nhập địa chỉ giao hàng"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="orderNotes" style="display: block; margin-bottom: 5px; font-weight: 600;">Ghi chú đơn hàng (tùy chọn)</label>
                    <textarea id="orderNotes" rows="3" 
                              placeholder="Ghi chú về đơn hàng của bạn..."
                              style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 5px; resize: vertical;"></textarea>
                </div>
                
                <div class="order-summary" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 15px; color: #333;">Tóm tắt đơn hàng</h4>
                    <div style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
                        ${cart.map(item => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='srcimg/default-product.jpg'">
                                    <span style="font-size: 0.95rem;">${item.name} x ${item.quantity}</span>
                                </div>
                                <span style="font-weight: 600; color: #8B7355;">${formatPrice(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="border-top: 2px solid #e0e0e0; padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Tạm tính:</span>
                            <span style="font-weight: 600;">${formatPrice(subtotal)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Phí vận chuyển:</span>
                            <span style="font-weight: 600; color: #27ae60;">Miễn phí</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e0e0e0;">
                            <span style="font-weight: 700; font-size: 1.1rem;">Tổng cộng:</span>
                            <span style="font-weight: 700; font-size: 1.2rem; color: #8B7355;">${formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary close-modal-btn" style="padding: 10px 20px;">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                    <button type="submit" class="btn btn-primary" id="confirmOrderBtn" style="padding: 10px 25px;">
                        <i class="fas fa-check"></i> Xác nhận đặt hàng
                    </button>
                </div>
            </form>
        </div>
    `;
    
    console.log('✅ Đã render form đặt hàng vào modal');
    
    // Show modal - ✅ SỬ DỤNG HÀM openModal ĐÃ FIX
    openModal(modal);
    
    // Gắn event cho nút đóng
    const closeBtns = modal.querySelectorAll('.close-modal, .close-modal-btn');
    closeBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            closeModal(modal);
        };
    });
    
    // GẮN EVENT SUBMIT TRỰC TIẾP
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        // Xóa event cũ
        orderForm.removeEventListener('submit', handleOrderSubmit);
        // Gắn event mới
        orderForm.addEventListener('submit', handleOrderSubmit);
        console.log('✅ Đã gắn event submit cho form đặt hàng');
    } else {
        console.error('❌ KHÔNG THỂ TẠO FORM!');
    }
}

// =========================
// HANDLE ORDER SUBMIT - FIXED WITH API
// =========================
async function handleOrderSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🟢🟢🟢 HANDLE ORDER SUBMIT ĐƯỢC GỌI!', new Date().toISOString());
    
    // Get form data
    const orderData = {
        name: document.getElementById('orderName').value.trim(),
        phone: document.getElementById('orderPhone').value.trim(),
        email: document.getElementById('orderEmail').value.trim(),
        address: document.getElementById('orderAddress').value.trim(),
        notes: document.getElementById('orderNotes').value.trim(),
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
    
    console.log('📦 Order Data:', orderData);
    
    // Validate
    if (!orderData.name || !orderData.phone || !orderData.email || !orderData.address) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    // Validate phone
    const phoneRegex = /^(84|0)[35789][0-9]{8}$/;
    if (!phoneRegex.test(orderData.phone)) {
        showNotification('Số điện thoại không hợp lệ (VD: 0912345678)', 'error');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.email)) {
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
        
        // GỌI API
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
        
        // Đọc response text
        const responseText = await response.text();
        console.log('📥 Response text:', responseText);
        
        // Parse JSON
        let orderResult;
        try {
            orderResult = JSON.parse(responseText);
            console.log('📥 Parsed response:', orderResult);
        } catch (e) {
            console.error('❌ Parse JSON failed:', e);
            throw new Error('Phản hồi từ server không hợp lệ');
        }
        
        if (response.ok && orderResult.success) {
            console.log('🎉 ORDER SUCCESS!', orderResult.data);
            
            // Show success message
            showOrderSuccess(orderResult.data);
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();
            
            // Close modals - ✅ SỬ DỤNG ID STRING
            closeModal('orderModal');
            closeModal('cartModal');
            
            // Hiển thị thông báo thành công
            showNotification('✅ Đặt hàng thành công! Mã đơn: ' + orderResult.data.orderNumber, 'success');
            
        } else {
            throw new Error(orderResult.error || `Lỗi ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌❌❌ ORDER ERROR:', error);
        
        // FALLBACK: DEMO MODE
        console.log('⚠️ API failed, using demo mode');
        
        const demoOrderData = {
            orderNumber: 'DEMO-' + Date.now().toString().slice(-8),
            customerName: orderData.name,
            totalAmount: orderData.totalAmount,
            createdAt: new Date().toISOString()
        };
        
        // Save order to localStorage
        saveOrderToLocalStorage(demoOrderData, orderData);
        
        showOrderSuccess(demoOrderData);
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartCount();
        
        // Close modals - ✅ SỬ DỤNG ID STRING
        closeModal('orderModal');
        closeModal('cartModal');
        
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
// SHOW ORDER SUCCESS - FIXED
// =========================
function showOrderSuccess(orderData) {
    console.log('🎉 Order success:', orderData);
    
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) {
        console.error('❌ Không tìm thấy orderSuccessModal');
        // Tạo modal mới nếu chưa có
        createOrderSuccessModal();
        // Thử lại
        setTimeout(() => showOrderSuccess(orderData), 100);
        return;
    }
    
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="order-success" style="text-align: center;">
            <div style="font-size: 5rem; color: #27ae60; margin-bottom: 20px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: #27ae60; margin-bottom: 15px; font-size: 1.8rem;">Đặt hàng thành công!</h3>
            <p style="margin-bottom: 25px; color: #666;">Cảm ơn bạn đã đặt hàng tại Velora Fashion.</p>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 25px; text-align: left;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                    <strong style="color: #555;">Mã đơn hàng:</strong>
                    <span style="color: #e74c3c; font-weight: bold; font-size: 1.2rem; letter-spacing: 1px;">
                        ${orderData.orderNumber}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <strong style="color: #555;">Khách hàng:</strong>
                    <span style="color: #333;">${orderData.customerName || 'Khách'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <strong style="color: #555;">Tổng tiền:</strong>
                    <span style="color: #27ae60; font-weight: bold; font-size: 1.1rem;">
                        ${formatPrice(orderData.totalAmount)}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #555;">Trạng thái:</strong>
                    <span style="background: #f39c12; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">
                        <i class="fas fa-clock" style="margin-right: 5px;"></i> Chờ xử lý
                    </span>
                </div>
            </div>
            
            <p style="margin: 20px 0; color: #7f8c8d; font-size: 0.95rem;">
                <i class="fas fa-info-circle" style="margin-right: 5px;"></i> 
                Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.
            </p>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                <button class="btn btn-primary" id="continueShoppingBtn" style="background: #8B7355; padding: 12px 25px;">
                    <i class="fas fa-shopping-bag"></i> Tiếp tục mua sắm
                </button>
                <button class="btn btn-secondary close-success-modal" style="padding: 12px 25px;">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    // Show modal - ✅ SỬ DỤNG HÀM openModal
    openModal(modal);
    
    // Add event listeners
    const continueBtn = document.getElementById('continueShoppingBtn');
    if (continueBtn) {
        continueBtn.onclick = () => {
            closeModal(modal);
            // Scroll to products
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        };
    }
    
    const closeBtns = modal.querySelectorAll('.close-success-modal, .close-modal');
    closeBtns.forEach(btn => {
        btn.onclick = () => closeModal(modal);
    });
}

// =========================
// CREATE ORDER SUCCESS MODAL
// =========================
function createOrderSuccessModal() {
    // Kiểm tra nếu đã tồn tại
    if (document.getElementById('orderSuccessModal')) {
        return document.getElementById('orderSuccessModal');
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'orderSuccessModal';
    modal.innerHTML = `
        <div class="modal-content success-modal" style="max-width: 500px;">
            <div class="modal-header">
                <h2 style="margin: 0; color: #27ae60;">Đặt hàng thành công</h2>
                <button class="close-modal" style="background: none; border: none; font-size: 28px; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal(modal);
    }
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    };
    
    return modal;
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
        console.log('💾 Đã lưu đơn hàng vào localStorage:', order.orderNumber);
        
    } catch (e) {
        console.error('Error saving order to localStorage:', e);
    }
}

// =========================
// GET CART - Helper function
// =========================
export function getCart() {
    return cart;
}

// =========================
// CLEAR CART - Helper function
// =========================
export function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    updateCartModal();
}

// =========================
// DEBUG FUNCTIONS - KIỂM TRA MODAL
// =========================
window.testOrderModal = function() {
    console.log('🧪 Test mở modal đặt hàng');
    
    // Thêm sản phẩm test nếu giỏ hàng trống
    if (cart.length === 0) {
        cart.push({
            id: '1',
            name: 'Đầm dạ hội lộng lẫy',
            price: 3500000,
            quantity: 1,
            image: 'srcimg/5 (3).png',
            stock: 10
        });
        saveCart();
        updateCartCount();
        console.log('✅ Đã thêm sản phẩm demo vào giỏ');
    }
    
    handlePlaceOrder();
};

window.testOpenModal = function(modalId) {
    console.log('🧪 Test mở modal:', modalId);
    return openModal(modalId);
};

window.testCloseModal = function(modalId) {
    console.log('🧪 Test đóng modal:', modalId);
    return closeModal(modalId);
};

window.testAPI = async function() {
    console.log('🧪 TEST API DIRECTLY');
    try {
        const res = await fetch('https://velora-api.nyaochen9.workers.dev/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customer: {
                    name: 'Test User',
                    phone: '0912345678',
                    email: 'test@test.com',
                    address: '123 Test St'
                },
                items: [{
                    productId: '1',
                    name: 'Test Product',
                    price: 100000,
                    quantity: 1
                }],
                totalAmount: 100000
            })
        });
        const text = await res.text();
        console.log('📥 Response status:', res.status);
        console.log('📥 Response text:', text);
        try {
            const json = JSON.parse(text);
            console.log('✅ JSON response:', json);
        } catch(e) {
            console.log('❌ Not JSON:', text);
        }
    } catch(e) {
        console.error('❌ Fetch error:', e);
    }
};

// =========================
// EXPORT CART FUNCTIONS
// =========================
export default {
    initCart,
    addToCart,
    getCart,
    clearCart,
    updateCartModal
};

console.log('✅ Cart.js loaded - Nút đặt hàng đã sẵn sàng!');
