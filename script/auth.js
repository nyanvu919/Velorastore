// script/auth.js
export function initAuth() {
    console.log('🔄 Khởi tạo hệ thống đăng nhập...');
    
    // User button
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', function() {
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
}

function openLoginModal() {
    openModal('loginModal');
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
}

function openRegisterModal() {
    openModal('registerModal');
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.reset();
}

function openForgotPasswordModal() {
    openModal('forgotPasswordModal');
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) forgotForm.reset();
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Vui lòng nhập email và mật khẩu');
        return;
    }
    
    showNotification('Đăng nhập thành công! (Demo)');
    closeModal(document.getElementById('loginModal'));
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !phone || !password) {
        showNotification('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }
    
    showNotification('Đăng ký thành công! (Demo)');
    closeModal(document.getElementById('registerModal'));
}

function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        showNotification('Vui lòng nhập email');
        return;
    }
    
    showNotification(`Đã gửi liên kết đặt lại mật khẩu đến ${email} (Demo)`);
    closeModal(document.getElementById('forgotPasswordModal'));
}
