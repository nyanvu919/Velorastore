// script/main.js
import { initUI } from './ui.js';
import { initCart } from './cart.js';
import { initProducts } from './products.js';
import { initAuth } from './auth.js';

console.log('🚀 Khởi động Velora Fashion...');

// Biến global
window.allProducts = [];
window.cart = [];

// Hàm xử lý lỗi toàn cục
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

// Hàm kiểm tra kết nối API
async function checkAPIHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('✅ API Status:', data);
        return data.status === 'healthy';
    } catch (error) {
        console.warn('⚠️ Không thể kết nối đến API, sử dụng dữ liệu mẫu');
        return false;
    }
}

// Hàm khởi tạo chính
async function initializeApp() {
    console.log('🔄 Đang khởi tạo ứng dụng...');
    
    try {
        // Kiểm tra API trước
        const apiHealthy = await checkAPIHealth();
        if (!apiHealthy) {
            console.log('⚠️ API không khả dụng, sử dụng chế độ offline');
        }
        
        // Khởi tạo theo thứ tự
        initUI();
        await initProducts(); // Đợi sản phẩm load trước
        initCart();
        initAuth();
        
        console.log('✅ Ứng dụng đã sẵn sàng!');
        
        // Thêm CSS cho error notification
        addErrorStyles();
        
    } catch (error) {
        console.error('❌ Lỗi khởi tạo ứng dụng:', error);
        showFallbackUI();
    }
}

// Thêm CSS cho thông báo lỗi
function addErrorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .error-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
        }
        
        .error-notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .error-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .error-content i {
            font-size: 1.2rem;
        }
        
        .error-content span {
            flex: 1;
        }
        
        .error-content button {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 5px 15px;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .error-content button:hover {
            background: rgba(255,255,255,0.3);
        }
    `;
    document.head.appendChild(style);
}

// Giao diện fallback
function showFallbackUI() {
    console.log('🔄 Đang hiển thị giao diện fallback...');
    
    // Hiển thị thông báo
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const fallbackHTML = `
            <div class="fallback-message">
                <i class="fas fa-wifi-slash"></i>
                <h2>Không thể kết nối đến máy chủ</h2>
                <p>Đang hiển thị dữ liệu mẫu. Một số tính năng có thể bị hạn chế.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Thử lại
                </button>
            </div>
        `;
        
        // Thêm vào đầu main content
        mainContent.insertAdjacentHTML('afterbegin', fallbackHTML);
    }
}

// Thêm CSS cho fallback
const fallbackStyle = document.createElement('style');
fallbackStyle.textContent = `
    .fallback-message {
        text-align: center;
        padding: 40px 20px;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 20px 0;
        border: 2px dashed #ddd;
    }
    
    .fallback-message i {
        font-size: 4rem;
        color: #a0aec0;
        margin-bottom: 20px;
    }
    
    .fallback-message h2 {
        color: #4a5568;
        margin-bottom: 10px;
    }
    
    .fallback-message p {
        color: #718096;
        margin-bottom: 20px;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }
`;
document.head.appendChild(fallbackStyle);

// Khởi động ứng dụng khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
