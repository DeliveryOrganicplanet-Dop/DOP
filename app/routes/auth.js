const express = require('express');
const passport = require('../../config/passport');
const router = express.Router();

// Rota para iniciar autenticação Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Callback do Google
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Salvar usuário na sessão
        req.session.usuario = {
            id: req.user.ID_USUARIO,
            nome: req.user.NOME_USUARIO,
            email: req.user.EMAIL_USUARIO,
            tipo: req.user.TIPO_USUARIO || 'cliente'
        };
        
        res.redirect('/');
    }
);

module.exports = router;