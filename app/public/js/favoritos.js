// Gerenciamento de favoritos
class FavoritosManager {
    constructor() {
        this.favoritos = this.carregarFavoritos();
        this.init();
    }

    init() {
        this.renderizarFavoritos();
        this.atualizarContadores();
        this.bindEvents();
    }

    carregarFavoritos() {
        const favoritos = localStorage.getItem('favoritos');
        return favoritos ? JSON.parse(favoritos) : [];
    }

    salvarFavoritos() {
        localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
    }

    adicionarFavorito(produto) {
        const existe = this.favoritos.find(f => f.id === produto.id);
        if (!existe) {
            this.favoritos.push(produto);
            this.salvarFavoritos();
            this.renderizarFavoritos();
            this.atualizarContadores();
            this.mostrarToast('Produto adicionado aos favoritos!', 'success');
        }
    }

    removerFavorito(produtoId) {
        this.favoritos = this.favoritos.filter(f => f.id !== produtoId);
        this.salvarFavoritos();
        this.renderizarFavoritos();
        this.atualizarContadores();
        this.mostrarToast('Produto removido dos favoritos!', 'info');
    }

    limparFavoritos() {
        if (this.favoritos.length === 0) return;
        
        if (confirm('Tem certeza que deseja limpar todos os favoritos?')) {
            this.favoritos = [];
            this.salvarFavoritos();
            this.renderizarFavoritos();
            this.atualizarContadores();
            this.mostrarToast('Todos os favoritos foram removidos!', 'info');
        }
    }

    renderizarFavoritos() {
        const grid = document.getElementById('favorites-grid');
        const emptyState = document.getElementById('empty-favorites');
        
        if (this.favoritos.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        grid.style.display = 'grid';
        
        grid.innerHTML = this.favoritos.map(produto => `
            <section class="product-card">
                <button class="remove-favorite" onclick="favoritosManager.removerFavorito('${produto.id}')">×</button>
                <figure>
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </figure>
                <header>
                    <h3>${produto.nome}</h3>
                    <span>R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
                </header>
                <section class="product-actions">
                    <button class="add-cart-btn" onclick="favoritosManager.adicionarAoCarrinho('${produto.id}')">
                        🛒 Adicionar
                    </button>
                </section>
            </section>
        `).join('');
    }

    atualizarContadores() {
        const count = this.favoritos.length;
        const total = this.favoritos.reduce((sum, produto) => sum + produto.preco, 0);
        
        document.getElementById('favorites-count').textContent = `${count} produto${count !== 1 ? 's' : ''}`;
        document.getElementById('total-favorites').textContent = count;
        document.getElementById('total-value').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        const addAllBtn = document.getElementById('add-all-to-cart');
        addAllBtn.disabled = count === 0;
    }

    adicionarAoCarrinho(produtoId) {
        const produto = this.favoritos.find(f => f.id === produtoId);
        if (produto) {
            // Simular adição ao carrinho
            let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
            const itemExistente = carrinho.find(item => item.id === produto.id);
            
            if (itemExistente) {
                itemExistente.quantidade += 1;
            } else {
                carrinho.push({ ...produto, quantidade: 1 });
            }
            
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            this.mostrarToast('Produto adicionado ao carrinho!', 'success');
        }
    }

    adicionarTodosAoCarrinho() {
        if (this.favoritos.length === 0) return;
        
        let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
        
        this.favoritos.forEach(produto => {
            const itemExistente = carrinho.find(item => item.id === produto.id);
            if (itemExistente) {
                itemExistente.quantidade += 1;
            } else {
                carrinho.push({ ...produto, quantidade: 1 });
            }
        });
        
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        this.mostrarToast(`${this.favoritos.length} produtos adicionados ao carrinho!`, 'success');
    }

    bindEvents() {
        // Limpar favoritos
        document.getElementById('clear-favorites').addEventListener('click', () => {
            this.limparFavoritos();
        });

        // Adicionar todos ao carrinho
        document.getElementById('add-all-to-cart').addEventListener('click', () => {
            this.adicionarTodosAoCarrinho();
        });

        // Botões de favorito nas recomendações
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const produtoId = e.target.dataset.product;
                this.toggleFavorito(produtoId);
            });
        });

        // Botões de adicionar ao carrinho nas recomendações
        document.querySelectorAll('.add-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const produtoId = e.target.dataset.product;
                this.adicionarRecomendacaoAoCarrinho(produtoId);
            });
        });
    }

    toggleFavorito(produtoId) {
        // Produtos de exemplo
        const produtos = {
            'brocolis': { id: 'brocolis', nome: 'Brócolis Premium', preco: 9.70, imagem: 'imagens/brocolis.png' },
            'alface': { id: 'alface', nome: 'Alface Orgânica', preco: 2.99, imagem: 'imagens/alface.png' },
            'ameixa': { id: 'ameixa', nome: 'Ameixa Importada', preco: 2.99, imagem: 'imagens/ameixa.png' }
        };

        const produto = produtos[produtoId];
        if (!produto) return;

        const existe = this.favoritos.find(f => f.id === produtoId);
        if (existe) {
            this.removerFavorito(produtoId);
        } else {
            this.adicionarFavorito(produto);
        }
    }

    adicionarRecomendacaoAoCarrinho(produtoId) {
        const produtos = {
            'brocolis': { id: 'brocolis', nome: 'Brócolis Premium', preco: 9.70, imagem: 'imagens/brocolis.png' },
            'alface': { id: 'alface', nome: 'Alface Orgânica', preco: 2.99, imagem: 'imagens/alface.png' },
            'ameixa': { id: 'ameixa', nome: 'Ameixa Importada', preco: 2.99, imagem: 'imagens/ameixa.png' }
        };

        const produto = produtos[produtoId];
        if (produto) {
            this.adicionarAoCarrinho(produto.id);
        }
    }

    mostrarToast(mensagem, tipo = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `
            <span class="toast-message">${mensagem}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.favoritosManager = new FavoritosManager();
});

// CSS para toast
const style = document.createElement('style');
style.textContent = `
    .toast {
        background: white;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 1rem;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    }
    
    .toast.success { border-left: 4px solid #4CAF50; }
    .toast.info { border-left: 4px solid #2196F3; }
    .toast.error { border-left: 4px solid #f44336; }
    
    .toast-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #666;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);