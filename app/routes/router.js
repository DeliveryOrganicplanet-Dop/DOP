const express = require('express');
const path = require('path');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const produtoController = require('../controllers/produtoController');
const carrinhoController = require('../controllers/carrinhoController');

// Middleware para verificar autenticação
function verificarAuth(req, res, next) {
  console.log('Verificando autenticação para:', req.url);
  console.log('Session ID:', req.sessionID);
  console.log('Usuário na sessão:', req.session?.usuario);
  
  if (req.session && req.session.usuario) {
    console.log('Usuário autenticado:', req.session.usuario.nome);
    return next();
  }
  
  console.log('Usuário não autenticado, redirecionando para login');
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


router.get('/', (req, res) => {
  res.render('pages/index', { errors: null });
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

router.get('/conta', verificarAuth, (req, res) => {
  res.render('pages/conta', { errors: null, usuario: req.session.usuario });
});

router.get('/finalizar', (req, res) => {
  const carrinho = req.session.carrinho || [];
  
  // Se o carrinho estiver vazio, redirecionar para home
  if (carrinho.length === 0) {
    return res.redirect('/');
  }
  
  // Se não estiver logado, redirecionar para login
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const totalPreco = carrinho.reduce((acc, item) => acc + (item.quantidade * item.preco), 0);
  res.render('pages/finalizar', { errors: null, carrinho, totalItens, totalPreco });
});

router.get('/produtos', async (req, res) => {
  try {
    const produtos = await produtoController.findAll(req, res);
    // Como o controller já envia a resposta, vamos criar uma versão que retorna os dados
    const produtoModel = require('../models/produtoModel');
    const produtosList = await produtoModel.findAll();
    res.render('pages/produtos', { errors: null, produtos: produtosList });
  } catch (error) {
    res.render('pages/error', { errors: [{ msg: 'Erro ao carregar produtos' }] });
  }
});

router.get('/assinatura', (req, res) => {
  res.render('pages/assinatura', { errors: null });
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

module.exports = router;