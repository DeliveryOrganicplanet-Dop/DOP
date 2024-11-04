const form = document.getElementById('form');
const cepInput = document.getElementById('cep');
const enderecoInput = document.getElementById('endereco');
const numeroInput = document.getElementById('numero');
const cidadeInput = document.getElementById('cidade');
const bairroInput = document.getElementById('bairro');

// Inicializa as mensagens de erro como vazias
const smalls = document.querySelectorAll('small');
smalls.forEach(small => small.innerText = '');

// Adiciona um evento de escuta para o envio do formulário
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio padrão do formulário
    checkInputs();
});

// Verifica os campos de entrada
function checkInputs() {
    const cepValue = cepInput.value.trim();
    const enderecoValue = enderecoInput.value.trim();
    const numeroValue = numeroInput.value.trim();
    const cidadeValue = cidadeInput.value.trim();
    const bairroValue = bairroInput.value.trim();

    let isValid = true;

    // Validação do CEP
    isValid &= validateCEP(cepInput, cepValue);

    // Validação dos outros campos
    isValid &= validateField(enderecoInput, enderecoValue, 'Preencha esse campo');
    isValid &= validateField(numeroInput, numeroValue, 'Preencha esse campo');
    isValid &= validateField(cidadeInput, cidadeValue, 'Preencha esse campo');
    isValid &= validateField(bairroInput, bairroValue, 'Preencha esse campo');

    // Se todos os campos forem válidos, você pode proceder
    if (isValid) {
        // Ação após o envio bem-sucedido do formulário
        console.log('Formulário enviado com sucesso!');
        // Aqui você pode redirecionar ou enviar os dados para o servidor
    }
}

// Valida o campo de CEP
function validateCEP(input, value) {
    const cepPattern = /^\d{5}-\d{3}$/; // Formato: 00000-000
    if (value === '') {
        errorValidation(input, 'Preencha esse campo');
        return false;
    } else if (!cepPattern.test(value)) {
        errorValidation(input, 'CEP inválido');
        return false;
    } else {
        successValidation(input);
        fetchAddress(value); // Busca o endereço com base no CEP
        return true;
    }
}

// Valida os campos de texto
function validateField(input, value, message) {
    if (value === '') {
        errorValidation(input, message);
        return false;
    } else {
        successValidation(input);
        return true;
    }
}

// Função para buscar o endereço usando a API ViaCEP
function fetchAddress(cep) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                // Preenche os campos do endereço com os dados retornados
                enderecoInput.value = data.logradouro;
                bairroInput.value = data.bairro;
                cidadeInput.value = data.localidade;
            } else {
                errorValidation(cepInput, 'CEP não encontrado');
            }
        })
        .catch(error => console.error('Erro ao buscar o CEP:', error));
}

// Funções para validação de erro e sucesso
function errorValidation(input, message) {
    const small = input.nextElementSibling;
    small.innerText = message; // Exibe a mensagem de erro
    input.className = 'error'; // Adicione uma classe para estilizar o erro
}

function successValidation(input) {
    const small = input.nextElementSibling;
    small.innerText = ''; // Limpa a mensagem de erro
    input.className = ''; // Remove a classe de erro
}
