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
    body('cpf_usuario').custom((value) => {
      const cpfLimpo = value.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        throw new Error('CPF deve ter 11 dígitos');
      }
      return true;
    }),
    body('senha_usuario').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('tipo_usuario').isIn(['C', 'V', 'A']).withMessage('Tipo de usuário inválido'),
  ],

  async login(req, res) {
    const errors = validationResult(req);
    const isJson = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
    if (!errors.isEmpty()) {
      if (isJson) return res.status(400).json({ errors: errors.array() });
      return res.render('pages/login', { errors: errors.array(), redirectTo: req.body.redirectTo || req.query.redirectTo || '/' });
    }
  
    // aceita várias variações de nomes de campo
    const email = req.body.email || req.body.nome_usu || req.body.email_usuario;
    const password = req.body.password || req.body.senha_usu || req.body.senha_usuario;
  
    try {
      const usuario = await usuarioModel.findUserEmail({ email_usuario: email });
      if (usuario && bcrypt.compareSync(password, usuario.senha_usuario)) {
        const redirectTo = req.body.redirectTo || req.query.redirectTo || '/';
        if (isJson) return res.status(200).json({ message: 'ok', redirectTo });
        return res.redirect(redirectTo);
      } else {
        if (isJson) return res.status(401).json({ message: 'Email ou senha inválidos' });
        return res.render('pages/login', { errors: [{ msg: 'Email ou senha inválidos' }], redirectTo: req.body.redirectTo || req.query.redirectTo || '/' });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (isJson) return res.status(500).json({ message: error.message });
      return res.render('pages/error', { errors: [{ msg: error.message }] });
    }
  },
  
  async create(req, res) {
    const errors = validationResult(req);
    const isJson = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
    
    if (!errors.isEmpty()) {
      if (isJson) return res.status(400).json({ errors: errors.array() });
      return res.render('pages/cadastro', { errors: errors.array(), redirectTo: req.body.redirectTo || '/' });
    }
  
    try {
      if (!req.body.senha_usuario) {
        if (isJson) return res.status(400).json({ message: 'Senha não fornecida.' });
        return res.render('pages/cadastro', { message: 'Senha não fornecida.' });
      }

      const existente = await usuarioModel.findUserEmail({ email_usuario: req.body.email_usuario });
    if (existente) {
      if (isJson) return res.status(400).json({ message: 'Email já cadastrado.' });
      return res.render('pages/cadastro', { errors: [{ msg: 'Email já cadastrado.' }] });
    }
  
      const hashedPassword = bcrypt.hashSync(req.body.senha_usuario, 10);
      const dados = {
        NOME_USUARIO: req.body.nome_usuario,
        EMAIL_USUARIO: req.body.email_usuario,
        CELULAR_USUARIO: req.body.celular_usuario,
        CPF_USUARIO: req.body.cpf_usuario.replace(/\D/g, ''),
        LOGRADOURO_USUARIO: req.body.logradouro_usuario,
        BAIRRO_USUARIO: req.body.bairro_usuario,
        CIDADE_USUARIO: req.body.cidade_usuario,
        UF_USUARIO: req.body.uf_usuario || '',
        CEP_USUARIO: req.body.cep_usuario,
        SENHA_USUARIO: hashedPassword,
        TIPO_USUARIO: req.body.tipo_usuario || 'C',
      };
  
      const novoUsuario = await usuarioModel.create(dados);

      req.session.usuario = {
        id: novoUsuario.ID_USUARIO,
        nome: dados.NOME_USUARIO,
        email: dados.EMAIL_USUARIO,
        tipo: dados.TIPO_USUARIO
      };
      
      console.log('Sessão criada para usuário:', req.session.usuario);
  
      // Forçar salvamento da sessão
      req.session.save((err) => {
        if (err) {
          console.error('Erro ao salvar sessão:', err);
        }
        
        const redirectTo = req.body.redirectTo || req.query.redirectTo || '/';
        
        if (isJson) {
          return res.status(201).json({ message: 'Usuário cadastrado com sucesso', redirectTo, usuario: { id: novoUsuario.ID_USUARIO, nome: dados.NOME_USUARIO, email: dados.EMAIL_USUARIO } });
        }
        return res.redirect(redirectTo);
      });

    } catch (error) {
      console.error('Erro ao cadastrar:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        if (isJson) return res.status(400).json({ message: 'Email já cadastrado.' });
        return res.render('pages/cadastro', { errors: [{ msg: 'Email já cadastrado.' }] });
      }
  

      if (isJson) return res.status(500).json({ message: error.message });
      return res.render('pages/error', { message: error.message });
      
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