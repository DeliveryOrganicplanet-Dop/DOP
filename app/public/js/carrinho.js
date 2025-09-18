// Função para formatar o preço em reais
function formatarPreco(preco) {
    return `R$ ${preco.toFixed(2).replace('.', ',')}`;
}

// Carrinho será carregado do servidor
let carrinho = window.carrinhoData || [];

// Função para atualizar o carrinho na tela
function atualizarCarrinho() {
    const listaCarrinho = document.getElementById('lista-carrinho');
    const mensagemCarrinhoVazio = document.getElementById('mensagem-carrinho-vazio');
    const btnFinalizar = document.getElementById('btn-finalizar');

    // Limpa o conteúdo atual da lista do carrinho
    listaCarrinho.innerHTML = '';

    // Se o carrinho estiver vazio, exibe a mensagem de carrinho vazio e desabilita o botão
    if (carrinho.length === 0) {
        mensagemCarrinhoVazio.style.display = 'block';
        btnFinalizar.disabled = true;
        document.getElementById('total-itens').textContent = `Total de itens: 0`;
        document.getElementById('total-preco').textContent = `Total: R$ 0,00`;
        return;
    }

    // Oculta a mensagem de carrinho vazio e habilita o botão finalizar
    mensagemCarrinhoVazio.style.display = 'none';
    btnFinalizar.disabled = false;

    let totalItens = 0;
    let totalPreco = 0;

    // Cria os elementos para cada item no carrinho
    carrinho.forEach(item => {
        totalItens += item.quantidade;
        totalPreco += item.preco * item.quantidade;

        // Cria o HTML para o item
        const itemCarrinho = document.createElement('div');
        itemCarrinho.classList.add('produto');
        itemCarrinho.innerHTML = `
            <figure>
                <img src="${item.imagem}" alt="${item.nome}">
                <figcaption>${item.nome}</figcaption>
            </figure>
            <header class="produto-header">
                <h3>${item.nome}</h3>
                <p>${formatarPreco(item.preco)} <span class="unidade">Unidade</span></p>
            </header>
            <footer class="produto-footer">
                <button class="btn-quantidade" onclick="alterarQuantidade('${item.nome}', -1)">-</button>
                <span class="quantidade">${item.quantidade}</span>
                <button class="btn-quantidade" onclick="alterarQuantidade('${item.nome}', 1)">+</button>
                <button class="btn-remover" onclick="removerItem('${item.nome}')">Remover</button>
            </footer>
        `;
        listaCarrinho.appendChild(itemCarrinho);
    });

    // Atualiza o resumo do carrinho
    document.getElementById('total-itens').textContent = `Total de itens: ${totalItens}`;
    document.getElementById('total-preco').textContent = `Total: ${formatarPreco(totalPreco)}`;

    // Carrinho é atualizado automaticamente no servidor
}

// Função para alterar a quantidade de um item (com os botões + e -)
async function alterarQuantidade(nome, delta) {
    const item = carrinho.find(item => item.nome === nome);
    if (item) {
        const novaQuantidade = Math.max(1, item.quantidade + delta);
        
        try {
            const response = await fetch('/api/carrinho/quantidade', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, quantidade: novaQuantidade })
            });
            
            if (response.ok) {
                item.quantidade = novaQuantidade;
                atualizarCarrinho();
            } else {
                alert('Erro ao atualizar quantidade');
            }
        } catch (error) {
            console.error('Erro ao alterar quantidade:', error);
            alert('Erro ao atualizar quantidade');
        }
    }
}

// Função para remover um item do carrinho
async function removerItem(nome) {
    try {
        const response = await fetch('/api/carrinho/remover', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome })
        });
        
        if (response.ok) {
            carrinho = carrinho.filter(item => item.nome !== nome);
            atualizarCarrinho();
        } else {
            alert('Erro ao remover item');
        }
    } catch (error) {
        console.error('Erro ao remover item:', error);
        alert('Erro ao remover item');
    }
}

// Função para adicionar um produto ao carrinho (não usada nesta página)
function adicionarProduto(nome, preco, imagem) {
    // Esta função não é usada na página do carrinho
    console.log('Função não utilizada nesta página');
}

// Função para finalizar a compra
async function finalizarCompra() {
    // Verifica se o carrinho está vazio
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
        return;
    }

    try {
        // Simulação de pagamento com sucesso
        alert("Compra finalizada com sucesso! Obrigado pela sua compra.");

        // Limpa o carrinho no servidor
        const response = await fetch('/api/carrinho/limpar', {
            method: 'DELETE'
        });// Carrinho Premium - JavaScript Enhanced

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

    showLoading(show, text = '
        
        if (response.ok) {
            // Redireciona para a página de finalização
            window.location.href = '/finalizar';
        } else {
            alert('Erro ao finalizar compra');
        }
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        alert('Erro ao finalizar compra');
    }
}

// Inicializa o carrinho
atualizarCarrinho();

