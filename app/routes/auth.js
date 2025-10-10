const express = require('express');
const passport = require('../../config/passport');
const router = express.Router();

// Rota para iniciar autenticação Google
router.get('/google', (req, res, next) => {
    console.log('Iniciando autenticação Google...');
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
});

// Rota de teste para debug
router.get('/google/test', (req, res) => {
    console.log('=== TESTE CALLBACK ===');
    res.json({ message: 'Callback funcionando', query: req.query });
});

// Callback do Google - versão simplificada
router.get('/google/callback', (req, res, next) => {
    console.log('=== CALLBACK GOOGLE RECEBIDO ===');
    console.log('Query params:', req.query);
    
    passport.authenticate('google', (err, user, info) => {
        console.log('=== RESULTADO AUTHENTICATE ===');
        console.log('Erro:', err);
        console.log('User:', user);
        console.log('Info:', info);
        
        if (err) {
            console.error('Erro na autenticação:', err);
            return res.redirect('/login?error=auth_failed');
        }
        
        if (!user) {
            console.log('Usuário não encontrado');
            return res.redirect('/login?error=no_user');
        }
        
        // Login manual do usuário
        req.logIn(user, (err) => {
            if (err) {
                console.error('Erro no login:', err);
                return res.redirect('/login?error=login_failed');
            }
            
            // Salvar na sessão
            req.session.usuario = {
                id: user.ID_USUARIO,
                nome: user.NOME_USUARIO,
                email: user.EMAIL_USUARIO,
                tipo: user.TIPO_USUARIO || 'C'
            };
            
            console.log('=== LOGIN GOOGLE BEM-SUCEDIDO ===');
            console.log('Usuário logado:', user.EMAIL_USUARIO);
            console.log('Sessão criada:', req.session.usuario);
            res.redirect('/');
        });
    })(req, res, next);
});

module.exports = router;