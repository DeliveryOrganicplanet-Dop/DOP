const form = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const redirectInput = document.getElementById('redirectTo');

// 🔹 Preenche o campo hidden com o redirectTo salvo ou referrer
(function () {
    const redirectValue = localStorage.getItem('redirectTo') || document.referrer || '/';
    if (redirectInput) {
        redirectInput.value = redirectValue;
    }
})();

// Validação e envio
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const redirectTo = redirectInput.value || '/';

    if (!emailValue || !passwordValue) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailValue,
                password: passwordValue,
                redirectTo
            })
        });

        const contentType = response.headers.get('content-type') || '';

        if (response.ok) {
            if (contentType.includes('application/json')) {
                const data = await response.json();
                const destino = data.redirectTo || redirectTo || '/';
                localStorage.removeItem('redirectTo');
                window.location.href = destino;
            } else {
                // Caso o servidor responda com HTML (formulário tradicional)
                window.location.href = redirectTo;
            }
        } else {
            const errMsg = contentType.includes('application/json')
                ? (await response.json()).message
                : await response.text();
            alert("Erro no login: " + errMsg);
        }
    } catch (err) {
        console.error(err);
        alert("Erro interno ao tentar fazer login.");
    }
});
