// Função para contatar vendedor
function contatarVendedor(email, nome) {
    const assunto = `Contato via DOP - Interesse em produtos de ${nome}`;
    const corpo = `Olá ${nome},\n\nVi seu perfil na plataforma DOP e gostaria de saber mais sobre seus produtos orgânicos.\n\nAguardo seu contato!\n\nObrigado.`;
    
    // Criar link mailto
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    
    // Tentar abrir cliente de email
    window.location.href = mailtoLink;
    
    // Feedback visual
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Email Aberto!';
    button.style.backgroundColor = '#45a049';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

// Função para cadastrar como vendedor
async function cadastrarVendedor() {
    try {
        // Verificar se usuário está logado via API
        const response = await fetch('/api/test-session', {
            credentials: 'same-origin'
        });
        const sessionData = await response.json();
        
        if (sessionData.authenticated) {
            // Se logado, mostrar opção para virar vendedor
            if (confirm('Deseja converter sua conta para vendedor? Isso permitirá que você venda produtos na plataforma.')) {
                await converterParaVendedor();
            }
        } else {
            // Se não logado, redirecionar para cadastro
            alert('Para se tornar um vendedor, você precisa primeiro criar uma conta.');
            window.location.href = '/cadastro';
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        alert('Para se tornar um vendedor, você precisa primeiro criar uma conta.');
        window.location.href = '/cadastro';
    }
}

// Função para converter usuário em vendedor
async function converterParaVendedor() {
    try {
        const response = await fetch('/api/converter-vendedor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Conta convertida para vendedor com sucesso! Agora você pode gerenciar produtos.');
            window.location.href = '/painel-vendedor';
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao converter para vendedor:', error);
        alert('Erro ao converter conta para vendedor.');
    }
}

// Animações ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Animar cards dos vendedores
    const cards = document.querySelectorAll('.vendedor-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animar seção hero
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.opacity = '0';
        heroSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroSection.style.opacity = '1';
            heroSection.style.transform = 'translateY(0)';
        }, 200);
    }
});

// Função para formatar telefone para exibição
function formatarTelefone(telefone) {
    const tel = telefone.replace(/\D/g, '');
    if (tel.length === 11) {
        return `(${tel.substring(0, 2)}) ${tel.substring(2, 7)}-${tel.substring(7)}`;
    }
    return telefone;
}

// Função para formatar CPF/CNPJ para exibição
function formatarDocumento(documento, tipo) {
    const doc = documento.replace(/\D/g, '');
    if (tipo === 'PF' && doc.length === 11) {
        return `${doc.substring(0, 3)}.${doc.substring(3, 6)}.${doc.substring(6, 9)}-${doc.substring(9)}`;
    } else if (tipo === 'PJ' && doc.length === 14) {
        return `${doc.substring(0, 2)}.${doc.substring(2, 5)}.${doc.substring(5, 8)}/${doc.substring(8, 12)}-${doc.substring(12)}`;
    }
    return documento;
}