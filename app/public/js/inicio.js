window.onload = function() {
    // Verifica se o usuário está logado
    const userData = JSON.parse(localStorage.getItem('userData')); // Pode usar 'authToken' se for o caso

    const btnConta = document.getElementById('btn-conta');
    
    // Se o usuário estiver logado, redireciona diretamente para a página da conta
    if (userData) {
        btnConta.addEventListener('click', function() {
            window.location.href = '/conta'; // Redireciona para a página da conta
        });
    } else {
        // Se o usuário não estiver logado, redireciona para a página de login/cadastro
        btnConta.addEventListener('click', function() {
            window.location.href = '/cadlog'; // Redireciona para a página de login ou cadastro
        });
    }
};
