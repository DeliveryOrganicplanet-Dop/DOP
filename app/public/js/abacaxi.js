// Função para adicionar um produto ao carrinho
async function adicionarProduto(nome, preco, imagem) {
    try {
        const response = await fetch('/api/carrinho/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, preco, imagem })
        });

        if (response.ok) {
            window.location.href = '/carrinho';
        } else {
            const error = await response.json();
            alert('Erro ao adicionar produto: ' + (error.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        alert('Erro ao adicionar produto ao carrinho. Tente novamente.');
    }
}
