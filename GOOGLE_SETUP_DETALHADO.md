# Configuração Google OAuth - Passo a Passo

## 1. Acesse o Google Cloud Console:
https://console.cloud.google.com/

## 2. Selecione ou crie um projeto:
- No topo da página, clique no nome do projeto
- Selecione um projeto existente ou crie um novo

## 3. Ative a API necessária:
- Menu lateral → "APIs e serviços" → "Biblioteca"
- Procure por "Google+ API" ou "Google Identity"
- Clique e depois em "ATIVAR"

## 4. Criar credenciais OAuth:
- Menu lateral → "APIs e serviços" → "Credenciais"
- Clique em "+ CRIAR CREDENCIAIS"
- Selecione "ID do cliente OAuth 2.0"

## 5. Configurar a tela de consentimento (se necessário):
- Se aparecer aviso, clique em "CONFIGURAR TELA DE CONSENTIMENTO"
- Escolha "Externo" → "CRIAR"
- Preencha apenas os campos obrigatórios:
  - Nome do app: "DOP"
  - Email de suporte: seu email
  - Email do desenvolvedor: seu email
- Clique "SALVAR E CONTINUAR" até o final

## 6. Criar ID do cliente OAuth:
- Volte para "Credenciais" → "+ CRIAR CREDENCIAIS" → "ID do cliente OAuth 2.0"
- Tipo de aplicativo: "Aplicativo da Web"
- Nome: "DOP Login"
- **URIs de redirecionamento autorizados:**
  - Clique em "+ ADICIONAR URI"
  - Digite: `http://localhost:3000/auth/google/callback`
- Clique "CRIAR"

## 7. Copiar credenciais:
- Aparecerá um popup com:
  - ID do cliente (começa com números)
  - Chave secreta do cliente (começa com GOCSPX-)
- Copie e cole no seu arquivo .env

**Se não encontrar "URIs de redirecionamento", procure por:**
- "Authorized redirect URIs"
- "Redirect URIs" 
- "Callback URLs"