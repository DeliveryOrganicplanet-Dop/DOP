window.onload = function() {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
        document.getElementById('username').textContent = userData.username;
        document.getElementById('email').textContent = userData.email;
        document.getElementById('endereco').textContent = userData.endereco || 'Não informado';
        document.getElementById('numero').textContent = userData.numero || 'Não informado';
        document.getElementById('cidade').textContent = userData.cidade || 'Não informado';
        document.getElementById('bairro').textContent = userData.bairro || 'Não informado';
        document.getElementById('complemento').textContent = userData.complemento || 'Não informado';
    } else {
        // Se o usuário não estiver logado, redireciona para a página de cadastro/login
        window.location.href = '/cadastro'; // Ou outra página de login/cadastro
    }

    // Função para voltar à página inicial
    document.getElementById('backButton').addEventListener('click', function() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            // Se estiver logado, mantém os dados no localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
        }
        window.location.href = '/'; // Volta para a página inicial
    });
}
