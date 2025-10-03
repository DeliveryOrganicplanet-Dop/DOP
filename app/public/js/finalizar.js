// Função para processar pagamento com Mercado Pago
document.getElementById('btn-mercado-pago').addEventListener('click', async function() {
    try {
        // Obter dados do carrinho via API
        const carrinhoResponse = await fetch('/api/carrinho');
        const carrinhoData = await carrinhoResponse.json();
        const carrinho = carrinhoData.carrinho || carrinhoData || [];
        
        console.log('Carrinho:', carrinho);
        
        if (!carrinho || carrinho.length === 0) {
            alert('Carrinho vazio! Adicione produtos primeiro.');
            return;
        }
        
        const response = await fetch('/api/pagamento/criar-preferencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itens: carrinho,
                usuario: { nome: 'Cliente', email: 'cliente@teste.com' }
            })
        });
        
        const data = await response.json();
        
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert('Erro ao processar pagamento');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar pagamento');
    }
});