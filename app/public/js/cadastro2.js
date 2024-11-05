const form = document.getElementById('form');
const cepInput = document.getElementById('cep');
const enderecoInput = document.getElementById('endereco');
const numeroInput = document.getElementById('numero');
const cidadeInput = document.getElementById('cidade');
const bairroInput = document.getElementById('bairro');
const complementoInput = document.getElementById('complemento');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveAddress();
});

cepInput.addEventListener('focusout', async () => {
    try {
        const cepValue = cepInput.value.trim().replace("-", "");
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);

        if (!response.ok) {
            throw new Error('CEP não encontrado');
        }

        const data = await response.json();
        enderecoInput.value = data.logradouro;
        cidadeInput.value = data.localidade;
        bairroInput.value = data.bairro;
    } catch (error) {
        console.log(error);
        alert('Erro ao buscar o CEP');
    }
});

function saveAddress() {
    const endereco = enderecoInput.value.trim();
    const numero = numeroInput.value.trim();
    const cidade = cidadeInput.value.trim();
    const bairro = bairroInput.value.trim();
    const complemento = complementoInput.value.trim();

    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
        const updatedData = {
            ...userData,
            endereco,
            numero,
            cidade,
            bairro,
            complemento,
        };

        localStorage.setItem('userData', JSON.stringify(updatedData));
        window.location.href = '/conta'; // Redireciona para a página de conta
    }
}