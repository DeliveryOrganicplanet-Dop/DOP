const form = document.getElementById('form');
const cepInput = document.getElementById('cep');
const enderecoInput = document.getElementById('endereco');
const numeroInput = document.getElementById('numero');
const cidadeInput = document.getElementById('cidade');
const bairroInput = document.getElementById('bairro');
const complementoInput = document.getElementById('complemento');

cepInput.addEventListener('focusout', async () => {
    try {
        const cepValue = cepInput.value.trim().replace("-", "");
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        if (!response.ok) throw new Error('CEP não encontrado');

        const data = await response.json();
        enderecoInput.value = data.logradouro || '';
        cidadeInput.value = data.localidade || '';
        bairroInput.value = data.bairro || '';
    } catch (error) {
        console.log(error);
        alert('Erro ao buscar o CEP');
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ufInput = document.getElementById('uf');
    const enderecoData = {
        uf_usuario: ufInput.value.trim(),
        cep_usuario: cepInput.value.trim(),
        logradouro_usuario: enderecoInput.value.trim(),
        numero_usuario: numeroInput.value.trim(),
        cidade_usuario: cidadeInput.value.trim(),
        bairro_usuario: bairroInput.value.trim(),
        complemento_usuario: complementoInput.value.trim()
    };

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const dadosCompletos = {
        nome_usuario: userData.username,
        email_usuario: userData.email,
        celular_usuario: userData.telefone,
        cpf_usuario: userData.cpf,
        senha_usuario: userData.password, // 🔥 este campo é o mais importante!
        ...enderecoData,
        tipo_usuario: 'C'
    };
    
    try {
        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCompletos)
        });

        if (response.ok) {
            alert("Cadastro realizado com sucesso!");
            localStorage.removeItem('userData');
            window.location.href = '/';
        } else {
            const erro = await response.text();
            alert("Erro ao cadastrar: " + erro);
        }
    } catch (err) {
        console.error(err);
        alert("Erro interno ao cadastrar.");
    }
});
