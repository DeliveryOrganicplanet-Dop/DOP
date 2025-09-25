# Configuração Google OAuth

## Passos para configurar Google OAuth:

### 1. Criar projeto no Google Cloud Console
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API" ou "Google Identity"

### 2. Configurar OAuth 2.0
1. Vá para "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0"
2. Tipo de aplicativo: "Aplicativo da Web"
3. Nome: "DOP - Delivery Organic Plant"
4. URIs de redirecionamento autorizados:
   - http://localhost:3000/auth/google/callback
   - https://seudominio.com/auth/google/callback (produção)

### 3. Configurar variáveis de ambiente
Substitua no arquivo `.env`:
```
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
SESSION_SECRET=uma_chave_secreta_aleatoria
```

### 4. Executar script SQL
Execute o script SQL atualizado para adicionar a coluna GOOGLE_ID:
```sql
ALTER TABLE USUARIOS ADD GOOGLE_ID VARCHAR(255) NULL;
ALTER TABLE USUARIOS MODIFY SENHA_USUARIO VARCHAR(255) NULL;
ALTER TABLE USUARIOS MODIFY CELULAR_USUARIO VARCHAR(100) NULL;
ALTER TABLE USUARIOS MODIFY CPF_USUARIO VARCHAR(15) NULL;
-- ... outros campos opcionais
```

### 5. Testar
1. Inicie o servidor: `node app.js`
2. Acesse: http://localhost:3000/login
3. Clique em "Entrar com Google"

## Funcionalidades implementadas:
- ✅ Login com Google
- ✅ Cadastro automático de novos usuários
- ✅ Integração com sistema de sessões existente
- ✅ Redirecionamento após login
- ✅ Suporte a usuários sem senha (OAuth only)