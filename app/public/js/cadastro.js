// Google OAuth signup
document.addEventListener('DOMContentLoaded', () => {
    const btnGoogleSignup = document.getElementById('btn-google-signup');
    if (btnGoogleSignup) {
        btnGoogleSignup.addEventListener('click', () => {
            const redirectUri = window.location.origin + '/cadastro';
            const googleUrl = `https://accounts.google.com/oauth/authorize?client_id=417479200607-c9ir8kanlmbg7gdrm1cm0t8n4aaftoig.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(redirectUri)}&scope=profile email&response_type=code`;
            window.location.href = googleUrl;
        });
    }
});

// RedirectTo será gerenciado pelo servidor

const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const cpf = document.getElementById('cpf');
const password = document.getElementById('password');
const passwordtwo = document.getElementById('passwordtwo');
const telefone = document.getElementById('telefone');

// Inicializar placeholders estruturados
document.addEventListener('DOMContentLoaded', () => {
    cpf.placeholder = '___.___.___-__';
    telefone.placeholder = '(__) _____-____';
});


form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkInputs();
});

cpf.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    let formatted = '';
    if (value.length > 0) {
        formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        if (value.length <= 9) {
            formatted = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        }
        if (value.length <= 6) {
            formatted = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        }
        if (value.length <= 3) {
            formatted = value;
        }
    }
    
    e.target.value = formatted;
});

cpf.addEventListener('blur', async (e) => {
    const cpfValue = e.target.value.replace(/\D/g, '');
    if (cpfValue.length === 11 && isValidCPF(e.target.value)) {
        try {
            const response = await fetch('/api/verificar-cpf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: cpfValue })
            });
            const result = await response.json();
            
            if (result.exists) {
                errorValidation(cpf, 'Este CPF já está cadastrado');
            } else {
                successValidation(cpf);
            }
        } catch (error) {
            console.error('Erro ao verificar CPF:', error);
        }
    }
});

telefone.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    let formatted = '';
    if (value.length > 0) {
        if (value.length <= 2) {
            formatted = `(${value}`;
        } else if (value.length <= 7) {
            formatted = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        } else {
            formatted = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        }
    }
    
    e.target.value = formatted;
});


async function checkInputs() {
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const cpfValue = cpf.value.trim();
    const passwordValue = password.value.trim();
    const passwordtwoValue = passwordtwo.value.trim();
    const telefoneValue = telefone.value.trim();


    let isValid = true;

    // Username validation
    isValid &= validateField(username, usernameValue, 'Preencha esse campo');

    // Email validation
    isValid &= validateEmail(email, emailValue);

    isValid &= await validateCPF(cpf, cpfValue);

    // Password validation
    isValid &= validatePassword(password, passwordValue);

    // Confirm password validation
    isValid &= validateConfirmPassword(passwordtwo, passwordtwoValue, passwordValue);

    isValid &= validateTelefone(telefone, telefoneValue);


    if (isValid) {
        console.log('Formulário válido, salvando dados...');
        
        // Enviando dados diretamente para o servidor
        const userData = {
            username: usernameValue,
            email: emailValue,
            cpf: cpfValue,
            password: passwordValue,
            telefone: telefoneValue,
        };

        console.log('Enviando dados para o servidor:', userData);
        
        // Salvando dados temporários na sessão do servidor
        try {
            const response = await fetch('/api/cadastro-temp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (response.ok) {
                console.log('Dados salvos no servidor, redirecionando para /cadastro2');
                window.location.href = '/cadastro2';
            } else {
                alert('Erro ao salvar dados. Tente novamente.');
            }
        } catch (e) {
            console.error('Erro ao enviar dados:', e);
            alert('Erro ao salvar dados. Tente novamente.');
            return;
        }
    } else {
        console.log('Formulário inválido');
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

async function validateCPF(input, value) {
    if (value === '') {
        errorValidation(input, 'Preencha esse campo');
        return false;
    } else if (!isValidCPF(value)) {
        errorValidation(input, 'CPF inválido');
        return false;
    } else {
        // Verificar se CPF já existe
        try {
            const cpfNumeros = value.replace(/\D/g, '');
            const response = await fetch('/api/verificar-cpf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: cpfNumeros })
            });
            const result = await response.json();
            
            if (result.exists) {
                errorValidation(input, 'Este CPF já está cadastrado');
                return false;
            } else {
                successValidation(input);
                return true;
            }
        } catch (error) {
            console.error('Erro ao verificar CPF:', error);
            successValidation(input);
            return true;
        }
    }
}

// Função para validar CPF
function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11 || 
        /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++)
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++)
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

function validateTelefone(input, value) {
    const telefoneValue = value.replace(/\D/g, '');
    if (telefoneValue === '') {
        errorValidation(input, 'Preencha esse campo');
        return false;
    } else if (telefoneValue.length !== 11) {
        errorValidation(input, 'Telefone inválido');
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
    const formGroup = input.parentElement;
    const small = formGroup.querySelector('.error-message');
    if (small) small.innerText = message;
    input.classList.remove('success');
    input.classList.add('error');
    formGroup.classList.remove('form-control', 'success');
    formGroup.classList.add('form-control', 'error');
}

function successValidation(input) {
    const formGroup = input.parentElement;
    const small = formGroup.querySelector('.error-message');
    if (small) small.innerText = '';
    input.classList.remove('error');
    input.classList.add('success');
    formGroup.classList.remove('form-control', 'error');
    formGroup.classList.add('form-control', 'success');
}

// Funções para mostrar e esconder a caixa de requisitos
function mostrarRequisitos() {
    const requirements = document.getElementById('password-requirements');
    requirements.classList.add('show');
}

function esconderRequisitos() {
    const requirements = document.getElementById('password-requirements');
    setTimeout(() => {
        requirements.classList.remove('show');
    }, 200);
}

// Toggle para mostrar/ocultar senha
document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
});

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

