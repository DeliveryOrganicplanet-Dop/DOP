# Configurar Callback URL no Google

## Erro 404 - Solução:

### 1. Google Cloud Console:
1. Acesse: https://console.cloud.google.com/
2. Vá para: APIs e Serviços → Credenciais
3. Clique no seu OAuth Client ID
4. Em "URIs de redirecionamento autorizados", adicione:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Salve

### 2. Verificar se está correto:
- URL deve ser EXATAMENTE: `http://localhost:3000/auth/google/callback`
- Sem barra no final
- Protocolo http (não https) para localhost

### 3. Testar:
1. Reinicie o servidor: `node app.js`
2. Acesse: http://localhost:3000/login
3. Clique em "Entrar com Google"

**O erro 404 acontece quando a URL de callback não está registrada no Google.**