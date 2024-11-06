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

    // Redireciona para a página do carrinho
    window.location.href = '/carrinho';  // Substitua '/carrinho.html' pelo caminho correto da sua página de carrinho
}
