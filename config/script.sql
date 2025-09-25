CREATE TABLE USUARIOS (

    ID_USUARIO INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    NOME_USUARIO VARCHAR(70) NOT NULL,

    EMAIL_USUARIO VARCHAR(35) UNIQUE NOT NULL,

    CELULAR_USUARIO CHAR(11) UNIQUE NOT NULL,

    CPF_USUARIO CHAR(11) UNIQUE NOT NULL,

    LOGRADOURO_USUARIO VARCHAR(100) NOT NULL,

    BAIRRO_USUARIO VARCHAR(30) NOT NULL,

    CIDADE_USUARIO VARCHAR(30) NOT NULL,

    UF_USUARIO CHAR(2) NOT NULL,

    CEP_USUARIO CHAR(8) NOT NULL,

    SENHA_USUARIO CHAR(6) NOT NULL,

    TIPO_USUARIO CHAR(1) NOT NULL

);

   SHOW TABLES;

CREATE TABLE CLIENTES (

    id_cliente INT AUTO_INCREMENT PRIMARY KEY,

    cpf_cliente VARCHAR(14) UNIQUE NOT NULL,

    id_usuario INT UNSIGNED NOT NULL,

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS (ID_USUARIO)

);

CREATE TABLE VENDEDORES (

    id_vendedores INT AUTO_INCREMENT PRIMARY KEY,

    tipo_pessoa CHAR (2) NOT NULL,

    digito_pessoa VARCHAR(14) UNIQUE NOT NULL,

    id_usuario INT UNSIGNED NOT NULL,

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS (ID_USUARIO)

);

CREATE TABLE CATEGORIAS (

    id_categoria INT AUTO_INCREMENT PRIMARY KEY,

    nome_categoria VARCHAR(255) NOT NULL

);
 
CREATE TABLE IMAGENS (

   id_imagem INT AUTO_INCREMENT PRIMARY KEY,

nome_imagem VARCHAR(255) NOT NULL, 

  imagem_blob BLOB

  );


CREATE TABLE PRODUTOS (

    id_prod INT AUTO_INCREMENT PRIMARY KEY,

    nome_prod VARCHAR(255) NOT NULL,

    valor_unitario DECIMAL(10,2) NOT NULL,

    qtde_estoque INT NOT NULL,

    prazo_validade DATE,

   -- img_prod VARCHAR(255),

    id_categoria INT NOT NULL,

    id_imagem INT NOT NULL,

    FOREIGN KEY (id_categoria) REFERENCES CATEGORIAS (id_categoria),

    FOREIGN KEY (id_imagem) REFERENCES IMAGENS (id_imagem)

);

CREATE TABLE PEDIDOS (

    id_pedido INT AUTO_INCREMENT PRIMARY KEY,

    id_cliente INT NOT NULL,

    dt_pedido DATE NOT NULL,

    FOREIGN KEY (ID_CLIENTE) REFERENCES CLIENTES (ID_CLIENTE)

);

-- LINHA DE COMANDO PARA EXCLUIR UMA TABELA

-- DROP TABLE NOME_TABELA;

CREATE TABLE PEDIDOS_PRODUTOS (

    ID_PEDIDO INT NOT NULL,

    ID_PROD INT NOT NULL,

    FOREIGN KEY (ID_PEDIDO) REFERENCES PEDIDOS (ID_PEDIDO),

    FOREIGN KEY (ID_PROD) REFERENCES PRODUTOS (ID_PROD)

);

ALTER TABLE USUARIOS

MODIFY SENHA_USUARIO VARCHAR(255) NOT NULL,

ADD AUTH_TOKEN VARCHAR(255) NULL;
 
ALTER TABLE USUARIOS 

ADD COLUMN FOTO_USUARIO VARCHAR(255) NULL AFTER TIPO_USUARIO,

ADD COLUMN DATA_CRIACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER FOTO_USUARIO,

ADD COLUMN ULTIMO_LOGIN TIMESTAMP NULL AFTER DATA_CRIACAO,

ADD COLUMN RESET_TOKEN VARCHAR(255) NULL AFTER ULTIMO_LOGIN,

ADD COLUMN RESET_TOKEN_EXPIRES TIMESTAMP NULL AFTER RESET_TOKEN;

-- Adicionando índices para melhor performance

CREATE INDEX idx_usuarios_email ON USUARIOS(EMAIL_USUARIO);

CREATE INDEX idx_usuarios_cpf ON USUARIOS(CPF_USUARIO);

CREATE INDEX idx_usuarios_tipo ON USUARIOS(TIPO_USUARIO);

CREATE INDEX idx_usuarios_reset_token ON USUARIOS(RESET_TOKEN);

-- Criando tabela para log de atividades do usuário

CREATE TABLE LOG_ATIVIDADES (

    id_log INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT UNSIGNED NOT NULL,

    acao VARCHAR(100) NOT NULL,

    descricao TEXT,

    ip_address VARCHAR(45),

    user_agent TEXT,

    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(ID_USUARIO) ON DELETE CASCADE,

    INDEX idx_log_usuario (id_usuario),

    INDEX idx_log_data (data_acao)

);

