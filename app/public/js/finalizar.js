// Recupera os detalhes da compra do localStorage
const detalhesCompra = JSON.parse(localStorage.getItem('compraFinalizada'));

// Exibe os detalhes da compra na página
if (detalhesCompra) {
    const detalhesCompraElement = document.getElementById('detalhes-compra');
    detalhesCompraElement.innerHTML = `
        <p><strong>Total de Itens:</strong> ${detalhesCompra.totalItens}</p>
        <p><strong>Total da Compra:</strong> ${formatarPreco(detalhesCompra.totalPreco)}</p>
    `;
} else {
    window.location.href = '/'; // Redireciona para a página inicial se não houver detalhes da compra
}
