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
        });
        
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
