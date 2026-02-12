// script/main.js
import { initUI } from './ui.js';
import { initCart } from './cart.js';
import { initProducts } from './products.js';
import { initAuth } from './auth.js';
import { API_CONFIG, buildApiUrl, getApiBaseUrl } from './config.js';

console.log('🚀 Khởi động Velora Fashion...');

// Biến global
window.allProducts = [];
window.cart = [];
window.API_BASE_URL = getApiBaseUrl();
window.DEMO_MODE = false;

// =========================
// HÀM XỬ LÝ LỖI TOÀN CỤC
// =========================
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('❌ Lỗi toàn cục:', {
        message: msg,
        url: url,
        line: lineNo,
        column: columnNo,
        error: error
    });
    
    // Hiển thị thông báo lỗi thân thiện với người dùng
    if (document.getElementById('errorNotification')) {
        document.getElementById('errorNotification').remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorNotification';
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Đã xảy ra lỗi. Vui lòng tải lại trang.</span>
            <button onclick="location.reload()">Tải lại</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.classList.add('show');
    }, 100);
    
    return false;
};

// =========================
// KIỂM TRA KẾT NỐI API
// =========================
// =========================
// KIỂM TRA KẾT NỐI API - SỬA LẠI HOÀN TOÀN
// =========================
async function checkAPIHealth() {
    console.log('🔍 Đang kiểm tra kết nối API...');
    console.log('🌐 API Base URL:', getApiBaseUrl());
    
    // THỬ URL CHÍNH
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        
        // DÙNG buildApiUrl ĐỂ TẠO URL - QUAN TRỌNG!
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH);
        console.log('📡 Testing API:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Health OK:', data);
            return true;
        }
        
        console.warn(`⚠️ API Response not OK: ${response.status}`);
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⏰ API timeout after', API_CONFIG.TIMEOUT, 'ms');
        } else {
            console.warn('⚠️ API connection failed:', error.message);
        }
    }
    
    // THỬ FALLBACK URLS (nếu có)
    for (const fallbackUrl of API_CONFIG.FALLBACK_URLS) {
        try {
            console.log('🔄 Thử fallback URL:', fallbackUrl);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
            
            const url = `${fallbackUrl}${API_CONFIG.ENDPOINTS.HEALTH}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal,
                mode: 'cors'
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log('✅ Fallback API OK:', fallbackUrl);
                window.API_BASE_URL = fallbackUrl;
                return true;
            }
            
        } catch (fallbackError) {
            console.warn(`⚠️ Fallback ${fallbackUrl} failed:`, fallbackError.message);
        }
    }
    
    console.log('❌ Không thể kết nối đến API, sử dụng chế độ offline');
    return false;
}

// =========================
// KHỞI TẠO ỨNG DỤNG
// =========================
async function initializeApp() {
    console.log('🔄 Đang khởi tạo ứng dụng...');
    
    try {
        // Thêm CSS
        addErrorStyles();
        addConnectionStyles();
        addDemoStyles();
        
        // Hiển thị thông báo đang kết nối
        showConnectionStatus('checking');
        
        // Kiểm tra API với cơ chế retry
        let apiHealthy = false;
        for (let i = 0; i < API_CONFIG.RETRY_COUNT + 1; i++) {
            if (i > 0) {
                console.log(`🔄 Retry ${i}/${API_CONFIG.RETRY_COUNT}...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            apiHealthy = await checkAPIHealth();
            if (apiHealthy) break;
        }
        
        // Cập nhật UI dựa trên trạng thái API
        if (!apiHealthy) {
            console.log('⚠️ API không khả dụng, sử dụng chế độ offline');
            showConnectionStatus('offline');
            window.DEMO_MODE = true;
        } else {
            showConnectionStatus('online');
            window.DEMO_MODE = false;
        }
        
        // Khởi tạo các module theo thứ tự
        initUI();
        await initProducts(); // Đợi sản phẩm load trước
        initCart();
        initAuth();
        
        console.log('✅ Ứng dụng đã sẵn sàng!', window.DEMO_MODE ? '(Chế độ demo)' : '');
        
        // Hiển thị thông báo nếu đang ở chế độ demo
        if (window.DEMO_MODE) {
            setTimeout(() => {
                showDemoNotification();
            }, 2000);
        }
        
        // Log thông tin môi trường
        logEnvironmentInfo();
        
    } catch (error) {
        console.error('❌ Lỗi khởi tạo ứng dụng:', error);
        showConnectionStatus('error');
        showFallbackUI();
    }
}

