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
        window.location.href = '/cadastro'; // Se não houver dados, redireciona de volta para o cadastro
    }
}

function logout() {
    localStorage.removeItem('userData');
    window.location.href = '/cadastro'; // Redireciona para a página de login ou cadastro
}