-- Criando tabela para favoritos de produtos

CREATE TABLE PRODUTOS_FAVORITOS (

    id_usuario INT UNSIGNED NOT NULL,

    id_produto INT NOT NULL,

    data_favoritado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_usuario, id_produto),

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(ID_USUARIO) ON DELETE CASCADE,

    FOREIGN KEY (id_produto) REFERENCES PRODUTOS(id_prod) ON DELETE CASCADE

);

-- Criando tabela para avaliações de produtos

CREATE TABLE AVALIACOES_PRODUTOS (

    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT UNSIGNED NOT NULL,

    id_produto INT NOT NULL,

    nota TINYINT NOT NULL CHECK (nota >= 1 AND nota <= 5),

    comentario TEXT,

    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(ID_USUARIO) ON DELETE CASCADE,

    FOREIGN KEY (id_produto) REFERENCES PRODUTOS(id_prod) ON DELETE CASCADE,

    UNIQUE KEY unique_user_product (id_usuario, id_produto),

    INDEX idx_avaliacao_produto (id_produto),

    INDEX idx_avaliacao_nota (nota)

);

-- Criando tabela para endereços múltiplos do usuário

CREATE TABLE ENDERECOS_USUARIO (

    id_endereco INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT UNSIGNED NOT NULL,

    nome_endereco VARCHAR(50) NOT NULL DEFAULT 'Principal',

    logradouro VARCHAR(100) NOT NULL,

    numero VARCHAR(10),

    complemento VARCHAR(50),

    bairro VARCHAR(30) NOT NULL,

    cidade VARCHAR(30) NOT NULL,

    uf CHAR(2) NOT NULL,

    cep VARCHAR(15) NOT NULL,

    is_principal BOOLEAN DEFAULT FALSE,

    ativo BOOLEAN DEFAULT TRUE,

    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(ID_USUARIO) ON DELETE CASCADE,

    INDEX idx_endereco_usuario (id_usuario),

    INDEX idx_endereco_principal (id_usuario, is_principal)

);

-- Melhorando tabela de produtos com mais informações

ALTER TABLE PRODUTOS 

ADD COLUMN descricao_prod TEXT AFTER nome_prod,

ADD COLUMN peso DECIMAL(8,3) DEFAULT NULL AFTER qtde_estoque,

ADD COLUMN unidade_medida VARCHAR(10) DEFAULT 'UN' AFTER peso,

ADD COLUMN ativo BOOLEAN DEFAULT TRUE AFTER id_categoria,

ADD COLUMN data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER ativo,

ADD COLUMN data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER data_criacao;

-- Adicionando campos para melhorar o controle de pedidos

ALTER TABLE PEDIDOS 

ADD COLUMN status_pedido ENUM('pendente', 'confirmado', 'preparando', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente' AFTER dt_pedido,

ADD COLUMN valor_total DECIMAL(10,2) DEFAULT 0.00 AFTER status_pedido,

ADD COLUMN observacoes TEXT AFTER valor_total,

ADD COLUMN data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER observacoes;

-- Melhorando tabela de relacionamento pedidos_produtos

ALTER TABLE PEDIDOS_PRODUTOS 

ADD COLUMN quantidade INT NOT NULL DEFAULT 1 AFTER ID_PROD,

ADD COLUMN preco_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER quantidade,

ADD COLUMN subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED;

-- Adicionando PRIMARY KEY composta para PEDIDOS_PRODUTOS

ALTER TABLE PEDIDOS_PRODUTOS ADD PRIMARY KEY (ID_PEDIDO, ID_PROD);

-- Criando tabela para notificações do sistema

CREATE TABLE NOTIFICACOES (

    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT UNSIGNED NOT NULL,

    titulo VARCHAR(100) NOT NULL,

    mensagem TEXT NOT NULL,

    tipo ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',

    lida BOOLEAN DEFAULT FALSE,

    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    data_leitura TIMESTAMP NULL,

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(ID_USUARIO) ON DELETE CASCADE,

    INDEX idx_notif_usuario (id_usuario),

    INDEX idx_notif_lida (lida),

    INDEX idx_notif_data (data_criacao)

);

-- Inserindo alguns dados de exemplo para as novas funcionalidades

INSERT INTO LOG_ATIVIDADES (id_usuario, acao, descricao) 

SELECT ID_USUARIO, 'cadastro', 'Usuário cadastrado no sistema' 

FROM USUARIOS 

WHERE TIPO_USUARIO = 'V';

-- Inserindo endereços principais baseados nos dados existentes

INSERT INTO ENDERECOS_USUARIO (id_usuario, nome_endereco, logradouro, bairro, cidade, uf, cep, is_principal)

SELECT 

    ID_USUARIO, 

    Endereço Principal,

    LOGRADOURO_USUARIO,

    BAIRRO_USUARIO,

    CIDADE_USUARIO,

    UF_USUARIO,

    CEP_USUARIO,

    TRUE

FROM USUARIOS;
 
 ALTER TABLE USUARIOS
 ADD GOOGLE_ID VARCHAR(255) NULL;