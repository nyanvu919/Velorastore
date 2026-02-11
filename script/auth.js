// script/auth.js
import { openModal, closeModal, showNotification } from './utils.js';

// =========================
// INIT AUTH
// =========================
// script/auth.js - Sửa phần initAuth()
export function initAuth() {
    console.log('🔄 Khởi tạo hệ thống đăng nhập...');
    
    // User button - SỬA CHỖ NÀY
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('👤 Click user button');
            openLoginModal();
        });
    }
    
    // ... phần còn lại giữ nguyên
}
    
    // Modal switching
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const backToLogin = document.getElementById('backToLogin');
    const forgotPassword = document.querySelector('.forgot-password');
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(document.getElementById('loginModal'));
            openRegisterModal();
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(document.getElementById('registerModal'));
            openLoginModal();
        });
    }
    
    if (backToLogin) {
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(document.getElementById('forgotPasswordModal'));
            openLoginModal();
        });
    }
    
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(document.getElementById('loginModal'));
            openForgotPasswordModal();
        });
    }
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    
    // Password strength
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', checkPasswordStrength);
    }
    
    // Social login buttons
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.classList.contains('facebook') ? 'Facebook' : 'Google';
            showNotification(`Đăng nhập với ${provider} (Demo)`, 'info');
        });
    });
}

// =========================
// OPEN MODALS
// =========================
function openLoginModal() {
    openModal('loginModal');
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
}

function openRegisterModal() {
    openModal('registerModal');
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.reset();
    
    // Reset password strength
    const strengthBar = document.querySelector('.password-strength-bar');
    if (strengthBar) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '#ddd';
    }
}

function openForgotPasswordModal() {
    openModal('forgotPasswordModal');
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) forgotForm.reset();
}

// =========================
// HANDLE LOGIN
// =========================
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Vui lòng nhập email và mật khẩu', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Email không hợp lệ', 'error');
        return;
    }
    
    // Demo login - kiểm tra với dữ liệu mẫu
    const demoUsers = [
        { email: 'admin@velora.com', password: '123456' },
        { email: 'user@velora.com', password: '123456' }
    ];
    
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        showNotification('Đăng nhập thành công!', 'success');
        updateUserInfo(email);
        closeModal(document.getElementById('loginModal'));
    } else {
        showNotification('Email hoặc mật khẩu không đ
