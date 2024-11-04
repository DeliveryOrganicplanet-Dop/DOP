const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const passwordtwo = document.getElementById('passwordtwo');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkInputs();
});

function checkInputs() {
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const passwordtwoValue = passwordtwo.value.trim();

    let isValid = true;

    // Username validation
    isValid &= validateField(username, usernameValue, 'Preencha esse campo');

    // Email validation
    isValid &= validateEmail(email, emailValue);

    // Password validation
    isValid &= validatePassword(password, passwordValue);

    // Confirm password validation
    isValid &= validateConfirmPassword(passwordtwo, passwordtwoValue, passwordValue);

    if (isValid) {
        // Redirecionar para outra página
        window.location.href = '/cadastro2'; // Substitua pelo URL desejado
    }
}

function validateField(input, value, message) {
    if (value === '') {
        errorValidation(input, message);
        return false;
    } else {
        successValidation(input);
        return true;
    }
}

function validateEmail(input, value) {
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (value === '') {
        errorValidation(input, 'Preencha esse campo');
        return false;
    } else if (!emailPattern.test(value)) {
        errorValidation(input, 'Email inválido');
        return false;
    } else {
        successValidation(input);
        return true;
    }
}

function validatePassword(input, value) {
    if (value === '') {
        errorValidation(input, 'Preencha esse campo');
        return false;
    } else if (value.length < 8) {
        errorValidation(input, 'A senha deve ter mais de 8 caracteres');
        return false;
    } else {
        successValidation(input);
        return true;
    }
}

function validateConfirmPassword(input, value, passwordValue) {
    if (value === '') {
        errorValidation(input, 'Preencha esse campo');
        return false;
    } else if (value !== passwordValue) {
        errorValidation(input, 'Senha não confere');
        return false;
    } else {
        successValidation(input);
        return true;
    }
}

function errorValidation(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    small.innerText = message;
    formControl.className = 'form-control error';
}

function successValidation(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
}
