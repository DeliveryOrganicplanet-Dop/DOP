const express = require('express');
const path = require('path');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const produtoController = require('../controllers/produtoController');
const carrinhoController = require('../controllers/carrinhoController');
const pagamentoController = require('../controllers/pagamentoController');

// Middleware para verificar autenticação
function verificarAuth(req, res, next) {
  console.log('=== DEBUG AUTH ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Usuario na sessão:', req.session?.usuario);
  console.log('Headers:', req.headers.cookie);
  
  if (req.session && req.session.usuario && req.session.usuario.id) {
    console.log('Usuário autenticado:', req.session.usuario.nome);
    return next();
  }
  
  console.log('Usuário não autenticado');
  
  // Para requisições AJAX, retornar JSON
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  return res.redirect('/login');
}

// Middleware para inicializar sessão
function inicializarSessao(req, res, next) {
  if (!req.session.carrinho) {
    req.session.carrinho = [];
  }
  next();
}

// Middleware para passar dados do usuário para todas as views
function passarUsuario(req, res, next) {
  res.locals.usuario = req.session.usuario || null;
  next();
}

// Aplicar middleware em todas as rotas
router.use(inicializarSessao);
router.use(passarUsuario);


router.get('/', async (req, res) => {
  try {
    const produtoModel = require('../models/produtoModel');
    const produtos = await produtoModel.findAll();
    res.render('pages/index', { errors: null, produtos });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    // Produtos de fallback quando banco não está disponível
    const produtosFallback = [
      { id_prod: 1, nome_prod: 'Abacaxi', valor_unitario: 9.70, qtde_estoque: 10, nome_imagem: 'abacaxi.png' },
      { id_prod: 2, nome_prod: 'Alface', valor_unitario: 3.50, qtde_estoque: 15, nome_imagem: 'alface.png' },
      { id_prod: 3, nome_prod: 'Ameixa', valor_unitario: 8.90, qtde_estoque: 8, nome_imagem: 'ameixa.png' },
      { id_prod: 4, nome_prod: 'Brócolis', valor_unitario: 5.20, qtde_estoque: 12, nome_imagem: 'brocolis.png' }
    ];
    res.render('pages/index', { errors: null, produtos: produtosFallback });
  }
});

router.get('/teste', (req, res) => {
  res.sendFile(path.join(__dirname, '../../test_cadastro.html'));
});

router.get('/teste-simples', (req, res) => {
  res.sendFile(path.join(__dirname, '../../teste_simples.html'));
});

router.get('/teste-basico', (req, res) => {
  res.sendFile(path.join(__dirname, '../../teste_basico.html'));
});

router.get('/teste-carrinho', (req, res) => {
  res.sendFile(path.join(__dirname, '../../teste_carrinho.html'));
});

// Endpoint para verificar sessão
router.get('/verificar-sessao', (req, res) => {
  console.log('Verificando sessão:', req.session);
  res.json({ 
    sessao: req.session.usuario || null,
    sessionId: req.sessionID,
    cookies: req.headers.cookie,
    sessionData: req.session
  });
});

// Endpoint de teste para sessão
router.get('/api/test-session', (req, res) => {
  console.log('=== TEST SESSION ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('Usuario:', req.session?.usuario);
  console.log('Cookies:', req.headers.cookie);
  
  res.json({
    authenticated: !!(req.session && req.session.usuario),
    user: req.session?.usuario || null,
    sessionId: req.sessionID
  });
});

// Endpoint para testar conexão com banco
router.get('/test-db', async (req, res) => {
  try {
    const pool = require('../../config/pool_conexoes');
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ status: 'success', message: 'Conexão com banco OK', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/login', (req, res) => {
  res.render('pages/login', { errors: null });
});

router.post('/login', usuarioController.login);

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
    }
    res.redirect('/');
  });
});

router.get('/cadastro', (req, res) => {
  res.render('pages/cadastro', { errors: null });
});

router.post('/cadastro', usuarioController.validateCreate, usuarioController.create);

// Rotas para gerenciar dados temporários do cadastro
router.post('/api/cadastro-temp', (req, res) => {
  req.session.dadosTemporarios = req.body;
  res.json({ success: true });
});

