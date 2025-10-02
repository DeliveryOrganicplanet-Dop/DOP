const express = require('express');
const router = express.Router();

// Rota simples para Google OAuth
router.get('/google', (req, res) => {
    const googleAuthURL = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent('http://localhost:3002/auth/google/callback')}&` +
        `scope=profile email&` +
        `response_type=code&` +
        `access_type=offline`;
    
    res.redirect(googleAuthURL);
});

// Callback simples
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect('/login?error=no_code');
        }

        // Trocar código por token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost:3002/auth/google/callback'
            })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            return res.redirect('/login?error=no_token');
        }

        // Buscar dados do usuário
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const userData = await userResponse.json();
        
        // Salvar na sessão (versão simplificada)
        req.session.usuario = {
            id: userData.id,
            nome: userData.name,
            email: userData.email,
            tipo: 'cliente'
        };

        console.log('Login Google OK:', userData.email);
        res.redirect('/');

    } catch (error) {
        console.error('Erro callback:', error);
        res.redirect('/login?error=callback_failed');
    }
});

module.exports = router;