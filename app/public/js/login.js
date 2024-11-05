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
        login(emailValue, passwordValue);
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

function login(email, password) {
    const storedUser = JSON.parse(localStorage.getItem('userData'));

    if (storedUser) {
        if (storedUser.email === email && storedUser.password === password) {
            // Login bem-sucedido
            window.location.href = '/conta'; // Redireciona para a página de conta
        } else {
            // Erro: credenciais inválidas
            showError('Email ou senha inválidos');
        }
    } else {
        showError('Nenhuma conta encontrada');
    }
}

function showError(message) {
    const formControl = document.querySelector('.form-control.error');
    const small = formControl.querySelector('small');
    small.innerText = message;
    formControl.className = 'form-control error';
}
