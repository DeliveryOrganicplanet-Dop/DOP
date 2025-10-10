let enderecoSelecionado = null;
let valorFrete = 0;
let subtotal = 0;

// Carregar endereços do usuário
async function carregarEnderecos() {
    try {
        console.log('Carregando dados do usuário...');
        const response = await fetch('/api/user-data');
        const responseText = await response.text();
        
        // Verificar se a resposta é HTML (redirecionamento para login)
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
            console.log('Usuário não logado - redirecionado para login');
            const select = document.getElementById('endereco-select');
            select.innerHTML = '<option value="">Faça login para ver seus endereços</option>';
            return;
        }
        
        const userData = JSON.parse(responseText);
        console.log('Dados do usuário:', userData);
        
        if (userData && userData.ID_USUARIO) {
            console.log('Buscando endereços para usuário:', userData.ID_USUARIO);
            const enderecosResponse = await fetch(`/api/enderecos/${userData.ID_USUARIO}`, {
                credentials: 'include'
            });
            if (enderecosResponse.status === 401) {
                console.log('Usuário não autenticado ao buscar endereços.');
                const select = document.getElementById('endereco-select');
                select.innerHTML = '<option value="">Faça login para ver seus endereços</option>';
                return;
            }
            if (enderecosResponse.status === 404) {
                console.log('Endereços não encontrados para o usuário.');
                const select = document.getElementById('endereco-select');
                select.innerHTML = '<option value="">Nenhum endereço cadastrado</option>';
                return;
            }
            const enderecos = await enderecosResponse.json();
            console.log('Endereços encontrados:', enderecos);
            const select = document.getElementById('endereco-select');
            select.innerHTML = '<option value="">Selecione um endereço</option>';
            enderecos.forEach(endereco => {
                const option = document.createElement('option');
                option.value = endereco.id_endereco;
                option.textContent = `${endereco.nome_endereco} - ${endereco.logradouro}, ${endereco.bairro}, ${endereco.cidade}/${endereco.uf}`;
                option.dataset.cep = endereco.cep;
                select.appendChild(option);
            });
            // Adicionar opção de novo endereço
            const novoOption = document.createElement('option');
            novoOption.value = 'novo';
            novoOption.textContent = '+ Cadastrar novo endereço';
            select.appendChild(novoOption);
        } else {
            const select = document.getElementById('endereco-select');
            select.innerHTML = '<option value="">Erro ao carregar dados do usuário</option>';
        }
    } catch (error) {
        console.error('Erro ao carregar endereços:', error);
        const select = document.getElementById('endereco-select');
        select.innerHTML = '<option value="">Erro ao carregar endereços</option>';
    }
}

// Calcular frete
async function calcularFrete() {
    try {
        const select = document.getElementById('endereco-select');
        const selectedOption = select.options[select.selectedIndex];
        const cepDestino = selectedOption.dataset.cep;
        
        const carrinhoResponse = await fetch('/api/carrinho');
        const carrinhoData = await carrinhoResponse.json();
        const carrinho = carrinhoData.carrinho || carrinhoData || [];
        
        const response = await fetch('/api/calcular-frete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cep_destino: cepDestino, carrinho })
        });
        
        const data = await response.json();
        
        if (data.frete) {
            valorFrete = parseFloat(data.frete);
            document.getElementById('valor-frete').textContent = valorFrete.toFixed(2).replace('.', ',');
            document.getElementById('total-final').textContent = (subtotal + valorFrete).toFixed(2).replace('.', ',');
            document.getElementById('frete-info').style.display = 'block';
            
            // Mostrar detalhes do endereço
            const detalhes = document.getElementById('endereco-detalhes');
            detalhes.innerHTML = `
                <p><strong>Endereço selecionado:</strong> ${selectedOption.textContent}</p>
                <p><strong>Vendedor:</strong> ${data.vendedor.nome} - ${data.vendedor.cidade}/${data.vendedor.uf}</p>
            `;
            detalhes.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao calcular frete:', error);
        alert('Erro ao calcular frete');
    }
}

// Salvar novo endereço
async function salvarNovoEndereco() {
    try {
        const userData = await fetch('/api/user-data').then(r => r.json());
        
        const endereco = {
            id_usuario: userData.ID_USUARIO,
            logradouro: document.getElementById('logradouro').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            uf: document.getElementById('uf').value,
            cep: document.getElementById('cep').value.replace(/\D/g, '')
        };
        
        const response = await fetch('/api/enderecos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(endereco)
        });
        
        if (response.ok) {
            const novoEndereco = await response.json();
            
            // Adicionar ao select
            const select = document.getElementById('endereco-select');
            const option = document.createElement('option');
            option.value = novoEndereco.id_endereco;
            option.textContent = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.cidade}/${endereco.uf}`;
            option.dataset.cep = endereco.cep;
            option.selected = true;
            
            select.insertBefore(option, select.lastElementChild);
            
            // Esconder formulário
            document.getElementById('form-novo-endereco').style.display = 'none';
            document.getElementById('btn-calcular-frete').disabled = false;
            
            alert('Endereço salvo com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao salvar endereço:', error);
        alert('Erro ao salvar endereço');
    }
}

// Event listeners
document.getElementById('endereco-select').addEventListener('change', function() {
    const formNovoEndereco = document.getElementById('form-novo-endereco');
    const btnCalcular = document.getElementById('btn-calcular-frete');
    
    if (this.value === 'novo') {
        formNovoEndereco.style.display = 'block';
        btnCalcular.disabled = true;
    } else {
        formNovoEndereco.style.display = 'none';
        btnCalcular.disabled = !this.value;
    }
    
    if (!this.value || this.value === 'novo') {
        document.getElementById('frete-info').style.display = 'none';
        document.getElementById('endereco-detalhes').style.display = 'none';
    }
});

document.getElementById('btn-salvar-endereco').addEventListener('click', salvarNovoEndereco);

document.getElementById('btn-calcular-frete').addEventListener('click', calcularFrete);

// Função para processar pagamento com Mercado Pago
document.getElementById('btn-mercado-pago').addEventListener('click', async function() {
    try {
        // Verificar se endereço foi selecionado
        const select = document.getElementById('endereco-select');
        if (!select.value) {
            alert('Selecione um endereço de entrega primeiro!');
            return;
        }
        
        // Obter dados do carrinho via API
        const carrinhoResponse = await fetch('/api/carrinho');
        const carrinhoData = await carrinhoResponse.json();
        const carrinho = carrinhoData.carrinho || carrinhoData || [];
        
        if (!carrinho || carrinho.length === 0) {
            alert('Carrinho vazio! Adicione produtos primeiro.');
            return;
        }
        
        const response = await fetch('/api/pagamento/criar-preferencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itens: carrinho,
                usuario: { nome: 'Cliente', email: 'cliente@teste.com' },
                endereco_id: select.value,
                frete: valorFrete
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

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    // Obter subtotal da página
    const totalElement = document.querySelector('.total-pedido h3');
    if (totalElement) {
        const totalText = totalElement.textContent;
        const match = totalText.match(/R\$ ([\d,]+\.\d{2})/);
        if (match) {
            subtotal = parseFloat(match[1].replace(',', ''));
        }
    }
    
    carregarEnderecos();
});