const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const usuarioController = {
  validateLogin: [
    body('nome_usu').isEmail().withMessage('Email inválido'),
    body('senha_usu').notEmpty().withMessage('Senha é obrigatória'),
  ],

  validateCreate: [
    body('nome_usuario').notEmpty().withMessage('Nome é obrigatório'),
    body('email_usuario').isEmail().withMessage('Email inválido'),
    body('cpf_usuario').isLength({ min: 11, max: 11 }).withMessage('CPF deve ter 11 dígitos'),
    body('senha_usuario').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('tipo_usuario').isIn(['C', 'V', 'A']).withMessage('Tipo de usuário inválido'),
  ],

  async login(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('pages/login', { errors: errors.array() });
    }
    console.log(req.body);
    try {
      const usuario = await usuarioModel.findUserEmail({ email_usuario: req.body.email });
      console.log(usuario);
      if (usuario && bcrypt.compareSync(req.body.password, usuario.senha_usuario)) {

        return res.redirect('/'); // Redireciona para a página inicial sem sessão
      } else {
        return res.render('pages/login', { errors: [{ msg: 'Email ou senha inválidos' }] });
      }
    } catch (error) {
      res.render('pages/error', { errors: [{ msg: error.message }] });
    }
  },

  async create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se for fetch (JSON), responde com JSON
    if (req.headers['content-type'] === 'application/json') {
      return res.status(400).json({ errors: errors.array() });
    } else {
      return res.render('pages/cadastro', { errors: errors.array() });
    }
  }

  try {
    if (!req.body.senha_usuario) {
      return res.status(400).json({ message: 'Senha não fornecida.' });
    }

    const hashedPassword = bcrypt.hashSync(req.body.senha_usuario, 10);
    const dados = {
      NOME_USUARIO: req.body.nome_usuario,
      EMAIL_USUARIO: req.body.email_usuario,
      CELULAR_USUARIO: req.body.celular_usuario,
      CPF_USUARIO: req.body.cpf_usuario,
      LOGRADOURO_USUARIO: req.body.logradouro_usuario,
      BAIRRO_USUARIO: req.body.bairro_usuario,
      CIDADE_USUARIO: req.body.cidade_usuario,
      UF_USUARIO: req.body.uf_usuario || '', // evita erro se não for enviado
      CEP_USUARIO: req.body.cep_usuario,
      SENHA_USUARIO: hashedPassword,
      TIPO_USUARIO: req.body.tipo_usuario || 'C',
    };

    await usuarioModel.create(dados);

    // Se for fetch (JSON), responde com status
    if (req.headers['content-type'] === 'application/json') {
      return res.status(200).json({ message: 'Usuário cadastrado com sucesso' });
    } else {
      return res.redirect('/login');
    }

  } catch (error) {
    console.error('Erro ao cadastrar:', error.message);

    if (req.headers['content-type'] === 'application/json') {
      return res.status(500).json({ message: error.message });
    } else {
      return res.render('pages/error', { message: error.message });
    }
  }
},


  async findAll(req, res) {
    try {
      const usuarios = await usuarioModel.findAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async findById(req, res) {
    try {
      const usuario = await usuarioModel.findById(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.json({ usuario });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const usuario = await usuarioModel.update(req.params.id, req.body);
      res.json({ usuario });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await usuarioModel.delete(req.params.id);
      res.status(204).json({});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = usuarioController;