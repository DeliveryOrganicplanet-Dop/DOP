// Função para formatar preço
function formatarPreco(preco) {
    return `R$ ${preco.toFixed(2).replace('.', ',')}`;
}

// Os dados da compra vêm do servidor
const detalhesCompra = window.detalhesCompra;

// Exibe os detalhes da compra na página
if (detalhesCompra && detalhesCompra.totalItens > 0) {
    const detalhesCompraElement = document.getElementById('detalhes-compra');
    if (detalhesCompraElement) {
        detalhesCompraElement.innerHTML = `
            <p><strong>Total de Itens:</strong> ${detalhesCompra.totalItens}</p>
            <p><strong>Total da Compra:</strong> ${formatarPreco(detalhesCompra.totalPreco)}</p>
        `;
    }
} else {
    // Se não há detalhes da compra, mostra mensagem
    const detalhesCompraElement = document.getElementById('detalhes-compra');
    if (detalhesCompraElement) {
        detalhesCompraElement.innerHTML = '<p>Compra finalizada com sucesso!</p>';
    }
}