router.get('/api/verificar-dados-temp', (req, res) => {
  if (req.session.dadosTemporarios) {
    res.json({ exists: true });
  } else {
    res.status(404).json({ exists: false });
  }
});

router.get('/api/obter-dados-temp', (req, res) => {
  if (req.session.dadosTemporarios) {
    res.json(req.session.dadosTemporarios);
  } else {
    res.status(404).json({ error: 'Dados não encontrados' });
  }
});

router.delete('/api/limpar-dados-temp', (req, res) => {
  delete req.session.dadosTemporarios;
  res.json({ success: true });
});

router.get('/carrinho', (req, res) => {
  const carrinho = req.session.carrinho || [];
  res.render('pages/carrinho', { errors: null, carrinho });
});

router.get('/favoritos', verificarAuth, (req, res) => {
  res.render('pages/favoritos', { errors: null });
});

// Rotas da API do carrinho (sem autenticação para permitir uso como visitante)
router.post('/api/carrinho/adicionar', carrinhoController.adicionarProduto);
router.get('/api/carrinho', carrinhoController.obterCarrinho);
router.put('/api/carrinho/quantidade', carrinhoController.alterarQuantidade);
router.delete('/api/carrinho/remover', carrinhoController.removerItem);
router.delete('/api/carrinho/limpar', carrinhoController.limparCarrinho);

router.get('/calendario', verificarAuth, (req, res) => {
  res.render('pages/calendario', { errors: null });
});

router.get('/abacaxi', (req, res) => {
  res.render('pages/abacaxi', { errors: null });
});

router.get('/alface', (req, res) => {
  res.render('pages/alface', { errors: null });
});

router.get('/ameixa', (req, res) => {
  res.render('pages/ameixa', { errors: null });
});

router.get('/Brocolis', (req, res) => {
  res.render('pages/Brocolis', { errors: null });
});

router.get('/cadastro2', (req, res) => {
  res.render('pages/cadastro2', { errors: null });
});

router.get('/cadlog', (req, res) => {
  res.render('pages/cadlog', { errors: null });
});

router.get('/conta', verificarAuth, async (req, res) => {
  try {
    const usuarioModel = require('../models/usuarioModel');
    const usuarioCompleto = await usuarioModel.findById(req.session.usuario.id);
    
    const usuario = {
      id: usuarioCompleto.ID_USUARIO,
      nome: usuarioCompleto.NOME_USUARIO,
      email: usuarioCompleto.EMAIL_USUARIO,
      tipo: usuarioCompleto.TIPO_USUARIO,
      foto: usuarioCompleto.FOTO_USUARIO
    };
    
    res.render('pages/conta', { errors: null, usuario });
  } catch (error) {
    console.error('Erro ao carregar conta:', error);
    res.render('pages/conta', { errors: null, usuario: req.session.usuario });
  }
});

router.get('/painel-vendedor', verificarAuth, (req, res) => {
  if (req.session.usuario.tipo !== 'V') {
    return res.redirect('/conta');
  }
  res.render('pages/painel-vendedor', { errors: null });
});

router.get('/finalizar', (req, res) => {
  const carrinho = req.session.carrinho || [];
  
  if (carrinho.length === 0) {
    return res.redirect('/');
  }
  
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const totalPreco = carrinho.reduce((acc, item) => acc + (item.quantidade * item.preco), 0);
  res.render('pages/finalizar', { errors: null, carrinho, totalItens, totalPreco, usuario: req.session.usuario });
});

router.get('/assinatura', (req, res) => {
  res.render('pages/assinatura', { errors: null });
});

