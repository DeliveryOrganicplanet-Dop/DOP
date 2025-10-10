// Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const btnGoogle = document.getElementById('btn-google');
    const errorMessages = document.getElementById('error-messages');

    // Google login via JavaScript
    btnGoogle.addEventListener('click', function() {
        const redirectUri = window.location.origin + '/login';
        const googleUrl = `https://accounts.google.com/oauth/authorize?client_id=417479200607-c9ir8kanlmbg7gdrm1cm0t8n4aaftoig.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(redirectUri)}&scope=profile email&response_type=code`;
        window.location.href = googleUrl;
    });

    // Form submission - usar submit padrão do formulário
    // O controller já trata o redirecionamento

    function showErrors(errors) {
        errorMessages.innerHTML = '';
        errors.forEach(error => {
            const p = document.createElement('p');
            p.className = 'error-message';
            p.textContent = error.msg || error.message || error;
            errorMessages.appendChild(p);
        });
        errorMessages.style.display = 'block';
    }

    // Verificar erros na URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
        showErrors([decodeURIComponent(error)]);
    }
});