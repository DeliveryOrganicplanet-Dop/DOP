// Carrinho Premium - JavaScript Enhanced

class PremiumCart {
    constructor() {
        this.carrinho = window.carrinhoData || [];
        this.deliveryFee = 5.00;
        this.freeShippingThreshold = 50.00;
        this.appliedCoupon = null;
        this.discountAmount = 0;
        this.isLoading = false;

        // Coupons válidos (simulação)
        this.validCoupons = {
            'ORGANIC10': { type: 'percentage', value: 10, description: '10% de desconto' },
            'WELCOME15': { type: 'percentage', value: 15, description: '15% de desconto para novos clientes' },
            'FRETE5': { type: 'fixed', value: 5.00, description: 'R$ 5,00 de desconto' },
            'SUPER20': { type: 'percentage', value: 20, description: '20% de desconto em compras acima de R$ 30' }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.updateCartDisplay();
        this.addScrollEffects();
        this.preloadRecommendations();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('toggle-dark');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Clear cart
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Coupon form
        const couponForm = document.getElementById('coupon-form');
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => this.applyCoupon(e));
        }

        // Recommendation buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-recommendation-btn')) {
                const productType = e.target.closest('.add-recommendation-btn').dataset.product;
                this.addRecommendation(productType);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.checkout();
            }
            if (e.ctrlKey && e.key === 'Delete') {
                this.clearCart();
            }
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('cart-theme');
        const themeToggle = document.getElementById('toggle-dark');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            if (themeToggle) {
                themeToggle.querySelector('.theme-icon').textContent = '☀️';
                themeToggle.setAttribute('aria-pressed', 'true');
            }
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('toggle-dark');
        const isDark = body.classList.toggle('dark');
        
        if (themeToggle) {
            const icon = themeToggle.querySelector('.theme-icon');
            icon.textContent = isDark ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-pressed', isDark.toString());
        }
        
        localStorage.setItem('cart-theme', isDark ? 'dark' : 'light');
        
        // Smooth transition
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }

    updateCartDisplay() {
        this.updateItemsCount();
        this.renderCartItems();
        this.updateOrderSummary();
        this.toggleEmptyState();
    }

    updateItemsCount() {
        const itemsCount = document.getElementById('items-count');
        if (itemsCount) {
            const totalItems = this.carrinho.reduce((sum, item) => sum + item.quantidade, 0);
            itemsCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
        }
    }

    renderCartItems() {
        const cartItemsList = document.getElementById('cart-items-list');
        if (!cartItemsList) return;

        cartItemsList.innerHTML = '';

        this.carrinho.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'cart-item animate-in';
            listItem.style.animationDelay = `${index * 0.1}s`;
            listItem.setAttribute('role', 'listitem');

            listItem.innerHTML = `
                <article class="item-content">
                    <figure class="item-image">
                        <span class="product-icon" role="img" aria-label="${item.nome}">${item.imagem}</span>
                    </figure>
                    
                    <section class="item-details">
                        <h3 class="item-name">${item.nome}</h3>
                        <p class="item-description">${item.descricao}</p>
                        <span class="item-price">${this.formatPrice(item.preco)}</span>
                    </section>
                    
                    <section class="item-controls">
                        <section class="quantity-controls" role="group" aria-label="Controles de quantidade">
                            <button 
                                class="quantity-btn" 
                                onclick="cart.changeQuantity('${item.nome}', -1)"
                                aria-label="Diminuir quantidade"
                                ${item.quantidade <= 1 ? 'disabled' : ''}
                            >-</button>
                            <span class="quantity-display" aria-label="Quantidade: ${item.quantidade}">${item.quantidade}</span>
                            <button 
                                class="quantity-btn" 
                                onclick="cart.changeQuantity('${item.nome}', 1)"
                                aria-label="Aumentar quantidade"
                            >+</button>
                        </section>
                        
                        <button 
                            class="remove-btn" 
                            onclick="cart.removeItem('${item.nome}')"
                            aria-label="Remover ${item.nome} do carrinho"
                        >
                            <span class="remove-icon">🗑️</span>
                            <span class="remove-text">Remover</span>
                        </button>
                    </section>
                </article>
            `;

            cartItemsList.appendChild(listItem);
        });

        // Trigger animation
        setTimeout(() => {
            document.querySelectorAll('.cart-item').forEach(item => {
                item.classList.add('animate-in');
            });
        }, 50);
    }

    updateOrderSummary() {
        const subtotal = this.calculateSubtotal();
        const deliveryFee = this.calculateDeliveryFee(subtotal);
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee - discount;

        // Update display
        this.updateElement('subtotal', this.formatPrice(subtotal));
        this.updateElement('delivery-fee', this.formatPrice(deliveryFee));
        this.updateElement('discount', `- ${this.formatPrice(discount)}`);
        this.updateElement('total', this.formatPrice(total));

        // Show/hide discount row
        const discountRow = document.getElementById('discount-row');
        if (discountRow) {
            discountRow.classList.toggle('show', discount > 0);
        }

        // Enable/disable checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.carrinho.length === 0;
        }
    }

    calculateSubtotal() {
        return this.carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    }

    calculateDeliveryFee(subtotal) {
        return subtotal >= this.freeShippingThreshold ? 0 : this.deliveryFee;
    }

    calculateDiscount(subtotal) {
        if (!this.appliedCoupon) return 0;

        const coupon = this.validCoupons[this.appliedCoupon];
        if (!coupon) return 0;

        if (coupon.type === 'percentage') {
            // Check minimum amount for SUPER20
            if (this.appliedCoupon === 'SUPER20' && subtotal < 30) {
                return 0;
            }
            return (subtotal * coupon.value) / 100;
        } else {
            return Math.min(coupon.value, subtotal);
        }
    }

    toggleEmptyState() {
        const emptyMessage = document.getElementById('empty-cart-message');
        const cartItemsList = document.getElementById('cart-items-list');
        
        if (emptyMessage && cartItemsList) {
            const isEmpty = this.carrinho.length === 0;
            emptyMessage.classList.toggle('show', isEmpty);
            cartItemsList.style.display = isEmpty ? 'none' : 'flex';
        }
    }

    async changeQuantity(itemName, delta) {
        const item = this.carrinho.find(item => item.nome === itemName);
        if (!item) return;

        const newQuantity = Math.max(1, item.quantidade + delta);
        
        this.showLoading(true);
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            item.quantidade = newQuantity;
            this.updateCartDisplay();
            this.showToast('Quantidade atualizada!', 'success');
            
        } catch (error) {
            console.error('Erro ao alterar quantidade:', error);
            this.showToast('Erro ao atualizar quantidade', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async removeItem(itemName) {
        const itemIndex = this.carrinho.findIndex(item => item.nome === itemName);
        if (itemIndex === -1) return;

        // Add confirmation for expensive items
        const item = this.carrinho[itemIndex];
        if (item.preco * item.quantidade > 15) {
            if (!confirm(`Tem certeza que deseja remover ${item.nome} do carrinho?`)) {
                return;
            }
        }

        this.showLoading(true);
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            this.carrinho.splice(itemIndex, 1);
            this.updateCartDisplay();
            this.showToast(`${item.nome} removido do carrinho`, 'success');
            
        } catch (error) {
            console.error('Erro ao remover item:', error);
            this.showToast('Erro ao remover item', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async clearCart() {
        if (this.carrinho.length === 0) return;
        
        if (!confirm('Tem certeza que deseja limpar todo o carrinho?')) {
            return;
        }

        this.showLoading(true);
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            this.carrinho = [];
            this.appliedCoupon = null;
            this.discountAmount = 0;
            this.clearCouponDisplay();
            this.updateCartDisplay();
            this.showToast('Carrinho limpo com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            this.showToast('Erro ao limpar carrinho', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async applyCoupon(event) {
        event.preventDefault();
        
        const couponInput = document.getElementById('coupon-input');
        if (!couponInput) return;

        const couponCode = couponInput.value.trim().toUpperCase();
        if (!couponCode) {
            this.showToast('Digite um código de cupom', 'warning');
            return;
        }

        this.showLoading(true);
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            if (this.validCoupons[couponCode]) {
                const coupon = this.validCoupons[couponCode];
                
                // Check minimum amount for SUPER20
                if (couponCode === 'SUPER20' && this.calculateSubtotal() < 30) {
                    this.showToast('Cupom válido apenas para compras acima de R$ 30,00', 'warning');
                    this.showLoading(false);
                    return;
                }
                
                this.appliedCoupon = couponCode;
                this.updateCartDisplay();
                this.showToast(`Cupom aplicado: ${coupon.description}`, 'success');
                
                // Clear and close coupon section
                couponInput.value = '';
                const couponDetails = document.querySelector('.coupon-details');
                if (couponDetails) {
                    couponDetails.removeAttribute('open');
                }
                
            } else {
                this.showToast('Cupom inválido ou expirado', 'error');
            }
            
        } catch (error) {
            console.error('Erro ao aplicar cupom:', error);
            this.showToast('Erro ao aplicar cupom', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    clearCouponDisplay() {
        const couponInput = document.getElementById('coupon-input');
        if (couponInput) {
            couponInput.value = '';
        }
    }

    async checkout() {
        if (this.carrinho.length === 0) {
            this.showToast('Seu carrinho está vazio', 'warning');
            return;
        }

        this.showLoading(true, 'Processando pagamento...');
        
        try {
            // Simulate payment processing
            await this.simulateApiCall(2000);
            
            // Success animation
            this.showToast('Compra finalizada com sucesso! 🎉', 'success');
            
            // Clear cart after successful purchase
            setTimeout(() => {
                this.carrinho = [];
                this.appliedCoupon = null;
                this.updateCartDisplay();
                
                // Redirect to success page
                setTimeout(() => {
                    window.location.href = '/finalizar';
                }, 1000);
            }, 1500);
            
        } catch (error) {
            console.error('Erro no checkout:', error);
            this.showToast('Erro ao processar pagamento. Tente novamente.', 'error');
        } finally {
            setTimeout(() => {
                this.showLoading(false);
            }, 1500);
        }
    }

    addRecommendation(productType) {
        const recommendations = {
            'brocolis': {
                nome: 'Brócolis Premium',
                preco: 8.90,
                imagem: '🥦',
                descricao: 'Unidade 300g'
            },
            'alface': {
                nome: 'Alface Orgânica',
                preco: 3.50,
                imagem: '🥬',
                descricao: 'A unidade'
            },
            'tomate': {
                nome: 'Tomate Cereja',
                preco: 6.80,
                imagem: '🍅',
                descricao: 'Bandeja 250g'
            }
        };

        const product = recommendations[productType];
        if (!product) return;

        // Check if product already exists in cart
        const existingItem = this.carrinho.find(item => item.nome === product.nome);
        
        if (existingItem) {
            existingItem.quantidade += 1;
            this.showToast(`${product.nome} - quantidade aumentada!`, 'success');
        } else {
            this.carrinho.push({
                ...product,
                quantidade: 1
            });
            this.showToast(`${product.nome} adicionado ao carrinho!`, 'success');
        }

        this.updateCartDisplay();

        // Add visual feedback to the button
        const btn = document.querySelector(`[data-product="${productType}"]`);
        if (btn) {
            btn.style.transform = 'scale(1.2)';
            btn.style.background = 'var(--success-green)';
            setTimeout(() => {
                btn.style.transform = '';
                btn.style.background = '';
            }, 300);
        }
    }

    showLoading(show, text = 'Processando...') {
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = document.querySelector('.loading-text');
        
        if (loadingOverlay && loadingText) {
            loadingText.textContent = text;
            loadingOverlay.classList.toggle('show', show);
            
            // Prevent scrolling when loading
            document.body.style.overflow = show ? 'hidden' : '';
        }
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('article');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Fechar notificação">×</button>
        `;

        toastContainer.appendChild(toast);

        // Show animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    addScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const elementsToAnimate = document.querySelectorAll(
            '.recommendation-card, .order-summary-section'
        );
        
        elementsToAnimate.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    preloadRecommendations() {
        // Simulate loading recommendations from API
        const recommendationCards = document.querySelectorAll('.recommendation-card');
        recommendationCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Utility methods
    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    simulateApiCall(delay = 800) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }

    // Advanced features
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Navigate through cart items with arrow keys
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const cartItems = document.querySelectorAll('.cart-item');
                const activeElement = document.activeElement;
                const currentIndex = Array.from(cartItems).findIndex(item => 
                    item.contains(activeElement)
                );
                
                if (currentIndex !== -1) {
                    e.preventDefault();
                    const nextIndex = e.key === 'ArrowDown' 
                        ? (currentIndex + 1) % cartItems.length
                        : (currentIndex - 1 + cartItems.length) % cartItems.length;
                    
                    const nextItem = cartItems[nextIndex];
                    const firstButton = nextItem.querySelector('button');
                    if (firstButton) firstButton.focus();
                }
            }
        });
    }

    setupSwipeGestures() {
        let startX = 0;
        let currentX = 0;
        let isSwipe = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwipe = true;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isSwipe) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (!isSwipe) return;
            
            const diff = startX - currentX;
            const threshold = 100;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swipe left - could trigger some action
                    console.log('Swipe left detected');
                } else {
                    // Swipe right - could go back
                    if (window.history.length > 1) {
                        window.history.back();
                    }
                }
            }
            
            isSwipe = false;
        });
    }

    // Performance monitoring
    trackPerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'measure') {
                        console.log(`${entry.name}: ${entry.duration}ms`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure'] });
        }
    }

    // Save cart state to localStorage
    saveCartState() {
        const cartState = {
            items: this.carrinho,
            appliedCoupon: this.appliedCoupon,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('cart-state', JSON.stringify(cartState));
        } catch (error) {
            console.warn('Não foi possível salvar o estado do carrinho:', error);
        }
    }

    // Load cart state from localStorage
    loadCartState() {
        try {
            const saved = localStorage.getItem('cart-state');
            if (saved) {
                const cartState = JSON.parse(saved);
                
                // Check if state is not too old (24 hours)
                const maxAge = 24 * 60 * 60 * 1000;
                if (Date.now() - cartState.timestamp < maxAge) {
                    this.carrinho = cartState.items || [];
                    this.appliedCoupon = cartState.appliedCoupon || null;
                    return true;
                }
            }
        } catch (error) {
            console.warn('Não foi possível carregar o estado do carrinho:', error);
        }
        return false;
    }

    // Analytics tracking (simulate)
    trackEvent(event, data = {}) {
        console.log('Analytics Event:', event, data);
        
        // Here you would integrate with your analytics service
        // Example: gtag('event', event, data);
    }

    // Export cart data for debugging
    exportCartData() {
        const cartData = {
            items: this.carrinho,
            subtotal: this.calculateSubtotal(),
            deliveryFee: this.calculateDeliveryFee(this.calculateSubtotal()),
            discount: this.calculateDiscount(this.calculateSubtotal()),
            appliedCoupon: this.appliedCoupon,
            timestamp: new Date().toISOString()
        };
        
        console.log('Cart Data Export:', cartData);
        return cartData;
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new PremiumCart();
    
    // Add CSS animation utilities if not already present
    if (!document.getElementById('cart-animations')) {
        const animationStyles = document.createElement('style');
        animationStyles.id = 'cart-animations';
        animationStyles.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            
            .cart-item {
                transition: all 0.3s ease;
            }
            
            .cart-item:hover {
                transform: translateY(-2px);
            }
            
            .pulse {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .shake {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(animationStyles);
    }
    
    // Setup additional features
    window.cart.setupKeyboardNavigation();
    window.cart.setupSwipeGestures();
    window.cart.trackPerformance();
    
    // Load saved cart state
    if (window.cart.loadCartState()) {
        window.cart.updateCartDisplay();
    }
    
    // Save cart state on changes
    const originalUpdateCartDisplay = window.cart.updateCartDisplay;
    window.cart.updateCartDisplay = function() {
        originalUpdateCartDisplay.call(this);
        this.saveCartState();
    };
    
    // Track page view
    window.cart.trackEvent('cart_view', {
        items_count: window.cart.carrinho.length,
        cart_value: window.cart.calculateSubtotal()
    });
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.cart) {
        window.cart.saveCartState();
    }
});

// Expose cart for global access and debugging
window.debugCart = () => {
    if (window.cart) {
        return window.cart.exportCartData();
    }
    return null;
};

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}