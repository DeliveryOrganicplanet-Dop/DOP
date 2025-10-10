// Funções comuns do carrinho para todas as páginas

// Função para adicionar produto ao carrinho
async function adicionarAoCarrinho(id, nome, preco) {
    try {
        const response = await fetch('/api/carrinho/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                id: id,
                nome: nome,
                preco: preco,
                quantidade: 1
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            atualizarContadorCarrinho();
            mostrarNotificacao(`${nome} adicionado ao carrinho!`, 'success');
        } else {
            mostrarNotificacao('Erro ao adicionar produto', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao adicionar produto', 'error');
    }
}

// Função para atualizar contador do carrinho
async function atualizarContadorCarrinho() {
    try {
        const response = await fetch('/api/carrinho');
        if (response.ok) {
            const data = await response.json();
            const carrinho = data.carrinho || [];
            const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
            
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = totalItens;
                cartCount.classList.toggle('hidden', totalItens === 0);
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
    }
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.textContent = mensagem;
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
    
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Função de busca
function buscarProdutos() {
    const searchInput = document.getElementById('search-input');
    const termo = searchInput ? searchInput.value.trim() : '';
    
    if (termo) {
        window.location.href = `/produtos?busca=${encodeURIComponent(termo)}`;
    } else {
        window.location.href = '/produtos';
    }
}

// Inicializar contador do carrinho
document.addEventListener('DOMContentLoaded', () => {
    atualizarContadorCarrinho();
    
    // Configurar busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarProdutos();
            }
        });
    }
});