// Função para formatar o preço em reais
function formatarPreco(preco) {
    return `R$ ${preco.toFixed(2).replace('.', ',')}`;
}

// Recupera o carrinho do localStorage ou cria um array vazio
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

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

    // Salva o carrinho no localStorage após a atualização
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Função para alterar a quantidade de um item (com os botões + e -)
function alterarQuantidade(nome, delta) {
    const item = carrinho.find(item => item.nome === nome);
    if (item) {
        item.quantidade += delta;
        if (item.quantidade < 1) {
            item.quantidade = 1;  // Garante que a quantidade não seja menor que 1
        }
        atualizarCarrinho();
    }
}

// Função para remover um item do carrinho
function removerItem(nome) {
    carrinho = carrinho.filter(item => item.nome !== nome);
    atualizarCarrinho();
}

// Função para adicionar um produto ao carrinho
function adicionarProduto(nome, preco, imagem) {
    const produtoExistente = carrinho.find(item => item.nome === nome);
    if (produtoExistente) {
        produtoExistente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nome,
            preco: preco,
            imagem: imagem,
            quantidade: 1
        });
    }
    atualizarCarrinho();
}

// Função para finalizar a compra
function finalizarCompra() {
    // Verifica se o carrinho está vazio
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
        return;
    }

    // Simulação de pagamento com sucesso
    alert("Compra finalizada com sucesso! Obrigado pela sua compra.");

    // Salva os detalhes da compra no localStorage (opcional)
    const detalhesCompra = {
        itens: carrinho,
        totalItens: carrinho.reduce((acc, item) => acc + item.quantidade, 0),
        totalPreco: carrinho.reduce((acc, item) => acc + (item.quantidade * item.preco), 0)
    };
    localStorage.setItem('detalhesCompra', JSON.stringify(detalhesCompra));

    // Limpa o carrinho e o localStorage após a compra
    carrinho = [];
    localStorage.removeItem('carrinho');

    // Redireciona para a página de sucesso (finalizar-compra.html)
    window.location.href = '/finalizar';
}

// Inicializa o carrinho
atualizarCarrinho();
