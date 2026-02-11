// script/auth.js
import { openModal, closeModal, showNotification } from './utils.js';

// =========================
// INIT AUTH
// =========================
export function initAuth() {
    console.log('🔄 Khởi tạo hệ thống đăng nhập...');
    
    // User button
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('👤 Click user button');
            openLoginModal();
        });
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
        showNotification('Email hoặc mật khẩu không đúng', 'error');
    }
}

// =========================
// HANDLE REGISTER
// =========================
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Email không hợp lệ', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }
    
    // Lưu thông tin user vào localStorage (demo)
    const userData = {
        name: name,
        email: email,
        phone: phone,
        joined: new Date().toISOString()
    };
    
    localStorage.setItem('velora_user', JSON.stringify(userData));
    
    showNotification('Đăng ký thành công!', 'success');
    updateUserInfo(email);
    closeModal(document.getElementById('registerModal'));
}

// =========================
// HANDLE FORGOT PASSWORD
// =========================
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        showNotification('Vui lòng nhập email', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Email không hợp lệ', 'error');
        return;
    }
    
    showNotification(`Đã gửi liên kết đặt lại mật khẩu đến ${email} (Demo)`, 'success');
    closeModal(document.getElementById('forgotPasswordModal'));
}

// =========================
// PASSWORD STRENGTH
// =========================
function checkPasswordStrength() {
    const password = this.value;
    const strengthBar = document.querySelector('.password-strength-bar');
    
    if (!strengthBar) return;
    
    let strength = 0;
    let color = '#ddd';
    let width = '0%';
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    switch(strength) {
        case 0:
        case 1:
            color = '#e74c3c'; // Đỏ
            width = '20%';
            break;
        case 2:
            color = '#f39c12'; // Cam
            width = '40%';
            break;
        case 3:
            color = '#f1c40f'; // Vàng
            width = '60%';
            break;
        case 4:
            color = '#2ecc71'; // Xanh lá
            width = '80%';
            break;
        case 5:
            color = '#27ae60'; // Xanh lá đậm
            width = '100%';
            break;
    }
    
    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
}

// =========================
// UPDATE USER INFO
// =========================
function updateUserInfo(email) {
    // Cập nhật icon user
    const userIcon = document.querySelector('#user-btn i');
    if (userIcon) {
        userIcon.className = 'fas fa-user-check';
    }
    
    // Lưu trạng thái đăng nhập
    localStorage.setItem('velora_logged_in', 'true');
    
    // Cập nhật user menu nếu có
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    
    if (userNameElement) {
        const userData = JSON.parse(localStorage.getItem('velora_user') || '{}');
        userNameElement.textContent = userData.name || 'Xin chào!';
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = email;
    }
}

// =========================
// VALIDATE EMAIL
// =========================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