// =========================
// HIỂN THỊ TRẠNG THÁI KẾT NỐI
// =========================
function showConnectionStatus(status) {
    // Xóa status cũ
    const oldStatus = document.getElementById('connectionStatus');
    if (oldStatus) oldStatus.remove();
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'connectionStatus';
    statusDiv.className = 'connection-status';
    
    switch(status) {
        case 'checking':
            statusDiv.innerHTML = `
                <div class="connection-status-content checking">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Đang kết nối đến máy chủ...</span>
                </div>
            `;
            break;
        case 'online':
            statusDiv.innerHTML = `
                <div class="connection-status-content online">
                    <i class="fas fa-check-circle"></i>
                    <span>Đã kết nối đến máy chủ</span>
                    <button class="status-close">&times;</button>
                </div>
            `;
            
            // Thêm sự kiện đóng
            const closeBtn = statusDiv.querySelector('.status-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    statusDiv.remove();
                });
            }
            
            // Tự động ẩn sau 3 giây
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.remove();
                }
            }, 3000);
            break;
        case 'offline':
            statusDiv.innerHTML = `
                <div class="connection-status-content offline">
                    <i class="fas fa-wifi-slash"></i>
                    <div class="status-text">
                        <strong>Chế độ ngoại tuyến</strong>
                        <span>Dữ liệu được lưu trên máy tính của bạn</span>
                    </div>
                    <button class="status-close">&times;</button>
                </div>
            `;
            
            // Thêm sự kiện đóng
            const closeOfflineBtn = statusDiv.querySelector('.status-close');
            if (closeOfflineBtn) {
                closeOfflineBtn.addEventListener('click', () => {
                    statusDiv.remove();
                });
            }
            break;
        case 'error':
            statusDiv.innerHTML = `
                <div class="connection-status-content error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="status-text">
                        <strong>Lỗi kết nối</strong>
                        <span>Đang sử dụng dữ liệu tạm thời</span>
                    </div>
                    <button class="btn-retry" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
            break;
    }
    
    document.body.prepend(statusDiv);
    
    // Thêm animation
    setTimeout(() => {
        statusDiv.classList.add('show');
    }, 10);
}

// =========================
// HIỂN THỊ THÔNG BÁO DEMO
// =========================
function showDemoNotification() {
    // Kiểm tra nếu đã hiển thị rồi thì không hiển thị lại
    if (localStorage.getItem('velora_demo_notification_shown') === 'true') {
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = 'demo-notification';
    notification.innerHTML = `
        <div class="demo-content">
            <i class="fas fa-info-circle"></i>
            <div class="demo-text">
                <strong>🔧 Chế độ trình diễn</strong>
                <p>Ứng dụng đang chạy ở chế độ ngoại tuyến. Đơn hàng sẽ được lưu trên máy tính của bạn và không đồng bộ lên máy chủ.</p>
                <p class="demo-note">📌 Để kết nối với máy chủ thật, hãy cấu hình API URL trong file config.js</p>
            </div>
            <button class="demo-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    const closeBtn = notification.querySelector('.demo-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
            localStorage.setItem('velora_demo_notification_shown', 'true');
        });
    }
    
    // Tự động ẩn sau 10 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
            localStorage.setItem('velora_demo_notification_shown', 'true');
        }
    }, 10000);
}

// =========================
// GIAO DIỆN FALLBACK
// =========================
function showFallbackUI() {
    console.log('🔄 Đang hiển thị giao diện fallback...');
    
    // Hiển thị thông báo
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        // Kiểm tra nếu đã có fallback thì không thêm nữa
        if (mainContent.querySelector('.fallback-message')) {
            return;
        }
        
        const fallbackHTML = `
            <div class="fallback-message">
                <div class="fallback-icon">
                    <i class="fas fa-cloud-meatball"></i>
                </div>
                <h2>Không thể kết nối đến máy chủ</h2>
                <p>Đang hiển thị dữ liệu mẫu trên máy tính của bạn.</p>
                <div class="fallback-details">
                    <p><i class="fas fa-check-circle"></i> Xem sản phẩm</p>
                    <p><i class="fas fa-check-circle"></i> Thêm vào giỏ hàng</p>
                    <p><i class="fas fa-check-circle"></i> Đặt hàng (lưu trên máy tính)</p>
                    <p><i class="fas fa-times-circle"></i> Đồng bộ đơn hàng lên máy chủ</p>
                </div>
                <div class="fallback-actions">
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Thử lại kết nối
                    </button>
                    <button class="btn btn-secondary" id="continueDemoBtn">
                        <i class="fas fa-shopping-bag"></i> Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        `;
        
        // Thêm vào đầu main content
        mainContent.insertAdjacentHTML('afterbegin', fallbackHTML);
        
        // Thêm sự kiện cho nút tiếp tục
        const continueBtn = document.getElementById('continueDemoBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                const fallbackMsg = document.querySelector('.fallback-message');
                if (fallbackMsg) {
                    fallbackMsg.remove();
                }
            });
        }
    }
}

