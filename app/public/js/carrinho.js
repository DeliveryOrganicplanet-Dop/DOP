// Função para formatar o preço em reais
function formatarPreco(preco) {
    return `R$ ${preco.toFixed(2).replace('.', ',')}`;
}

// Função para adicionar um produto ao carrinho
function adicionarProduto(nome, preco, imagem) {
    // Recupera o carrinho do localStorage ou cria um array vazio
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // Verifica se o produto já está no carrinho
    const itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ nome, preco, imagem, quantidade: 1 });
    }

    // Atualiza o carrinho no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Atualiza o carrinho na tela
    atualizarCarrinho();
}

// Função para remover um item do carrinho
function removerItem(nome) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // Filtra o item a ser removido
    carrinho = carrinho.filter(item => item.nome !== nome);

    // Atualiza o carrinho no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Atualiza o carrinho na tela
    atualizarCarrinho();
}

// Função para atualizar a quantidade de um item
function atualizarQuantidade(nome, quantidade) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // Encontra o item no carrinho e atualiza a quantidade
    const item = carrinho.find(item => item.nome === nome);
    if (item) {
        item.quantidade = parseInt(quantidade);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarCarrinho();
    }
}

// Função para atualizar o carrinho na tela
function atualizarCarrinho() {
    const listaCarrinho = document.getElementById('lista-carrinho');
    const mensagemCarrinhoVazio = document.getElementById('mensagem-carrinho-vazio');
    const btnFinalizar = document.querySelector('.btn-finalizar');

    // Limpa o conteúdo atual da lista do carrinho
    listaCarrinho.innerHTML = '';

    // Recupera o carrinho do localStorage
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

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
                <input type="number" value="${item.quantidade}" min="1" class="quantidade" onchange="atualizarQuantidade('${item.nome}', this.value)">
                <button class="btn-remover" onclick="removerItem('${item.nome}')">Remover</button>
            </footer>
        `;
        listaCarrinho.appendChild(itemCarrinho);
    });

    // Atualiza o resumo do carrinho
    document.getElementById('total-itens').textContent = `Total de itens: ${totalItens}`;
    document.getElementById('total-preco').textContent = `Total: ${formatarPreco(totalPreco)}`;
}

// Inicializa o carrinho vazio ao carregar
atualizarCarrinho();
