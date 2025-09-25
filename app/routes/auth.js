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

// Callback do Google - versão simplificada
router.get('/google/callback', (req, res, next) => {
    console.log('Callback Google recebido...');
    
    passport.authenticate('google', (err, user, info) => {
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
                tipo: user.TIPO_USUARIO || 'cliente'
            };
            
            console.log('Login Google bem-sucedido:', user.EMAIL_USUARIO);
            res.redirect('/');
        });
    })(req, res, next);
});

module.exports = router;