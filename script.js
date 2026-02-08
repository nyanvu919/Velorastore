// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    // Dữ liệu sản phẩm mẫu với hình ảnh từ srcimg
    const allProducts = [
        {
            id: 1,
            name: "Đầm dạ hội lộng lẫy",
            category: "Đầm dạ hội",
            price: 3500000,
            image: "srcimg/9 (10).png"
        },
        {
            id: 2,
            name: "Áo sơ mi lụa cao cấp",
            category: "Áo sơ mi",
            price: 1200000,
            image: "srcimg/10 (11).png"
        },
        {
            id: 3,
            name: "Quần âu sang trọng",
            category: "Quần âu",
            price: 1800000,
            image: "srcimg/11 (12).png"
        },
        {
            id: 4,
            name: "Áo khoác da thật",
            category: "Áo khoác",
            price: 4500000,
            image: "srcimg/12 (13).png"
        },
        {
            id: 5,
            name: "Váy công sở thanh lịch",
            category: "Váy",
            price: 1600000,
            image: "srcimg/13 (14).png"
        },
        {
            id: 6,
            name: "Set đồ thể thao cao cấp",
            category: "Đồ thể thao",
            price: 2200000,
            image: "srcimg/14 (15).png"
        },
        {
            id: 7,
            name: "Áo len cashmere",
            category: "Áo len",
            price: 2800000,
            image: "srcimg/15 (16).png"
        },
        {
            id: 8,
            name: "Chân váy bút chì",
            category: "Chân váy",
            price: 1400000,
            image: "srcimg/16 (17).png"
        },
        {
            id: 9,
            name: "Áo thun thiết kế độc đáo",
            category: "Áo thun",
            price: 850000,
            image: "srcimg/17 (18).png"
        },
        {
            id: 10,
            name: "Quần jeans cao cấp",
            category: "Quần jeans",
            price: 1900000,
            image: "srcimg/18 (19).png"
        },
        {
            id: 11,
            name: "Áo khoác lông cừu",
            category: "Áo khoác",
            price: 5200000,
            image: "srcimg/19 (20).png"
        },
        {
            id: 12,
            name: "Đầm voan thanh lịch",
            category: "Đầm",
            price: 2100000,
            image: "srcimg/20 (21).png"
        },
        {
            id: 13,
            name: "Set đồ công sở nam",
            category: "Đồ công sở",
            price: 3200000,
            image: "srcimg/21 (22).png"
        },
        {
            id: 14,
            name: "Áo sơ mi kẻ caro",
            category: "Áo sơ mi",
            price: 1100000,
            image: "srcimg/22 (23).png"
        },
        {
            id: 15,
            name: "Quần shorts năng động",
            category: "Quần shorts",
            price: 950000,
            image: "srcimg/23 (24).png"
        },
        {
            id: 16,
            name: "Áo khoác bomber",
            category: "Áo khoác",
            price: 2400000,
            image: "srcimg/24 (25).png"
        },
        {
            id: 17,
            name: "Váy đầm dự tiệc",
            category: "Váy dạ hội",
            price: 3800000,
            image: "srcimg/25 (26).png"
        },
        {
            id: 18,
            name: "Áo cardigan ấm áp",
            category: "Áo len",
            price: 1750000,
            image: "srcimg/26 (27).png"
        },
        {
            id: 19,
            name: "Quần tây nam cao cấp",
            category: "Quần âu",
            price: 2100000,
            image: "srcimg/27 (28).png"
        },
        {
            id: 20,
            name: "Đầm maxi dạo phố",
            category: "Đầm",
            price: 1850000,
            image: "srcimg/28 (29).png"
        },
        {
            id: 21,
            name: "Áo hoodie thời trang",
            category: "Áo hoodie",
            price: 1350000,
            image: "srcimg/29 (30).png"
        },
        {
            id: 22,
            name: "Set đồ thể thao nữ",
            category: "Đồ thể thao",
            price: 1950000,
            image: "srcimg/30 (31).png"
        },
        {
            id: 23,
            name: "Áo sơ mi trắng thanh lịch",
            category: "Áo sơ mi",
            price: 1250000,
            image: "srcimg/31 (32).png"
        },
        {
            id: 24,
            name: "Quần jeans rách phong cách",
            category: "Quần jeans",
            price: 1650000,
            image: "srcimg/32 (33).png"
        }
    ];

    // Biến để theo dõi số lượng sản phẩm hiển thị
    let displayedProducts = 8;
    
    // Giỏ hàng
    let cart = [
        {id: 1, name: "Đầm dạ hội lộng lẫy", price: 3500000, quantity: 1, image: "srcimg/9 (10).png"},
        {id: 2, name: "Áo sơ mi lụa cao cấp", price: 1200000, quantity: 2, image: "srcimg/10 (11).png"},
        {id: 4, name: "Áo khoác da thật", price: 4500000, quantity: 1, image: "srcimg/12 (13).png"}
    ];

    // DOM Elements
    const productsGrid = document.querySelector('.products-grid');
    const cartModal = document.getElementById('cartModal');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const orderModal = document.getElementById('orderModal');
    const successModal = document.getElementById('successModal');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const closeSuccessBtn = document.getElementById('closeSuccess');
    const loadMoreBtn = document.getElementById('loadMoreProducts');

    // Khởi tạo sản phẩm
    function initProducts() {
        productsGrid.innerHTML = '';
        
        // Hiển thị số sản phẩm theo biến displayedProducts
        const productsToShow = allProducts.slice(0, displayedProducts);
        
        productsToShow.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const cartItem = cart.find(item => item.id === product.id);
            const inCart = cartItem ? true : false;
            const cartQuantity = cartItem ? cartItem.quantity : 0;
            
            productCard.innerHTML = `
                <div class="product-img" style="background-image: url('${product.image}')">
                    <div class="product-overlay">
                        <div class="product-actions">
                            <button class="action-btn view-btn" data-id="${product.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn cart-add-btn ${inCart ? 'in-cart' : ''}" data-id="${product.id}">
                                <i class="fas ${inCart ? 'fa-check' : 'fa-shopping-cart'}"></i>
                            </button>
                            <button class="action-btn favorite-btn" data-id="${product.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">${formatPrice(product.price)}</p>
                    ${inCart ? `<p class="in-cart-text">Đã có ${cartQuantity} sản phẩm trong giỏ</p>` : ''}
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        // Ẩn/hiện nút "Xem thêm sản phẩm"
        if (displayedProducts >= allProducts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
        
        // Thêm sự kiện cho các nút trên sản phẩm
        addProductEvents();
    }

    // Thêm sự kiện cho các nút trên sản phẩm
    function addProductEvents() {
        document.querySelectorAll('.cart-add-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
            });
        });
        
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                viewProductDetails(productId);
            });
        });
        
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                toggleFavorite(productId);
            });
        });
    }

    // Định dạng giá tiền
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    // Thêm sản phẩm vào giỏ hàng
    function addToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex >= 0) {
            // Tăng số lượng nếu sản phẩm đã có trong giỏ
            cart[existingItemIndex].quantity += 1;
        } else {
            // Thêm sản phẩm mới vào giỏ
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        updateCart();
        initProducts(); // Cập nhật lại giao diện sản phẩm
        
        // Hiệu ứng thông báo
        showNotification(`Đã thêm "${product.name}" vào giỏ hàng`);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
        initProducts(); // Cập nhật lại giao diện sản phẩm
        
        // Hiệu ứng thông báo
        showNotification("Đã xóa sản phẩm khỏi giỏ hàng");
    }

    // Cập nhật số lượng sản phẩm trong giỏ
    function updateCartItemQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex >= 0) {
            cart[itemIndex].quantity = newQuantity;
            updateCart();
        }
    }

    // Cập nhật giỏ hàng
    function updateCart() {
        // Cập nhật số lượng trên icon giỏ hàng
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Cập nhật nội dung modal giỏ hàng
        updateCartModal();
    }

    // Cập nhật modal giỏ hàng
    function updateCartModal() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Giỏ hàng của bạn đang trống</p>';
            updateCartSummary(0, 0);
            return;
        }
        
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Tính phí vận chuyển (miễn phí cho đơn trên 2 triệu)
        const shipping = subtotal > 2000000 ? 0 : 30000;
        const total = subtotal + shipping;
        
        updateCartSummary(subtotal, shipping, total);
        
        // Thêm sự kiện cho các nút trong giỏ hàng
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
        
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.find(item => item.id === productId);
                if (item) {
                    updateCartItemQuantity(productId, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.find(item => item.id === productId);
                if (item) {
                    updateCartItemQuantity(productId, item.quantity + 1);
                }
            });
        });
    }

    // Cập nhật tổng kết giỏ hàng
    function updateCartSummary(subtotal, shipping, total) {
        const summaryRows = document.querySelectorAll('.summary-row .price');
        if (summaryRows.length >= 3) {
            summaryRows[0].textContent = formatPrice(subtotal);
            summaryRows[1].textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
            summaryRows[2].textContent = formatPrice(total);
        }
    }

    // Xem chi tiết sản phẩm
    function viewProductDetails(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        // Tạo modal chi tiết sản phẩm
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${product.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body product-details">
                    <div class="product-details-img" style="background-image: url('${product.image}')"></div>
                    <div class="product-details-info">
                        <p class="product-category">${product.category}</p>
                        <p class="product-price">${formatPrice(product.price)}</p>
                        <p class="product-description">Sản phẩm cao cấp với chất liệu tốt nhất, thiết kế sang trọng và tinh tế. Phù hợp cho nhiều dịp khác nhau.</p>
                        <div class="product-sizes">
                            <h4>Kích thước:</h4>
                            <div class="size-options">
                                <button class="size-option active">S</button>
                                <button class="size-option">M</button>
                                <button class="size-option">L</button>
                                <button class="size-option">XL</button>
                            </div>
                        </div>
                        <button class="btn-primary full-width add-to-cart-details" data-id="${product.id}">Thêm vào giỏ hàng</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Thêm sự kiện đóng modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Thêm sự kiện cho nút thêm vào giỏ hàng
        modal.querySelector('.add-to-cart-details').addEventListener('click', () => {
            addToCart(productId);
            document.body.removeChild(modal);
        });
        
        // Thêm sự kiện chọn kích thước
        modal.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', function() {
                modal.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Đóng modal khi click bên ngoài
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Thêm/xóa sản phẩm yêu thích
    function toggleFavorite(productId) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = favorites.indexOf(productId);
        
        if (index >= 0) {
            favorites.splice(index, 1);
            showNotification("Đã xóa khỏi danh sách yêu thích");
        } else {
            favorites.push(productId);
            showNotification("Đã thêm vào danh sách yêu thích");
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Hiển thị thông báo
    function showNotification(message) {
        // Tạo phần tử thông báo
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Thêm vào body
        document.body.appendChild(notification);
        
        // Hiệu ứng xuất hiện
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
        
        // Thêm CSS cho thông báo
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background-color: var(--primary-color);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 5px;
                    box-shadow: var(--shadow);
                    z-index: 3000;
                    transform: translateX(150%);
                    transition: transform 0.3s ease;
                    font-weight: 500;
                }
                .notification.show {
                    transform: translateX(0);
                }
                @media (max-width: 768px) {
                    .notification {
                        top: auto;
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        transform: translateY(150%);
                    }
                    .notification.show {
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Mở modal
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Đóng modal
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Xử lý đăng nhập
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Kiểm tra đơn giản
        if (!email || !password) {
            showNotification("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        
        // Lưu thông tin đăng nhập (mô phỏng)
        localStorage.setItem('userEmail', email);
        
        // Đổi icon user thành đã đăng nhập
        const userBtn = document.getElementById('user-btn');
        userBtn.innerHTML = '<i class="fas fa-user-check"></i>';
        
        showNotification("Đăng nhập thành công!");
        closeModal(loginModal);
    }

    // Xử lý đăng ký
    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        // Kiểm tra đơn giản
        if (!name || !email || !phone || !password || !confirmPassword) {
            showNotification("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification("Mật khẩu xác nhận không khớp");
            return;
        }
        
        // Lưu thông tin đăng ký (mô phỏng)
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPhone', phone);
        
        // Đổi icon user thành đã đăng nhập
        const userBtn = document.getElementById('user-btn');
        userBtn.innerHTML = '<i class="fas fa-user-check"></i>';
        
        showNotification("Đăng ký thành công! Bạn đã được đăng nhập.");
        closeModal(registerModal);
    }

    // Xử lý đặt hàng
    function handleOrder(e) {
        e.preventDefault();
        
        // Kiểm tra giỏ hàng
        if (cart.length === 0) {
            showNotification("Giỏ hàng của bạn đang trống");
            return;
        }
        
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const email = document.getElementById('orderEmail').value;
        const address = document.getElementById('orderAddress').value;
        
        // Kiểm tra thông tin
        if (!name || !phone || !email || !address) {
            showNotification("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }
        
        // Lưu thông tin đơn hàng (mô phỏng)
        const order = {
            customer: { name, phone, email, address },
            items: cart,
            date: new Date().toISOString(),
            payment: document.querySelector('input[name="payment"]:checked').value,
            note: document.getElementById('orderNote').value
        };
        
        localStorage.setItem('lastOrder', JSON.stringify(order));
        
        // Xóa giỏ hàng
        cart = [];
        updateCart();
        initProducts();
        
        // Đóng modal đặt hàng và mở modal thành công
        closeModal(orderModal);
        openModal(successModal);
    }

    // Tải thêm sản phẩm
    function loadMoreProducts() {
        displayedProducts += 8;
        initProducts();
        
        // Cuộn đến phần sản phẩm mới
        if (displayedProducts > 8) {
            const productsSection = document.getElementById('products');
            window.scrollTo({
                top: productsSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }

    // Khởi tạo sự kiện
    function initEvents() {
        // Menu hamburger cho mobile
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Đóng menu khi click vào link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Mở modal đăng nhập
        document.getElementById('user-btn').addEventListener('click', () => {
            // Kiểm tra xem đã đăng nhập chưa
            if (localStorage.getItem('userEmail')) {
                // Nếu đã đăng nhập, hiển thị menu tài khoản
                showAccountMenu();
            } else {
                // Nếu chưa đăng nhập, mở modal đăng nhập
                openModal(loginModal);
            }
        });
        
        // Mở modal giỏ hàng
        document.getElementById('cart-btn').addEventListener('click', () => {
            updateCartModal();
            openModal(cartModal);
        });
        
        // Đóng modal khi click nút đóng
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Đóng modal khi click bên ngoài
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
        
        // Chuyển đổi giữa modal đăng nhập và đăng ký
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            openModal(registerModal);
        });
        
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(registerModal);
            openModal(loginModal);
        });
        
        // Xử lý form đăng nhập
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        
        // Xử lý form đăng ký
        document.getElementById('registerForm').addEventListener('submit', handleRegister);
        
        // Xử lý thanh toán
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification("Giỏ hàng của bạn đang trống");
                closeModal(cartModal);
                return;
            }
            
            closeModal(cartModal);
            openModal(orderModal);
            
            // Điền thông tin nếu đã đăng nhập
            if (localStorage.getItem('userName')) {
                document.getElementById('orderName').value = localStorage.getItem('userName') || '';
                document.getElementById('orderEmail').value = localStorage.getItem('userEmail') || '';
                document.getElementById('orderPhone').value = localStorage.getItem('userPhone') || '';
            }
        });
        
        // Xử lý form đặt hàng
        document.getElementById('orderForm').addEventListener('submit', handleOrder);
        
        // Đóng modal thành công
        closeSuccessBtn.addEventListener('click', () => {
            closeModal(successModal);
        });
        
        // Tìm kiếm
        document.getElementById('search-btn').addEventListener('click', () => {
            showNotification("Tính năng tìm kiếm đang được phát triển");
        });
        
        // Tải thêm sản phẩm
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreProducts);
        }
    }

    // Hiển thị menu tài khoản
    function showAccountMenu() {
        const userName = localStorage.getItem('userName') || 'Khách hàng';
        const userEmail = localStorage.getItem('userEmail');
        
        // Tạo menu tài khoản
        const accountMenu = document.createElement('div');
        accountMenu.className = 'modal active';
        accountMenu.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Tài khoản của tôi</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body account-menu">
                    <div class="account-info">
                        <div class="account-icon">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="account-details">
                            <h3>${userName}</h3>
                            <p>${userEmail}</p>
                        </div>
                    </div>
                    <div class="account-actions">
                        <button class="account-action-btn">
                            <i class="fas fa-box"></i>
                            <span>Đơn hàng của tôi</span>
                        </button>
                        <button class="account-action-btn">
                            <i class="fas fa-heart"></i>
                            <span>Sản phẩm yêu thích</span>
                        </button>
                        <button class="account-action-btn">
                            <i class="fas fa-cog"></i>
                            <span>Cài đặt tài khoản</span>
                        </button>
                        <button class="account-action-btn" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(accountMenu);
        
        // Đóng menu
        accountMenu.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(accountMenu);
        });
        
        // Đóng khi click bên ngoài
        accountMenu.addEventListener('click', (e) => {
            if (e.target === accountMenu) {
                document.body.removeChild(accountMenu);
            }
        });
        
        // Đăng xuất
        accountMenu.querySelector('#logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPhone');
            
            // Đổi icon user về trạng thái chưa đăng nhập
            const userBtn = document.getElementById('user-btn');
            userBtn.innerHTML = '<i class="fas fa-user"></i>';
            
            showNotification("Đã đăng xuất");
            document.body.removeChild(accountMenu);
        });
        
        // Thêm CSS cho menu tài khoản
        if (!document.querySelector('#account-menu-styles')) {
            const style = document.createElement('style');
            style.id = 'account-menu-styles';
            style.textContent = `
                .account-menu .account-info {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--border-color);
                }
                .account-icon {
                    font-size: 3rem;
                    color: var(--primary-color);
                    margin-right: 15px;
                }
                .account-details h3 {
                    margin-bottom: 5px;
                }
                .account-details p {
                    color: var(--text-color);
                    font-size: 0.9rem;
                }
                .account-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .account-action-btn {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    border: 1px solid var(--border-color);
                    background: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: var(--transition);
                    text-align: left;
                }
                .account-action-btn:hover {
                    background-color: var(--light-color);
                    border-color: var(--primary-color);
                }
                .account-action-btn i {
                    margin-right: 15px;
                    color: var(--primary-color);
                    width: 20px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Khởi tạo ứng dụng
    function initApp() {
        initProducts();
        initEvents();
        updateCart();
        
        // Kiểm tra xem đã đăng nhập chưa
        if (localStorage.getItem('userEmail')) {
            const userBtn = document.getElementById('user-btn');
            userBtn.innerHTML = '<i class="fas fa-user-check"></i>';
        }
        
        // Thêm hiệu ứng scroll cho header
        window.addEventListener('scroll', function() {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        });
    }

    // Khởi chạy ứng dụng
    initApp();
});
