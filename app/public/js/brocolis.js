// Arquivo: js/produto.js

function adicionarAoCarrinho() {
    // Dados do produto
    const produto = {
        nome: 'Brócolis ninja',
        preco: 9.70,
        imagem: 'imagens/brocolis.png',
        quantidade: 1
    };

    // Recupera o carrinho do localStorage ou cria um array vazio
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // Verifica se o produto já existe no carrinho
    const itemExistente = carrinho.find(item => item.nome === produto.nome);

    if (itemExistente) {
        // Se o produto já existe, incrementa a quantidade
        itemExistente.quantidade += 1;
    } else {
        // Caso contrário, adiciona o produto
        carrinho.push(produto);
    }

    // Salva o carrinho atualizado no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Redireciona para a página do carrinho
    window.location.href = '/carrinho';
}
