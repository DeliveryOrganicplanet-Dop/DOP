window.onload = function() {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
        document.getElementById('nome').innerText = userData.username;
        document.getElementById('email').innerText = userData.email;
        document.getElementById('endereco').innerText = userData.endereco;
        document.getElementById('cidade').innerText = userData.cidade;
        document.getElementById('bairro').innerText = userData.bairro;
        document.getElementById('complemento').innerText = userData.complemento;
    }
};

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';  // Redirecionar para a página inicial ou login
}
