// about-script.js - JavaScript cho trang About

document.addEventListener('DOMContentLoaded', function() {
    // =================== NAVIGATION ===================
    function initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close menu when clicking on links
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', function() {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }
    
    // =================== COUNTER ANIMATION ===================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.achievement-number');
        const speed = 200;
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            let count = 0;
            
            const updateCount = () => {
                const increment = Math.ceil(target / speed);
                
                if (count < target) {
                    count += increment;
                    counter.textContent = count + '+';
                    setTimeout(updateCount, 1);
                } else {
                    counter.textContent = target + '+';
                }
            };
            
            // Start counter when in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCount();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }
    
    // =================== TEAM CARDS HOVER EFFECT ===================
    function initTeamCards() {
        const teamCards = document.querySelectorAll('.team-card');
        
        teamCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
                this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });
    }
    
    // =================== INITIALIZATION ===================
    function init() {
        console.log('📄 Khởi động trang About...');
        
        initNavigation();
        initCounterAnimation();
        initTeamCards();
        
        console.log('✅ Trang About đã sẵn sàng!');
    }
    
    init();
});
