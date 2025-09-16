const express = require('express');
const path = require('path');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const produtoController = require('../controllers/produtoController');

// Middleware para verificar autenticação
function verificarAuth(req, res, next) {
  console.log('Verificando autenticação para:', req.url);
  console.log('Sessão:', req.session);
  console.log('Usuário na sessão:', req.session?.usuario);
  
  if (req.session && req.session.usuario) {
    console.log('Usuário autenticado, prosseguindo...');
    return next();
  }
  
  console.log('Usuário não autenticado, redirecionando para /cadlog');
  return res.redirect('/cadlog');
}

// Middleware para passar dados do usuário para todas as views
function passarUsuario(req, res, next) {
  res.locals.usuario = req.session.usuario || null;
  next();
}

// Aplicar middleware em todas as rotas
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

// Endpoint para verificar sessão
router.get('/verificar-sessao', (req, res) => {
  res.json({ 
    sessao: req.session.usuario || null,
    sessionId: req.sessionID,
    cookies: req.headers.cookie
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

router.get('/carrinho', verificarAuth, (req, res) => {
  res.render('pages/carrinho', { errors: null });
});

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

router.get('/finalizar', verificarAuth, (req, res) => {
  res.render('pages/finalizar', { errors: null });
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