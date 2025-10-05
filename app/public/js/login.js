// Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const btnGoogle = document.getElementById('btn-google');
    const errorMessages = document.getElementById('error-messages');

    // Google login
    btnGoogle.addEventListener('click', function() {
        window.location.href = '/auth/google';
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

    // Check for URL parameters (errors from server redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        showErrors([decodeURIComponent(error)]);
    }
});