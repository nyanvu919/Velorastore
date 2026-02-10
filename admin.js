// Thêm vào script.js (index.html)
function handleProductHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#product-')) {
        const productId = hash.replace('#product-', '');
        
        // Highlight sản phẩm tương ứng
        const productElement = document.querySelector(`[data-id="${productId}"]`);
        if (productElement) {
            productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Thêm hiệu ứng highlight
            productElement.style.transition = 'all 0.3s ease';
            productElement.style.boxShadow = '0 0 0 3px var(--primary), 0 5px 15px rgba(0,0,0,0.1)';
            productElement.style.transform = 'translateY(-5px)';
            
            setTimeout(() => {
                productElement.style.boxShadow = '';
                productElement.style.transform = '';
            }, 3000);
        }
    }
}

// Gọi hàm khi trang load và khi hash thay đổi
document.addEventListener('DOMContentLoaded', function() {
    handleProductHash();
    window.addEventListener('hashchange', handleProductHash);
});
