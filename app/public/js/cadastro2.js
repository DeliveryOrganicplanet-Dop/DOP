const form = document.getElementById('form');
const cepInput = document.getElementById('cep');
const enderecoInput = document.getElementById('endereco');
const numeroInput = document.getElementById('numero');
const cidadeInput = document.getElementById('cidade');
const bairroInput = document.getElementById('bairro');
const complementoInput = document.getElementById('complemento');

// Máscara para CEP
cepInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    
    if (value.length > 5) {
        value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    
    e.target.value = value;
});

cepInput.addEventListener('focusout', async () => {
    try {
        const cepValue = cepInput.value.trim().replace("-", "");
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        if (!response.ok) throw new Error('CEP não encontrado');

        const data = await response.json();
        enderecoInput.value = data.logradouro || '';
        cidadeInput.value = data.localidade || '';
        bairroInput.value = data.bairro || '';
        
        const ufSelect = document.getElementById('uf');
        if (ufSelect && data.uf) {
            ufSelect.value = data.uf;
        }
    } catch (error) {
        console.log(error);
        alert('Erro ao buscar o CEP');
    }
});

// Verificar dados ao carregar a página
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Página cadastro2 carregada');
    
    // Verificar se há dados temporários no servidor
    try {
        const response = await fetch('/api/verificar-dados-temp');
        if (!response.ok) {
            console.error('Nenhum dado encontrado no servidor!');
            alert('Erro: Dados do primeiro formulário não encontrados. Redirecionando...');
            window.location.href = '/cadastro';
        }
    } catch (e) {
        console.error('Erro ao verificar dados no servidor:', e);
        alert('Erro ao carregar dados. Redirecionando...');
        window.location.href = '/cadastro';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Formulário de endereço submetido');

    const ufSelect = document.getElementById('uf');
    const enderecoData = {
        uf_usuario: ufSelect.value.trim(),
        cep_usuario: cepInput.value.trim(),
        logradouro_usuario: enderecoInput.value.trim(),
        numero_usuario: numeroInput.value.trim(),
        cidade_usuario: cidadeInput.value.trim(),
        bairro_usuario: bairroInput.value.trim(),
        complemento_usuario: complementoInput.value.trim()
    };
    
    console.log('Dados de endereço:', enderecoData);

    // Buscar dados temporários do servidor
    let userData = {};
    try {
        const response = await fetch('/api/obter-dados-temp');
        if (response.ok) {
            userData = await response.json();
            console.log('Dados do servidor:', userData);
        } else {
            alert('Erro ao carregar dados do usuário.');
            return;
        }
    } catch (e) {
        console.error('Erro ao buscar dados do servidor:', e);
        alert('Erro ao carregar dados do usuário.');
        return;
    }
    
    const dadosCompletos = {
        nome_usuario: userData.username,
        email_usuario: userData.email,
        celular_usuario: userData.telefone,
        cpf_usuario: userData.cpf,
        senha_usuario: userData.password, // 🔥 este campo é o mais importante!
        ...enderecoData,
        tipo_usuario: 'C'
    };
    
    console.log('Dados completos para envio:', dadosCompletos);
    
    try {
        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCompletos),
            credentials: 'same-origin'
        });

        console.log('Status da resposta:', response.status);
        
        if (response.ok) {
            const resultado = await response.json();
            console.log('Resultado do cadastro:', resultado);
            alert("Cadastro realizado com sucesso!");
            // Limpar dados temporários do servidor
            try {
                await fetch('/api/limpar-dados-temp', { method: 'DELETE' });
            } catch (e) {
                console.warn('Erro ao limpar dados temporários:', e);
            }
            window.location.href = resultado.redirectTo || '/';
        } else {
            const erro = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
            console.log('Erro no cadastro:', erro);
            alert("Erro ao cadastrar: " + (erro.message || erro.errors?.[0]?.msg || 'Erro desconhecido'));
        }
    } catch (err) {
        console.error(err);
        alert("Erro interno ao cadastrar.");
    }
});
