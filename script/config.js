// script/config.js
// =========================
// API CONFIGURATION - PRODUCTION
// =========================

// URL THẬT CỦA WORKER - KHÔNG CÓ DẤU / Ở CUỐI
const API_BASE_URL = 'https://velora-api.nyaochen9.workers.dev'; // ✅ XÓA dấu / cuối

// Fallback URLs - để trống
const API_FALLBACK_URLS = [];

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    FALLBACK_URLS: API_FALLBACK_URLS,
    TIMEOUT: 10000,
    RETRY_COUNT: 2,
    
    ENDPOINTS: {
        HEALTH: '/api/health',           // ✅ CÓ dấu / ở đầu
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

// Hàm build URL - ĐÃ SỬA LỖI DOUBLE SLASH
export function getApiBaseUrl() {
    return API_CONFIG.BASE_URL;
}

export function buildApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    // ✅ ĐẢM BẢO CHỈ 1 DẤU / GIỮA BASE URL VÀ ENDPOINT
    return `${baseUrl}${endpoint}`;  // baseUrl KHÔNG có / cuối, endpoint CÓ / đầu
}
