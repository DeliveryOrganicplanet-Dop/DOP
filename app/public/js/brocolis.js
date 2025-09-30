function adicionarProduto(nome, preco, imagem) {
    const quantidade = parseInt(document.getElementById('quantity').value);
    
    fetch('/api/carrinho/adicionar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome: nome,
            preco: preco,
            imagem: imagem,
            quantidade: quantidade
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`${quantidade}x ${nome} adicionado ao carrinho!`, 'success');
            mostrarBotaoCarrinho();
            updateCartIcon();
        } else {
            showNotification('Erro ao adicionar produto', 'error');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        showNotification('Erro ao adicionar produto', 'error');
    });
}

function increaseQuantity() {
    const input = document.getElementById('quantity');
    const currentValue = parseInt(input.value);
    if (currentValue < 10) {
        input.value = currentValue + 1;
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    const currentValue = parseInt(input.value);
    if (currentValue > 1) {
        input.value = currentValue - 1;
    }
}

function toggleFavorite() {
    const btn = document.querySelector('.favorite');
    const isFavorited = btn.classList.contains('favorited');
    
    if (isFavorited) {
        btn.classList.remove('favorited');
        btn.innerHTML = '♡ Favoritar';
        showNotification('Removido dos favoritos', 'info');
    } else {
        btn.classList.add('favorited');
        btn.innerHTML = '♥️ Favoritado';
        showNotification('Adicionado aos favoritos!', 'success');
    }
}

function showTab(tabName) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Adicionar classe active ao botão clicado
    event.target.classList.add('active');
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeButton = document.querySelector('.theme-toggle');
    themeButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = '#4CAF50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        case 'info':
            notification.style.background = '#2196F3';
            break;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showNotificationWithCartButton(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} with-button`;
    
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button onclick="window.location.href='/carrinho'" class="cart-button">
            🛒 Ir para o Carrinho
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = '#4CAF50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        case 'info':
            notification.style.background = '#2196F3';
            break;
    }
    
    // Estilo do botão
    const cartButton = notification.querySelector('.cart-button');
    if (cartButton) {
        cartButton.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        `;
        
        cartButton.addEventListener('mouseenter', () => {
            cartButton.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        
        cartButton.addEventListener('mouseleave', () => {
            cartButton.style.background = 'rgba(255, 255, 255, 0.2)';
        });
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000); // Mais tempo para permitir clicar no botão
}

function updateCartIcon() {
    // Atualizar contador do carrinho se existir
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        fetch('/api/carrinho')
            .then(response => response.json())
            .then(data => {
                const totalItems = data.carrinho?.reduce((acc, item) => acc + item.quantidade, 0) || 0;
                cartCounter.textContent = totalItems;
            });
    }
}

function mostrarBotaoCarrinho() {
    const addButton = document.querySelector('.add-to-cart');
    const goToCartButton = document.querySelector('.go-to-cart');
    
    if (addButton && goToCartButton) {
        addButton.style.display = 'none';
        goToCartButton.style.display = 'inline-block';
        goToCartButton.style.background = '#4CAF50';
        goToCartButton.style.color = 'white';
        goToCartButton.style.border = '1px solid #4CAF50';
        goToCartButton.style.padding = '0.75rem 1.5rem';
        goToCartButton.style.borderRadius = '5px';
        goToCartButton.style.cursor = 'pointer';
    }
}

function changeMainImage(src) {
    document.querySelector('.product-img').src = src;
    
    // Atualizar thumbnails
    document.querySelectorAll('.thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });
    event.target.classList.add('active');
}

function initializeImageGallery() {
    document.querySelectorAll('.thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            changeMainImage(thumb.src);
        });
    });
}

function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    document.querySelectorAll('.product-card, .review, .seller-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Inicializar galeria de imagens
    initializeImageGallery();
    
    // Animações no scroll
    animateOnScroll();
    
    // Atualizar contador do carrinho
    updateCartIcon();
    
    // Adicionar estilos de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .favorite.favorited {
            background: #e91e63 !important;
            color: white !important;
            border-color: #e91e63 !important;
        }
    `;
    document.head.appendChild(style);
});