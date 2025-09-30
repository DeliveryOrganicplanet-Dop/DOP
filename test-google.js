// Teste simples para verificar se as credenciais estão funcionando
const express = require('express');
const app = express();

app.get('/test-google', (req, res) => {
    const googleAuthURL = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID || '417479200607-c9ir8kanlmbg7gdrm1cm0t8n4aaftoig.apps.googleusercontent.com'}&` +
        `redirect_uri=http://localhost:3001/callback&` +
        `scope=profile email&` +
        `response_type=code&` +
        `access_type=offline`;
    
    res.send(`
        <h1>Teste Google OAuth</h1>
        <p>Credenciais configuradas:</p>
        <p>CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID || '417479200607-c9ir8kanlmbg7gdrm1cm0t8n4aaftoig.apps.googleusercontent.com'}</p>
        <a href="${googleAuthURL}">Testar Login Google (porta 3001)</a>
    `);
});

app.get('/callback', (req, res) => {
    res.send(`
        <h1>Callback funcionou!</h1>
        <p>Código recebido: ${req.query.code}</p>
        <p>Se você vê isso, o OAuth está funcionando!</p>
    `);
});

app.listen(3001, () => {
    console.log('Teste rodando em http://localhost:3001/test-google');
});