// script/auth.js
import { showNotification } from './ui.js';
import { validateEmail, validatePhone, generateUserId } from './utils.js';

let API_BASE_URL = '';

// =================== AUTHENTICATION SYSTEM ===================
function initializeAuthSystem(baseUrl) {
    API_BASE_URL = baseUrl;
    
    // Event listeners for modal switching
    setupModalSwitching();
    
    // Form submissions
    setupFormSubmissions();
    
    // User button and menu
    setupUserMenu();
    
    // Check login status on load
    checkLoginStatus();
}

function setupModalSwitching() {
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const backToLogin = document.getElementById('backToLogin');
    const forgotPassword = document.querySelector('.forgot-password');
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('loginModal');
            openRegisterModal();
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('registerModal');
            openLoginModal();
        });
    }
    
    if (backToLogin) {
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('forgotPasswordModal');
            openLoginModal();
        });
    }
    
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('loginModal');
            openForgotPasswordModal();
        });
    }
}

function setupFormSubmissions() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    
    // Password strength checker
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', checkPasswordStrength);
    }
    
    // Password confirmation check
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    if (registerConfirmPassword) {
        registerConfirmPassword.addEventListener('input', checkPasswordMatch);
    }
}

function setupUserMenu() {
    const userBtn = document.getElementById('user-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isLoggedIn()) {
                toggleUserMenu();
            } else {
                openLoginModal();
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Close user menu when clicking outside
    document.addEventListener('click', function(e) {
        const userMenu = document.getElementById('userMenu');
        const userBtn = document.getElementById('user-btn');
        
        if (userMenu && userBtn && !userMenu.contains(e.target) && !userBtn.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
}

// =================== MODAL FUNCTIONS ===================
function openLoginModal() {
    openModal('loginModal');
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
}

function openRegisterModal() {
    openModal('registerModal');
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.reset();
    resetPasswordStrength();
    resetPasswordMatch();
}

function openForgotPasswordModal() {
    openModal('forgotPasswordModal');
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) forgotForm.reset();
}

function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.classList.toggle('active');
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// =================== FORM HANDLERS ===================
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.querySelector('#loginForm input[type="checkbox"]').checked;
    
    if (!validateEmail(email)) {
        showNotification('Email không hợp lệ', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;
        
        // Try backend login
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                saveUserData(result.data.user, result.data.token, rememberMe);
                showNotification('Đăng nhập thành công!', 'success');
                closeModal('loginModal');
                updateUserUI();
            } else {
                showNotification(result.message || 'Đăng nhập thất bại', 'error');
            }
        } else {
            // Fallback to local login
            const userData = JSON.parse(localStorage.getItem('velora_users') || '{}');
            
            if (userData[email] && userData[email].password === password) {
                saveUserData(userData[email], null, rememberMe);
                showNotification('Đăng nhập thành công!', 'success');
                closeModal('loginModal');
                updateUserUI();
            } else {
                showNotification('Email hoặc mật khẩu không chính xác', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Đã có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
            submitBtn.disabled = false;
        }
    }
}

async function handleRegister(e) {
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
    
    if (!validateEmail(email)) {
        showNotification('Email không hợp lệ', 'error');
        return;
    }
    
    if (!validatePhone(phone)) {
        showNotification('Số điện thoại không hợp lệ', 'error');
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
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;
        
        // Try backend registration
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                saveUserData(result.data.user, result.data.token, false);
                showNotification('Đăng ký thành công!', 'success');
                closeModal('registerModal');
                updateUserUI();
            } else {
                showNotification(result.message || 'Đăng ký thất bại', 'error');
            }
        } else {
            // Fallback to local registration
            const userData = JSON.parse(localStorage.getItem('velora_users') || '{}');
            
            if (userData[email]) {
                showNotification('Email đã được sử dụng', 'error');
                return;
            }
            
            userData[email] = {
                id: generateUserId(),
                name,
                email,
                phone,
                password,
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('velora_users', JSON.stringify(userData));
            saveUserData(userData[email], null, false);
            showNotification('Đăng ký thành công! Đã tự động đăng nhập', 'success');
            closeModal('registerModal');
            updateUserUI();
        }
    } catch (error) {
        console.error('Register error:', error);
        showNotification('Đã có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Đăng ký';
            submitBtn.disabled = false;
        }
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!validateEmail(email)) {
        showNotification('Email không hợp lệ', 'error');
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        submitBtn.disabled = true;
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showNotification(`Đã gửi liên kết đặt lại mật khẩu đến ${email}`, 'success');
        closeModal('forgotPasswordModal');
        
    } catch (error) {
        showNotification('Đã có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi yêu cầu';
            submitBtn.disabled = false;
        }
    }
}

function handleLogout(e) {
    e.preventDefault();
    
    localStorage.removeItem('velora_user');
    localStorage.removeItem('velora_token');
    sessionStorage.removeItem('velora_user');
    sessionStorage.removeItem('velora_token');
    
    updateUserUI();
    showNotification('Đã đăng xuất thành công', 'success');
    
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.classList.remove('active');
    }
}

// =================== PASSWORD VALIDATION ===================
function checkPasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthBar = document.querySelector('.password-strength-bar');
    const strengthContainer = document.querySelector('.password-strength');
    
    if (!strengthBar || !strengthContainer) return;
    
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    strengthContainer.className = 'password-strength';
    if (password.length > 0) {
        if (strength < 2) {
            strengthContainer.classList.add('weak');
        } else if (strength < 4) {
            strengthContainer.classList.add('medium');
        } else {
            strengthContainer.classList.add('strong');
        }
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const confirmInput = document.getElementById('registerConfirmPassword');
    
    if (confirmPassword.length === 0) return;
    
    if (password === confirmPassword) {
        confirmInput.style.borderColor = '#4CAF50';
    } else {
        confirmInput.style.borderColor = '#F44336';
    }
}

function resetPasswordStrength() {
    const strengthContainer = document.querySelector('.password-strength');
    if (strengthContainer) {
        strengthContainer.className = 'password-strength';
    }
}

function resetPasswordMatch() {
    const confirmInput = document.getElementById('registerConfirmPassword');
    if (confirmInput) {
        confirmInput.style.borderColor = '';
    }
}

// =================== USER MANAGEMENT ===================
function saveUserData(user, token, rememberMe) {
    const userData = {
        ...user,
        loggedIn: true,
        loginTime: new Date().toISOString()
    };
    
    if (rememberMe) {
        localStorage.setItem('velora_user', JSON.stringify(userData));
        if (token) localStorage.setItem('velora_token', token);
    } else {
        sessionStorage.setItem('velora_user', JSON.stringify(userData));
        if (token) sessionStorage.setItem('velora_token', token);
    }
}

function isLoggedIn() {
    const user = getCurrentUser();
    return user && user.loggedIn === true;
}

function getCurrentUser() {
    return JSON.parse(
        localStorage.getItem('velora_user') || 
        sessionStorage.getItem('velora_user') || 
        'null'
    );
}

function checkLoginStatus() {
    if (isLoggedIn()) {
        updateUserUI();
    }
}

function updateUserUI() {
    const userBtn = document.getElementById('user-btn');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (!userBtn || !userName || !userEmail) return;
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        userBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
        userName.textContent = `Xin chào, ${user.name || 'Thành viên'}!`;
        userEmail.textContent = user.email || '';
    } else {
        userBtn.innerHTML = '<i class="fas fa-user"></i>';
        userName.textContent = 'Chào bạn!';
        userEmail.textContent = 'Đăng nhập để xem thông tin';
    }
}

// =================== EXPORTS ===================
export {
    initializeAuthSystem,
    checkLoginStatus,
    getCurrentUser,
    isLoggedIn,
    openModal,
    closeModal,
    openLoginModal,
    openRegisterModal
};
