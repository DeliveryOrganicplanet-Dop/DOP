const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkInputs();
});

function checkInputs() {
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    let isValid = true;

    // Verifica se o email e a senha foram preenchidos
    isValid &= validateField(emailInput, emailValue, 'Preencha esse campo');
    isValid &= validateField(passwordInput, passwordValue, 'Preencha esse campo');

    if (isValid) {
        // login(emailValue, passwordValue);
        form.submit();
    }
}

function validateField(input, value, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    if (value === '') {
        small.innerText = message;
        formControl.className = 'form-control error';
        return false;
    } else {
        formControl.className = 'form-control success';
        return true;
    }
}

async function login(email, password) {
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome_usu: email, // nome do campo usado no controller
                senha_usu: password
            })
        });

        // if (response.ok) {
        //     window.location.href = '/conta'; // Redireciona em caso de sucesso
        // } else {
        //     const result = await response.text();
        //     showError(result || 'Email ou senha inválidos');
        // }
    } catch (error) {
        showError('Erro ao tentar fazer login');
        console.error(error);
    }
}


function showError(message) {
    const errorMessage = document.querySelector('.error-message');
    
    // Se ainda não houver uma mensagem de erro, cria uma nova
    if (!errorMessage) {
        const small = document.createElement('small');
        small.classList.add('error-message');
        small.innerText = message;
        form.appendChild(small);
    } else {
        // Se já houver uma mensagem de erro, atualiza o texto
        errorMessage.innerText = message;
    }
}
