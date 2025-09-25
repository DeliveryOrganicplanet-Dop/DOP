// Teste simples para verificar se o servidor está funcionando
const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        env: {
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Configurado' : 'Não configurado',
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Configurado' : 'Não configurado'
        }
    });
});

app.listen(3001, () => {
    console.log('Teste rodando na porta 3001');
    console.log('Acesse: http://localhost:3001/test');
});