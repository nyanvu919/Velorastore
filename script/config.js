// script/config.js
// =========================
// API CONFIGURATION - PRODUCTION
// =========================

// THAY URL NÀY BẰNG URL WORKER THẬT CỦA BẠN!
const API_BASE_URL = 'https://velora-api.nyaochen9.workers.dev/'; // 👈 URL THẬT

// Fallback URLs (có thể để trống nếu chỉ dùng 1 URL)
const API_FALLBACK_URLS = [
    'https://velora-api.nyaochen9.workers.dev/', // URL THẬT
    // Thêm URL khác nếu có nhiều worker
];

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    FALLBACK_URLS: API_FALLBACK_URLS,
    TIMEOUT: 10000,
    RETRY_COUNT: 2,
    
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

// Hàm lấy API URL
export function getApiBaseUrl() {
    return API_CONFIG.BASE_URL;
}

// Hàm build full URL
export function buildApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${endpoint}`;
}
