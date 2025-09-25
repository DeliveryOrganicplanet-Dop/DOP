// Assinatura JavaScript
class SubscriptionManager {
    constructor() {
        this.selectedPlan = null;
        this.basePrices = {
            pequena: 35.00,
            media: 55.00,
            grande: 85.00,
            vegana: 65.00
        };
        this.addedProducts = [];
        this.totalPrice = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupThemeToggle();
    }

    bindEvents() {
        // Plan selection buttons
        document.querySelectorAll('.plan-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planType = e.target.dataset.plan;
                this.selectPlan(planType);
            });
        });

        // Add product buttons
        document.querySelectorAll('.add-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.extra-product');
                const productId = productCard.dataset.product;
                const productPrice = parseFloat(productCard.dataset.price);
                const productName = productCard.querySelector('.product-name').textContent;
                
                this.addProduct(productId, productName, productPrice, e.target);
            });
        });

        // Subscribe button
        document.getElementById('subscribe-btn').addEventListener('click', () => {
            this.processSubscription();
        });

        // Account button
        const btnConta = document.getElementById('btn-conta');
        if (btnConta) {
            btnConta.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/login';
            });
        }
    }

    selectPlan(planType) {
        this.selectedPlan = planType;
        this.addedProducts = [];
        this.updateTotalPrice();
        
        // Update UI
        document.getElementById('selected-plan-name').textContent = this.getPlanDisplayName(planType);
        document.getElementById('selected-plan-price').textContent = `R$ ${this.basePrices[planType].toFixed(2).replace('.', ',')}`;
        
        // Show customization section
        document.getElementById('customization').style.display = 'block';
        
        // Reset product buttons
        document.querySelectorAll('.add-product-btn').forEach(btn => {
            btn.textContent = 'Adicionar';
            btn.disabled = false;
        });
        
        // Hide added products section
        document.getElementById('added-products').style.display = 'none';
        document.getElementById('added-list').innerHTML = '';
        
        // Scroll to customization
        document.getElementById('customization').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    getPlanDisplayName(planType) {
        const names = {
            pequena: 'Box Pequena',
            media: 'Box Média',
            grande: 'Box Grande',
            vegana: 'Box Vegana'
        };
        return names[planType] || planType;
    }

    addProduct(productId, productName, productPrice, button) {
        // Check if product already added
        if (this.addedProducts.find(p => p.id === productId)) {
            return;
        }

        // Add product to list
        this.addedProducts.push({
            id: productId,
            name: productName,
            price: productPrice
        });

        // Update button state
        button.textContent = 'Adicionado';
        button.disabled = true;

        // Update UI
        this.updateAddedProductsList();
        this.updateTotalPrice();
        
        // Show added products section
        document.getElementById('added-products').style.display = 'block';
    }

    removeProduct(productId) {
        // Remove from added products
        this.addedProducts = this.addedProducts.filter(p => p.id !== productId);
        
        // Reset button state
        const productCard = document.querySelector(`[data-product="${productId}"]`);
        if (productCard) {
            const button = productCard.querySelector('.add-product-btn');
            button.textContent = 'Adicionar';
            button.disabled = false;
        }
        
        // Update UI
        this.updateAddedProductsList();
        this.updateTotalPrice();
        
        // Hide section if no products
        if (this.addedProducts.length === 0) {
            document.getElementById('added-products').style.display = 'none';
        }
    }

    updateAddedProductsList() {
        const addedList = document.getElementById('added-list');
        addedList.innerHTML = '';
        
        this.addedProducts.forEach(product => {
            const listItem = document.createElement('li');
            listItem.className = 'added-item';
            listItem.innerHTML = `
                <div class="added-item-info">
                    <div class="added-item-name">${product.name}</div>
                    <div class="added-item-price">+ R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <button class="remove-item-btn" onclick="subscriptionManager.removeProduct('${product.id}')">
                    Remover
                </button>
            `;
            addedList.appendChild(listItem);
        });
    }

    updateTotalPrice() {
        if (!this.selectedPlan) {
            this.totalPrice = 0;
        } else {
            const basePrice = this.basePrices[this.selectedPlan];
            const extrasPrice = this.addedProducts.reduce((sum, product) => sum + product.price, 0);
            this.totalPrice = basePrice + extrasPrice;
        }
        
        document.getElementById('total-price').textContent = `R$ ${this.totalPrice.toFixed(2).replace('.', ',')}`;
    }

    processSubscription() {
        if (!this.selectedPlan) {
            alert('Por favor, selecione um plano primeiro.');
            return;
        }

        // Verificar se usuário está logado através do DOM
        const isLoggedIn = !document.getElementById('btn-conta');
        if (!isLoggedIn) {
            alert('Você precisa estar logado para fazer uma assinatura.');
            window.location.href = '/login';
            return;
        }

        // Prepare subscription data
        const subscriptionData = {
            plan: this.selectedPlan,
            planName: this.getPlanDisplayName(this.selectedPlan),
            basePrice: this.basePrices[this.selectedPlan],
            extraProducts: this.addedProducts,
            totalPrice: this.totalPrice
        };

        // Show confirmation
        const confirmMessage = `
            Confirmar assinatura:
            
            Plano: ${subscriptionData.planName}
            Valor base: R$ ${subscriptionData.basePrice.toFixed(2).replace('.', ',')}
            ${subscriptionData.extraProducts.length > 0 ? 
                'Produtos extras: ' + subscriptionData.extraProducts.map(p => p.name).join(', ') : 
                'Sem produtos extras'
            }
            
            Total mensal: R$ ${subscriptionData.totalPrice.toFixed(2).replace('.', ',')}
            
            Deseja continuar?
        `;

        if (confirm(confirmMessage)) {
            this.submitSubscription(subscriptionData);
        }
    }

    async submitSubscription(subscriptionData) {
        try {
            // Here you would normally send to your backend
            console.log('Subscription data:', subscriptionData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert('Assinatura realizada com sucesso! Você receberá um email de confirmação em breve.');
            
            // Redirect to account page or subscription management
            window.location.href = '/conta';
            
        } catch (error) {
            console.error('Erro ao processar assinatura:', error);
            alert('Erro ao processar assinatura. Tente novamente.');
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('toggle-dark');
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark');
            themeIcon.textContent = '☀️';
            themeToggle.setAttribute('aria-pressed', 'true');
        }

        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark');
            const isDark = body.classList.contains('dark');
            
            themeIcon.textContent = isDark ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-pressed', isDark);
            
            // Save preference
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
}

// Search functionality
function buscarProdutos() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        // Redirect to search results or filter products
        window.location.href = `/?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.subscriptionManager = new SubscriptionManager();
});

// Handle search on Enter key
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarProdutos();
            }
        });
    }
});