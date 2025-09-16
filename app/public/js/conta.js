// Página já carregada com dados da sessão do servidor
console.log('Página de conta carregada');

// Função para voltar à página inicial mantendo o login
function voltarPaginaInicial() {
    window.location.href = '/';
}

// Função para deslogar e redirecionar para a página de login
function deslogar() {
    window.location.href = '/logout'; // Redireciona para a rota de logout do servidor
}
