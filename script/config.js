// script/config.js
// =========================
// API CONFIGURATION
// =========================

// Xác định môi trường
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('.pages.dev');

// Cấu hình API URL - THAY ĐỔI URL NÀY THÀNH WORKER CỦA BẠN!
const API_BASE_URL = isDevelopment 
    ? 'http://localhost:8787'  // Local development (wrangler dev)
    : 'https://velora-api.your-worker.workers.dev'; // Production - THAY URL WORKER CỦA BẠN!

// Fallback URLs nếu URL chính không hoạt động
const API_FALLBACK_URLS = [
    'https://velora-api.your-worker.workers.dev',
    // Thêm các URL fallback khác nếu cần
];

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    FALLBACK_URLS: API_FALLBACK_URLS,
    TIMEOUT: 10000, // 10 seconds
    RETRY_COUNT: 2,
    
    // Endpoints
    ENDPOINTS: {
        HEALTH: '/api/health',
        PRODUCTS: '/api/products',
        PRODUCT_DETAIL: (id) => `/api/products/${id}`,
        ORDERS: '/api/orders',
        ORDER_DETAIL: (id) => `/api/orders/${id}`,
        CONTACT: '/api/contact',
        ADMIN_LOGIN: '/api/admin/login',
        ADMIN_LOGOUT: '/api/admin/logout',
        ADMIN_STATS: '/api/admin/stats',
        ADMIN_ORDERS: '/api/admin/orders',
        ADMIN_PRODUCTS: '/api/admin/products',
        ADMIN_CUSTOMERS: '/api/admin/customers',
        ADMIN_MESSAGES: '/api/admin/messages',
    }
};

// Hàm lấy API URL (có thể thay đổi động)
export function getApiBaseUrl() {
    return API_CONFIG.BASE_URL;
}

// Hàm build full URL
export function buildApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${endpoint}`;
}
