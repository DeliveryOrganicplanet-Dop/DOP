const formEndereco = document.getElementById('form-endereco');
const cepInput = document.getElementById('cep');
const enderecoInput = document.getElementById('endereco');
const numeroInput = document.getElementById('numero');
const cidadeInput = document.getElementById('cidade');
const bairroInput = document.getElementById('bairro');
const complementoInput = document.getElementById('complemento');

// Quando o formulário de endereço for enviado
formEndereco.addEventListener('submit', function (e) {
    e.preventDefault();
    salvarEndereco();  // Salva os dados no localStorage
});

function salvarEndereco() {
    const userEndereco = {
        cep: cepInput.value.trim(),
        endereco: enderecoInput.value.trim(),
        numero: numeroInput.value.trim(),
        cidade: cidadeInput.value.trim(),
        bairro: bairroInput.value.trim(),
        complemento: complementoInput.value.trim() || 'Não informado'
    };

    // Recuperando os dados pessoais do localStorage
    const userPersonalData = JSON.parse(localStorage.getItem('userPersonalData'));

    // Combinando os dados pessoais com os dados de endereço
    const userData = { ...userPersonalData, ...userEndereco };

    // Salvando todos os dados no localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    // Redireciona para a página de conta
    window.location.href = '/conta';
}
