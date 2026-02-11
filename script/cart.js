// script/auth.js
// Xử lý đăng nhập, đăng ký

function initAuth() {
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
    
    // Check login status
    checkLoginStatus();
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

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('velora_user') || 'null');
    if (user && user.loggedIn) {
        updateUserUI(user);
    }
}

function updateUserUI(user) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userBtn = document.getElementById('user-btn');
    
    if (userName && userEmail && userBtn) {
        userName.textContent = `Xin chào, ${user.name}`;
        userEmail.textContent = user.email;
        userBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
        
        // Show user menu on click
        userBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const userMenu = document.getElementById('userMenu');
            if (userMenu) {
                userMenu.classList.toggle('active');
            }
        });
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Vui lòng nhập email và mật khẩu', 'error');
        return;
    }
    
    // Simulate login
    showNotification('Đang đăng nhập...', 'info');
    
    setTimeout(() => {
        // For demo - accept any email/password
        const user = {
            id: 'user_001',
            name: email.split('@')[0],
            email: email,
            loggedIn: true
        };
        
        localStorage.setItem('velora_user', JSON.stringify(user));
        showNotification('Đăng nhập thành công!', 'success');
        closeModal(document.getElementById('loginModal'));
        updateUserUI(user);
    }, 1000);
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !phone || !password) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    showNotification('Đang đăng ký...', 'info');
    
    setTimeout(() => {
        const user = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            loggedIn: true
        };
        
        localStorage.setItem('velora_user', JSON.stringify(user));
        showNotification('Đăng ký thành công!', 'success');
        closeModal(document.getElementById('registerModal'));
        updateUserUI(user);
    }, 1000);
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        showNotification('Vui lòng nhập email', 'error');
        return;
    }
    
    showNotification('Đang gửi yêu cầu...', 'info');
    
    setTimeout(() => {
        showNotification(`Đã gửi liên kết đặt lại mật khẩu đến ${email}`, 'success');
        closeModal(document.getElementById('forgotPasswordModal'));
    }, 1000);
}
