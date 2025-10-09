// Carrinho simples e funcional
class CarrinhoSimple {
    constructor() {
        this.carrinho = window.carrinhoData || [];
        this.cupomAplicado = localStorage.getItem('cupom-aplicado') || null;
        this.init();
    }

    async init() {
        await this.carregarCarrinho();
        this.renderizarCarrinho();
        this.bindEvents();
    }

    async carregarCarrinho() {
        try {
            const response = await fetch('/api/carrinho');
            if (response.ok) {
                const data = await response.json();
                this.carrinho = data.carrinho || [];
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
        }
    }

    bindEvents() {
        // Limpar carrinho
        const clearBtn = document.getElementById('clear-cart');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.limparCarrinho());
        }

        // Finalizar compra
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.finalizarCompra());
        }

        // Cupom
        const couponForm = document.getElementById('coupon-form');
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => this.aplicarCupom(e));
        }



        // Produtos recomendados
        document.querySelectorAll('[data-product]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const produto = e.target.dataset.product;
                this.adicionarProduto(produto);
            });
        });
        
        // Carregar tema salvo
        this.loadTheme();
    }

    renderizarCarrinho() {
        const cartList = document.getElementById('cart-list');
        const emptyCart = document.getElementById('empty-cart');
        const itemsCount = document.getElementById('items-count');
        const recommendations = document.querySelector('.recommendations');

        if (this.carrinho.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartList) cartList.style.display = 'none';
            if (itemsCount) itemsCount.textContent = '0 itens';
            if (recommendations) recommendations.style.marginTop = '2rem';
            this.atualizarResumo();
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartList) cartList.style.display = 'block';
        if (recommendations) recommendations.style.marginTop = '200px';

        const totalItens = this.carrinho.reduce((sum, item) => sum + item.quantidade, 0);
        if (itemsCount) itemsCount.textContent = `${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`;

        if (cartList) {
            cartList.innerHTML = this.carrinho.map(item => `
                <li class="cart-item">
                    <div class="item-info">
                        <img src="${item.imagem}" alt="${item.nome}" class="item-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline'">
                        <span class="item-icon" style="display:none">📦</span>
                        <div class="item-details">
                            <h3>${item.nome}</h3>
                            <p>R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                    <div class="item-controls">
                        <button onclick="carrinho.alterarQuantidade('${item.nome}', ${item.quantidade - 1})">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="carrinho.alterarQuantidade('${item.nome}', ${item.quantidade + 1})">+</button>
                        <button onclick="carrinho.removerItem('${item.nome}')" class="remove-btn">🗑️</button>
                    </div>
                </li>
            `).join('');
        }

        this.atualizarResumo();
    }

    atualizarResumo() {
        const subtotal = this.carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const taxaEntrega = subtotal > 0 ? 5.00 : 0;
        const desconto = this.calcularDesconto(subtotal);
        const total = subtotal + taxaEntrega - desconto;

        const subtotalEl = document.getElementById('subtotal');
        const deliveryFeeEl = document.getElementById('delivery-fee');
        const descontoEl = document.getElementById('discount');
        const totalEl = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkout-btn');
        const discountRow = document.getElementById('discount-row');

        if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if (deliveryFeeEl) deliveryFeeEl.textContent = `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`;
        if (descontoEl) descontoEl.textContent = `- R$ ${desconto.toFixed(2).replace('.', ',')}`;
        if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        if (checkoutBtn) checkoutBtn.disabled = this.carrinho.length === 0;
        if (discountRow) discountRow.style.display = desconto > 0 ? 'flex' : 'none';
    }
    
    calcularDesconto(subtotal) {
        if (this.cupomAplicado) {
            return subtotal * 0.5; // 50% de desconto
        }
        return 0;
    }

    async adicionarProduto(produtoId) {
        const produtos = {
            'brocolis': { nome: 'Brócolis ninja', preco: 9.70, imagem: 'imagens/brocolis.png', quantidade: 1 },
            'alface': { nome: 'Alface Crespa', preco: 2.99, imagem: 'imagens/alface.png', quantidade: 1 },
            'abacaxi': { nome: 'Abacaxi Pérola', preco: 9.85, imagem: 'imagens/abacaxi.png', quantidade: 1 }
        };

        const produto = produtos[produtoId];
        if (!produto) return;

        try {
            const response = await fetch('/api/carrinho/adicionar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produto)
            });

            if (response.ok) {
                const data = await response.json();
                this.carrinho = data.carrinho;
                this.renderizarCarrinho();
                this.mostrarToast(`${produto.nome} adicionado ao carrinho!`);
            } else {
                this.mostrarToast('Erro ao adicionar produto', 'error');
            }
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            this.mostrarToast('Erro ao adicionar produto', 'error');
        }
    }

    async alterarQuantidade(nome, novaQuantidade) {
        if (novaQuantidade < 1) {
            this.removerItem(nome);
            return;
        }

        try {
            const response = await fetch('/api/carrinho/quantidade', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, quantidade: novaQuantidade })
            });

            if (response.ok) {
                const data = await response.json();
                this.carrinho = data.carrinho;
                this.renderizarCarrinho();
            }
        } catch (error) {
            console.error('Erro ao alterar quantidade:', error);
            this.mostrarToast('Erro ao alterar quantidade', 'error');
        }
    }

    async removerItem(nome) {
        try {
            const response = await fetch('/api/carrinho/remover', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome })
            });

            if (response.ok) {
                const data = await response.json();
                this.carrinho = data.carrinho;
                this.renderizarCarrinho();
                this.mostrarToast('Item removido do carrinho');
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
            this.mostrarToast('Erro ao remover item', 'error');
        }
    }

    async limparCarrinho() {
        if (this.carrinho.length === 0) return;
        
        if (!confirm('Tem certeza que deseja limpar o carrinho?')) return;

        try {
            const response = await fetch('/api/carrinho/limpar', {
                method: 'DELETE'
            });

            if (response.ok) {
                this.carrinho = [];
                this.renderizarCarrinho();
                this.mostrarToast('Carrinho limpo!');
            }
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            this.mostrarToast('Erro ao limpar carrinho', 'error');
        }
    }

    aplicarCupom(e) {
        e.preventDefault();
        const input = document.getElementById('coupon-input');
        const codigo = input.value.trim().toUpperCase();
        
        if (!codigo) {
            this.mostrarToast('Digite um código de cupom', 'error');
            return;
        }

        const cuponsValidos = ['DOP', 'VINTELO'];
        
        if (cuponsValidos.includes(codigo)) {
            this.cupomAplicado = codigo;
            localStorage.setItem('cupom-aplicado', codigo);
            this.atualizarResumo();
            this.mostrarToast(`Cupom ${codigo} aplicado! 50% de desconto`);
            input.value = '';
        } else {
            this.mostrarToast('Cupom inválido', 'error');
        }
    }

    finalizarCompra() {
        if (this.carrinho.length === 0) {
            this.mostrarToast('Seu carrinho está vazio', 'error');
            return;
        }

        window.location.href = '/finalizar';
    }


    
    loadTheme() {
        // Carregar apenas o tema global definido na home
        const globalTheme = localStorage.getItem('theme') || 'light';
        const body = document.body;
        
        if (globalTheme === 'dark') {
            body.classList.add('dark');
        }
    }

    mostrarToast(mensagem, tipo = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `
            <span>${mensagem}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Inicializar carrinho
document.addEventListener('DOMContentLoaded', () => {
    window.carrinho = new CarrinhoSimple();
});

// CSS para toast
const style = document.createElement('style');
style.textContent = `
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 5px;
        margin-bottom: 1rem;
    }
    
    .item-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .item-icon {
        font-size: 2rem;
    }
    
    .item-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 5px;
    }
    
    .product-card img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 5px;
    }
    
    .product-card small {
        color: #666;
        font-size: 0.8rem;
        display: block;
        margin-top: 0.25rem;
    }
    
    .item-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .item-controls button {
        background: #f0f0f0;
        border: 1px solid #ddd;
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        cursor: pointer;
    }
    
    .remove-btn {
        background: #ff4444 !important;
        color: white !important;
        border-color: #ff4444 !important;
    }
    
    .toast {
        background: white;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 1rem;
        margin-bottom: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .toast.success { border-left: 4px solid #4CAF50; }
    .toast.error { border-left: 4px solid #f44336; }
    
    .toast button {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
    }
`;
document.head.appendChild(style);