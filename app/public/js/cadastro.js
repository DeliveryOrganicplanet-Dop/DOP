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
        // Armazenando os dados no localStorage
        const userData = {
            username: usernameValue,
            email: emailValue,
            password: passwordValue,  // A senha também pode ser armazenada aqui, mas tenha em mente a segurança
        };

        // Salvando os dados no localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        // Redirecionando para o próximo formulário
        window.location.href = '/cadastro2'; // Substitua pelo URL da próxima página
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
        errorValidation(input, '');
        return false;
    } else if (value.length < 8) {
        errorValidation(input, '');
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

// Funções para mostrar e esconder a caixa de requisitos
function mostrarRequisitos() {
    document.getElementById('password-requirements').style.display = 'block';
}

function esconderRequisitos() {
    document.getElementById('password-requirements').style.display = 'none';
}

// Função para validar a senha e atualizar os requisitos
function validarSenha() {
    const password = document.getElementById('password').value;
    const lengthRequirement = document.getElementById('length');
    const uppercaseRequirement = document.getElementById('uppercase');
    const specialRequirement = document.getElementById('special');

    // Verifica se a senha tem pelo menos 8 caracteres
    if (password.length >= 8) {
        lengthRequirement.classList.add('valid');
    } else {
        lengthRequirement.classList.remove('valid');
    }

    // Verifica se a senha tem pelo menos uma letra maiúscula
    if (/[A-Z]/.test(password)) {
        uppercaseRequirement.classList.add('valid');
    } else {
        uppercaseRequirement.classList.remove('valid');
    }

    // Verifica se a senha tem pelo menos um caractere especial
    if (/[\W_]/.test(password)) {
        specialRequirement.classList.add('valid');
    } else {
        specialRequirement.classList.remove('valid');
    }
}
