const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const produtoController = require('../controllers/produtoController');

router.get('/', (req, res) => {
  res.render('pages/index', { errors: null });
});

router.get('/login', (req, res) => {
  res.render('pages/login', { errors: null });
});

router.post('/login', usuarioController.login);

router.get('/cadastro', (req, res) => {
  res.render('pages/cadastro', { errors: null });
});

router.post('/cadastro', usuarioController.create);

router.get('/carrinho', (req, res) => {
  res.render('pages/carrinho', { errors: null });
});

router.get('/calendario', (req, res) => {
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

router.get('/conta', (req, res) => {
  res.render('pages/conta', { errors: null });
});

router.get('/finalizar', (req, res) => {
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