// =========================
// LOG THÔNG TIN MÔI TRƯỜNG
// =========================
function logEnvironmentInfo() {
    console.log('=================================');
    console.log('📊 ENVIRONMENT INFORMATION');
    console.log('=================================');
    console.log('📍 Hostname:', window.location.hostname);
    console.log('🌐 API Base URL:', window.API_BASE_URL);
    console.log('🔄 Demo Mode:', window.DEMO_MODE ? 'Yes' : 'No');
    console.log('💾 LocalStorage Available:', !!window.localStorage);
    console.log('📦 Products Loaded:', window.allProducts?.length || 0);
    console.log('🛒 Cart Items:', window.cart?.length || 0);
    console.log('=================================');
}

// =========================
// THÊM CSS CHO THÔNG BÁO LỖI
// =========================
function addErrorStyles() {
    // Kiểm tra nếu đã tồn tại
    if (document.getElementById('error-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'error-styles';
    style.textContent = `
        .error-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(229, 62, 62, 0.3);
            z-index: 99999;
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s;
            max-width: 400px;
            width: 90%;
        }
        
        .error-notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .error-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .error-content i {
            font-size: 1.5rem;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        
        .error-content span {
            flex: 1;
            font-weight: 500;
        }
        
        .error-content button {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 16px;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
            font-size: 0.9rem;
            backdrop-filter: blur(5px);
        }
        
        .error-content button:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

// =========================
// THÊM CSS CHO CONNECTION STATUS
// =========================
function addConnectionStyles() {
    // Kiểm tra nếu đã tồn tại
    if (document.getElementById('connection-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'connection-styles';
    style.textContent = `
        .connection-status {
            position: fixed;
            top: 80px;
            left: 20px;
            z-index: 99998;
            max-width: 450px;
            width: calc(100% - 40px);
            transform: translateY(-20px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .connection-status.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .connection-status-content {
            background: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            display: flex;
            align-items: center;
            gap: 15px;
            border-left: 5px solid;
            backdrop-filter: blur(10px);
        }
        
        .connection-status-content.checking {
            background: #fff9e6;
            border-left-color: #f39c12;
        }
        
        .connection-status-content.checking i {
            color: #f39c12;
            animation: spin 1s linear infinite;
        }
        
        .connection-status-content.online {
            background: #e8f8f0;
            border-left-color: #2ecc71;
        }
        
        .connection-status-content.online i {
            color: #2ecc71;
        }
        
        .connection-status-content.offline {
            background: #fee9e7;
            border-left-color: #e74c3c;
        }
        
        .connection-status-content.offline i {
            color: #e74c3c;
        }
        
        .connection-status-content.error {
            background: #fee9e7;
            border-left-color: #c0392b;
        }
        
        .connection-status-content.error i {
            color: #c0392b;
        }
        
        .status-text {
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        
        .status-text strong {
            font-size: 0.95rem;
            margin-bottom: 2px;
        }
        
        .status-text span {
            font-size: 0.85rem;
            color: #666;
        }
        
        .status-close {
            background: none;
            border: none;
            font-size: 20px;
            color: #999;
            cursor: pointer;
            padding: 0 5px;
            transition: color 0.2s;
        }
        
        .status-close:hover {
            color: #333;
        }
        
        .btn-retry {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 30px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .btn-retry:hover {
            background: #c0392b;
            transform: scale(1.05);
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// =========================
// THÊM CSS CHO DEMO NOTIFICATION
// =========================
function addDemoStyles() {
    // Kiểm tra nếu đã tồn tại
    if (document.getElementById('demo-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'demo-styles';
    style.textContent = `
        .demo-notification {
            position: fixed;
            bottom: -100px;
            left: 20px;
            right: 20px;
            max-width: 550px;
            margin: 0 auto;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 99999;
            transition: bottom 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
        }
        
        .demo-notification.show {
            bottom: 20px;
        }
        
        .demo-content {
            display: flex;
            gap: 18px;
            align-items: flex-start;
        }
        
        .demo-content i {
            font-size: 28px;
            color: #3498db;
            filter: drop-shadow(0 4px 6px rgba(52, 152, 219, 0.3));
            flex-shrink: 0;
        }
        
        .demo-text {
            flex: 1;
        }
        
        .demo-text strong {
            font-size: 1.1rem;
            display: block;
            margin-bottom: 6px;
            color: #fff;
        }
        
        .demo-text p {
            margin: 6px 0;
            font-size: 0.9rem;
            opacity: 0.9;
            line-height: 1.5;
        }
        
        .demo-note {
            background: rgba(52, 152, 219, 0.2);
            padding: 8px 12px;
            border-radius: 8px;
            border-left: 3px solid #3498db;
            font-size: 0.85rem !important;
            margin-top: 8px !important;
        }
        
        .demo-close {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0 8px;
            border-radius: 30px;
            transition: all 0.2s;
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .demo-close:hover {
            background: rgba(255,255,255,0.2);
            transform: rotate(90deg);
        }
    `;
    document.head.appendChild(style);
}

// =========================
// THÊM CSS CHO FALLBACK UI
// =========================
function addFallbackStyles() {
    // Kiểm tra nếu đã tồn tại
    if (document.getElementById('fallback-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'fallback-styles';
    style.textContent = `
        .fallback-message {
            text-align: center;
            padding: 40px 30px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 20px;
            margin: 30px 0;
            border: 2px dashed #dee2e6;
            animation: fadeInUp 0.5s ease;
        }
        
        .fallback-icon {
            font-size: 4rem;
            color: #6c757d;
            margin-bottom: 20px;
        }
        
        .fallback-icon i {
            filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
        }
        
        .fallback-message h2 {
            color: #495057;
            margin-bottom: 15px;
            font-size: 1.8rem;
        }
        
        .fallback-message p {
            color: #6c757d;
            margin-bottom: 25px;
            font-size: 1.1rem;
        }
        
        .fallback-details {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
            padding: 20px;
            background: rgba(255,255,255,0.5);
            border-radius: 12px;
        }
        
        .fallback-details p {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
            font-size: 0.95rem;
            color: #495057;
        }
        
        .fallback-details i {
            font-size: 1.1rem;
        }
        
        .fallback-details i.fa-check-circle {
            color: #28a745;
        }
        
        .fallback-details i.fa-times-circle {
            color: #dc3545;
        }
        
        .fallback-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 768px) {
            .fallback-details {
                flex-direction: column;
                gap: 10px;
                align-items: flex-start;
            }
            
            .fallback-actions {
                flex-direction: column;
            }
            
            .demo-notification {
                width: calc(100% - 40px);
                left: 20px;
                right: 20px;
            }
            
            .connection-status {
                left: 20px;
                right: 20px;
                width: auto;
            }
        }
    `;
    document.head.appendChild(style);
}

// =========================
// THÊM TẤT CẢ CSS
// =========================
function addAllStyles() {
    addErrorStyles();
    addConnectionStyles();
    addDemoStyles();
    addFallbackStyles();
}

// Gọi hàm thêm CSS
addAllStyles();

// =========================
// XỬ LÝ UNHANDLED PROMISE REJECTION
// =========================
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
    
    // Không hiển thị lỗi cho network errors trong demo mode
    if (window.DEMO_MODE && event.reason?.message?.includes('fetch')) {
        return;
    }
    
    // Hiển thị thông báo lỗi
    const errorMessage = event.reason?.message || 'Lỗi không xác định';
    
    // Tạo notification lỗi
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${errorMessage}</span>
            <button onclick="this.parentElement.parentElement.remove()">Đóng</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.classList.remove('show');
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
});

// =========================
// KIỂM TRA API KHI ONLINE
// =========================
window.addEventListener('online', function() {
    console.log('📶 Kết nối mạng đã khôi phục, kiểm tra API...');
    
    if (window.DEMO_MODE) {
        // Thử kết nối lại API
        checkAPIHealth().then(apiHealthy => {
            if (apiHealthy) {
                window.DEMO_MODE = false;
                showConnectionStatus('online');
                
                // Ẩn thông báo demo
                const demoNotif = document.querySelector('.demo-notification');
                if (demoNotif) {
                    demoNotif.classList.remove('show');
                    setTimeout(() => demoNotif.remove(), 300);
                }
                
                // Ẩn fallback UI
                const fallbackMsg = document.querySelector('.fallback-message');
                if (fallbackMsg) {
                    fallbackMsg.remove();
                }
                
                console.log('✅ Đã kết nối lại với API');
            }
        });
    }
});

// =========================
// LƯU TRẠNG THÁI KHI OFFLINE
// =========================
window.addEventListener('offline', function() {
    console.log('📴 Mất kết nối mạng, chuyển sang chế độ offline');
    
    if (!window.DEMO_MODE) {
        window.DEMO_MODE = true;
        showConnectionStatus('offline');
        showDemoNotification();
    }
});

// =========================
// KHỞI ĐỘNG ỨNG DỤNG
// =========================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// =========================
// EXPORT CHO CÁC MODULE KHÁC
// =========================
export { 
    checkAPIHealth,
    showConnectionStatus,
    showDemoNotification,
    showFallbackUI
};