router.get('/produtos', async (req, res) => {
  try {
    const produtoModel = require('../models/produtoModel');
    const termoBusca = req.query.busca;
    
    let produtos;
    if (termoBusca) {
      produtos = await produtoModel.search(termoBusca);
    } else {
      produtos = await produtoModel.findAll();
    }
    
    res.render('pages/produtos', { 
      errors: null, 
      produtos, 
      termoBusca: termoBusca || '' 
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    // Produtos de fallback
    const produtosFallback = [
      { id_prod: 1, nome_prod: 'Abacaxi', valor_unitario: 9.70, qtde_estoque: 10, nome_imagem: 'abacaxi.png', nome_categoria: 'Frutas' },
      { id_prod: 2, nome_prod: 'Alface', valor_unitario: 3.50, qtde_estoque: 15, nome_imagem: 'alface.png', nome_categoria: 'Verduras' },
      { id_prod: 3, nome_prod: 'Ameixa', valor_unitario: 8.90, qtde_estoque: 8, nome_imagem: 'ameixa.png', nome_categoria: 'Frutas' },
      { id_prod: 4, nome_prod: 'Brócolis', valor_unitario: 5.20, qtde_estoque: 12, nome_imagem: 'brocolis.png', nome_categoria: 'Verduras' }
    ];
    
    let produtos = produtosFallback;
    const termoBusca = req.query.busca;
    
    if (termoBusca) {
      produtos = produtosFallback.filter(p => 
        p.nome_prod.toLowerCase().includes(termoBusca.toLowerCase()) ||
        p.nome_categoria.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }
    
    res.render('pages/produtos', { 
      errors: null, 
      produtos, 
      termoBusca: termoBusca || '' 
    });
  }
});

router.get('/setup', (req, res) => {
  res.render('pages/setup', { errors: null });
});

router.get('/ver-produtos', async (req, res) => {
  try {
    const produtoModel = require('../models/produtoModel');
    const produtos = await produtoModel.findAll();
    res.render('pages/produtos', { errors: null, produtos, termoBusca: '' });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    const produtosFallback = [
      { id_prod: 1, nome_prod: 'Abacaxi', valor_unitario: 9.70, qtde_estoque: 10, nome_imagem: 'abacaxi.png', nome_categoria: 'Frutas' },
      { id_prod: 2, nome_prod: 'Alface', valor_unitario: 3.50, qtde_estoque: 15, nome_imagem: 'alface.png', nome_categoria: 'Verduras' },
      { id_prod: 3, nome_prod: 'Ameixa', valor_unitario: 8.90, qtde_estoque: 8, nome_imagem: 'ameixa.png', nome_categoria: 'Frutas' },
      { id_prod: 4, nome_prod: 'Brócolis', valor_unitario: 5.20, qtde_estoque: 12, nome_imagem: 'brocolis.png', nome_categoria: 'Verduras' }
    ];
    res.render('pages/produtos', { errors: null, produtos: produtosFallback, termoBusca: '' });
  }
});

router.get('/vendedores', async (req, res) => {
  try {
    const vendedorController = require('../controllers/vendedorController');
    const vendedores = await vendedorController.getVendedoresWithUsers();
    res.render('pages/vendedores', { errors: null, vendedores });
  } catch (error) {
    res.render('pages/error', { errors: [{ msg: 'Erro ao carregar vendedores' }] });
  }
});

// Rota dinâmica para produtos do banco
router.get('/produto/:id', async (req, res) => {
  try {
    const produtoModel = require('../models/produtoModel');
    const produto = await produtoModel.findByIdWithCategory(req.params.id);
    
    if (!produto) {
      return res.status(404).render('pages/error', { message: 'Produto não encontrado' });
    }
    
    res.render('pages/produto-dinamico', { errors: null, produto });
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    res.status(500).render('pages/error', { message: 'Erro ao carregar produto' });
  }
});

// Rotas estáticas dos produtos antigos (manter compatibilidade)
router.get('/produtos/:nome', (req, res) => {
  const produto = req.params.nome;
  res.render(`pages/${produto}`, { errors: null });
});

router.get('/api/usuarios', usuarioController.findAll);
router.get('/api/usuarios/:id', usuarioController.findById);
router.put('/api/usuarios/:id', usuarioController.update);
router.delete('/api/usuarios/:id', usuarioController.delete);

router.get('/api/produtos', produtoController.findAll);
router.post('/api/produtos', produtoController.create);
router.get('/api/produtos/:id', produtoController.findById);
router.put('/api/produtos/:id', produtoController.update);
router.delete('/api/produtos/:id', produtoController.delete);

// Rotas de pagamento
router.post('/api/pagamento/criar-preferencia', pagamentoController.criarPreferencia);
router.post('/webhook/mercadopago', pagamentoController.webhook);

// Rotas para dados do usuário
router.get('/api/user-data', verificarAuth, async (req, res) => {
  try {
    // Buscar dados atualizados do banco
    const usuarioModel = require('../models/usuarioModel');
    const usuarioAtualizado = await usuarioModel.findById(req.session.usuario.id);
    
    if (usuarioAtualizado) {
      // Atualizar sessão com dados do banco
      req.session.usuario = {
        id: usuarioAtualizado.ID_USUARIO,
        nome: usuarioAtualizado.NOME_USUARIO,
        email: usuarioAtualizado.EMAIL_USUARIO,
        tipo: usuarioAtualizado.TIPO_USUARIO
      };
    }
    
    console.log('Dados do usuário enviados:', usuarioAtualizado);
    res.json(usuarioAtualizado);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('O arquivo enviado não é uma imagem válida.'));
    }
  }
});

router.post('/api/upload-photo', verificarAuth, upload.single('photo'), async (req, res) => {
  try {
    console.log('Upload iniciado para usuário:', req.session.usuario.id);
    console.log('Arquivo recebido:', req.file ? 'Sim' : 'Não');
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    const fs = require('fs');
    const filename = `profile-${req.session.usuario.id}-${Date.now()}.jpg`;
    const filepath = path.join(__dirname, '../public/uploads/profiles/', filename);
    const fotoPath = `/uploads/profiles/${filename}`;
    
    console.log('Salvando arquivo em:', filepath);
    
    // Salvar arquivo
    fs.writeFileSync(filepath, req.file.buffer);
    
    // Atualizar banco
    const usuarioModel = require('../models/usuarioModel');
    await usuarioModel.updatePhoto(req.session.usuario.id, fotoPath);
    
    console.log('Foto salva com sucesso:', fotoPath);
    
    res.json({ success: true, fotoPath });
  } catch (error) {
    console.error('Erro ao salvar foto:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/api/remove-photo', verificarAuth, async (req, res) => {
  try {
    const usuarioModel = require('../models/usuarioModel');
    
    await usuarioModel.removePhoto(req.session.usuario.id);
    req.session.usuario.foto = null;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    res.status(500).json({ error: 'Erro ao remover foto' });
  }
});

// Rota para atualizar perfil
router.put('/api/update-profile', verificarAuth, usuarioController.updateProfile);

// Rota para alterar senha
router.put('/api/update-password', verificarAuth, usuarioController.updatePassword);

// Rota para buscar estatísticas do usuário
router.get('/api/user-stats', verificarAuth, async (req, res) => {
  try {
    const usuarioModel = require('../models/usuarioModel');
    const stats = await usuarioModel.getUserStats(req.session.usuario.id);
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao carregar estatísticas' });
  }
});

// Rota para inserir produtos do site
router.post('/api/setup-produtos', async (req, res) => {
  try {
    const pool = require('../../config/pool_conexoes');
    
    // Inserir categoria padrão
    await pool.query('INSERT IGNORE INTO CATEGORIAS (id_categoria, nome_categoria) VALUES (1, "Frutas e Verduras")');
    
    // Inserir imagem padrão
    await pool.query('INSERT IGNORE INTO IMAGENS (id_imagem, nome_imagem) VALUES (1, "default.jpg")');
    
    // Produtos do site
    const produtos = [
      { id: 1, nome: 'Abacaxi', preco: 9.70 },
      { id: 2, nome: 'Alface', preco: 3.50 },
      { id: 3, nome: 'Ameixa', preco: 8.90 },
      { id: 4, nome: 'Brócolis', preco: 5.20 }
    ];

    for (const produto of produtos) {
      await pool.query(`
        INSERT INTO PRODUTOS (id_prod, nome_prod, valor_unitario, qtde_estoque, id_categoria, id_imagem, ativo) 
        VALUES (?, ?, ?, 999, 1, 1, TRUE)
        ON DUPLICATE KEY UPDATE 
        nome_prod = VALUES(nome_prod), 
        valor_unitario = VALUES(valor_unitario)
      `, [produto.id, produto.nome, produto.preco]);
    }

    res.json({ success: true, message: 'Produtos inseridos com sucesso!' });
  } catch (error) {
    console.error('Erro ao inserir produtos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para converter usuário em vendedor
router.post('/api/converter-vendedor', verificarAuth, async (req, res) => {
  try {
    const pool = require('../../config/pool_conexoes');
    const userId = req.session.usuario.id;
    
    // Verificar se já é vendedor
    if (req.session.usuario.tipo === 'V') {
      return res.json({ success: false, error: 'Usuário já é vendedor' });
    }
    
    // Atualizar tipo do usuário para vendedor
    await pool.query(
      'UPDATE USUARIOS SET TIPO_USUARIO = ? WHERE ID_USUARIO = ?',
      ['V', userId]
    );
    
    // Criar registro na tabela VENDEDORES
    await pool.query(
      'INSERT INTO VENDEDORES (tipo_pessoa, digito_pessoa, id_usuario) VALUES (?, ?, ?)',
      ['PF', '00000000000', userId]
    );
    
    // Atualizar sessão
    req.session.usuario.tipo = 'V';
    
    res.json({ success: true, message: 'Conta convertida para vendedor com sucesso!' });
  } catch (error) {
    console.error('Erro ao converter para vendedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para categorias
router.get('/api/categorias', async (req, res) => {
  try {
    const pool = require('../../config/pool_conexoes');
    const [categorias] = await pool.query('SELECT * FROM CATEGORIAS ORDER BY nome_categoria');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/categorias', verificarAuth, async (req, res) => {
  try {
    const pool = require('../../config/pool_conexoes');
    const { nome_categoria } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO CATEGORIAS (nome_categoria) VALUES (?)',
      [nome_categoria]
    );
    
    res.json({ id_categoria: result.insertId, nome_categoria });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para upload de imagem
router.post('/api/upload-imagem', verificarAuth, upload.single('imagem'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }
    
    const fs = require('fs');
    const filename = `produto-${Date.now()}.jpg`;
    const filepath = path.join(__dirname, '../public/imagens/', filename);
    
    fs.writeFileSync(filepath, req.file.buffer);
    
    const pool = require('../../config/pool_conexoes');
    const [result] = await pool.query(
      'INSERT INTO IMAGENS (nome_imagem) VALUES (?)',
      [filename]
    );
    
    res.json({ id_imagem: result.insertId, nome_imagem: filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para mapear produtos do banco
router.get('/api/mapear-produtos', async (req, res) => {
  try {
    const pool = require('../../config/pool_conexoes');
    const [produtos] = await pool.query('SELECT id_prod, nome_prod FROM PRODUTOS WHERE ativo = TRUE');
    
    const mapeamento = {};
    produtos.forEach(produto => {
      mapeamento[produto.nome_prod] = produto.id_prod;
    });
    
    res.json(mapeamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware para salvar sessão após atualizações
router.use('/api/update-*', (req, res, next) => {
  if (req.session) {
    req.session.save((err) => {
      if (err) console.error('Erro ao salvar sessão:', err);
    });
  }
  next();
});



// Páginas de retorno do pagamento
router.get('/pagamento/sucesso', async (req, res) => {
  try {
    const { external_reference, user_id } = req.query;
    
    console.log('Página de sucesso:', { external_reference, user_id });
    
    if (external_reference) {
      const pool = require('../../config/pool_conexoes');
      
      // Buscar pedido pela referência externa
      const [pedidos] = await pool.query(
        'SELECT id_pedido FROM PEDIDOS WHERE observacoes LIKE ?',
        [`%${external_reference}%`]
      );
      
      if (pedidos.length > 0) {
        const pedidoId = pedidos[0].id_pedido;
        
        // Atualizar status para confirmado
        await pool.query(
          'UPDATE PEDIDOS SET status_pedido = ? WHERE id_pedido = ?',
          ['confirmado', pedidoId]
        );
        
        console.log(`Pedido ${pedidoId} aprovado automaticamente - Usuário: ${user_id}`);
      }
    }
    
    res.render('pages/pagamento-sucesso', { 
      errors: null, 
      external_reference: external_reference || null,
      user_id: user_id || null
    });
  } catch (error) {
    console.error('Erro ao processar sucesso:', error);
    res.render('pages/pagamento-sucesso', { errors: null, external_reference: null, user_id: null });
  }
});

router.get('/pagamento/falha', (req, res) => {
  res.render('pages/pagamento-falha', { errors: null });
});

router.get('/pagamento/pendente', (req, res) => {
  res.render('pages/pagamento-pendente', { errors: null });
});

// Rota para simular aprovação de pagamento (teste)
router.post('/api/simular-aprovacao', async (req, res) => {
  try {
    const { external_reference } = req.body;
    
    const pool = require('../../config/pool_conexoes');
    const [pedidos] = await pool.query(
      'SELECT id_pedido FROM PEDIDOS WHERE observacoes LIKE ?',
      [`%${external_reference}%`]
    );
    
    if (pedidos.length > 0) {
      const pedidoId = pedidos[0].id_pedido;
      
      await pool.query(
        'UPDATE PEDIDOS SET status_pedido = ? WHERE id_pedido = ?',
        ['confirmado', pedidoId]
      );
      
      res.json({ success: true, message: `Pedido ${pedidoId} aprovado manualmente` });
    } else {
      res.json({ success: false, message: 'Pedido não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de debug para verificar pedidos
router.get('/api/debug-pedidos', verificarAuth, async (req, res) => {
  try {
    const pool = require('../../config/pool_conexoes');
    
    // Buscar cliente do usuário
    const [cliente] = await pool.query(
      'SELECT id_cliente FROM CLIENTES WHERE id_usuario = ?',
      [req.session.usuario.id]
    );
    
    if (cliente.length === 0) {
      return res.json({ pedidos: [], message: 'Cliente não encontrado' });
    }
    
    // Buscar todos os pedidos do cliente
    const [pedidos] = await pool.query(
      'SELECT * FROM PEDIDOS WHERE id_cliente = ? ORDER BY dt_pedido DESC',
      [cliente[0].id_cliente]
    );
    
    res.json({ 
      usuario_id: req.session.usuario.id,
      cliente_id: cliente[0].id_cliente,
      pedidos: pedidos,
      total_pedidos: pedidos.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para aprovar último pedido pendente
router.post('/api/aprovar-ultimo-pedido', verificarAuth, async (req, res) => {
  try {
    const pool = require('../../config/pool_conexoes');
    
    // Buscar cliente do usuário
    const [cliente] = await pool.query(
      'SELECT id_cliente FROM CLIENTES WHERE id_usuario = ?',
      [req.session.usuario.id]
    );
    
    if (cliente.length === 0) {
      return res.json({ success: false, message: 'Cliente não encontrado' });
    }
    
    // Buscar último pedido pendente
    const [pedidos] = await pool.query(
      'SELECT id_pedido FROM PEDIDOS WHERE id_cliente = ? AND status_pedido = "pendente" ORDER BY dt_pedido DESC LIMIT 1',
      [cliente[0].id_cliente]
    );
    
    if (pedidos.length > 0) {
      const pedidoId = pedidos[0].id_pedido;
      
      await pool.query(
        'UPDATE PEDIDOS SET status_pedido = ? WHERE id_pedido = ?',
        ['confirmado', pedidoId]
      );
      
      res.json({ success: true, message: `Pedido ${pedidoId} aprovado!` });
    } else {
      res.json({ success: false, message: 'Nenhum pedido pendente encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para avaliar vendedor
router.post('/api/avaliar-vendedor', verificarAuth, require('../controllers/vendedorController').avaliarVendedor);

// Rota para avaliar produto
router.post('/api/avaliar-produto', verificarAuth, async (req, res) => {
  try {
    const avaliacaoProdutoModel = require('../models/avaliacaoProdutoModel');
    const { id_produto, nota, comentario } = req.body;
    
    await avaliacaoProdutoModel.criar({
      id_usuario: req.session.usuario.id,
      id_produto,
      nota,
      comentario
    });
    
    res.json({ success: true, message: 'Avaliação do produto salva com sucesso!' });
  } catch (error) {
    console.error('Erro ao avaliar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter avaliações de um produto
router.get('/api/produto/:id/avaliacoes', async (req, res) => {
  try {
    const avaliacaoProdutoModel = require('../models/avaliacaoProdutoModel');
    const avaliacoes = await avaliacaoProdutoModel.obterAvaliacoesProduto(req.params.id);
    res.json(avaliacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;