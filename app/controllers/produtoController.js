const produtoModel = require('../models/produtoModel');

const produtoController = {
  async create(req, res) {
    try {
      const usuario = req.session.usuario;
      
      if (usuario && usuario.tipo === 'V') {
        const pool = require('../../config/pool_conexoes');
        const [vendedor] = await pool.query(
          'SELECT id_vendedores FROM VENDEDORES WHERE id_usuario = ?',
          [usuario.id]
        );
        
        if (vendedor.length > 0) {
          req.body.id_vendedor = vendedor[0].id_vendedores;
        }
      }
      
      const produto = await produtoModel.create(req.body);
      res.status(201).json({ produto });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async findAll(req, res) {
    try {
      const usuario = req.session.usuario;
      let produtos;
      
      if (usuario && usuario.tipo === 'V') {
        const pool = require('../../config/pool_conexoes');
        const [vendedor] = await pool.query(
          'SELECT id_vendedores FROM VENDEDORES WHERE id_usuario = ?',
          [usuario.id]
        );
        
        if (vendedor.length > 0) {
          produtos = await produtoModel.findByVendedor(vendedor[0].id_vendedores);
        } else {
          produtos = [];
        }
      } else {
        produtos = await produtoModel.findAll();
      }
      
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async findById(req, res) {
    try {
      const produto = await produtoModel.findById(req.params.id);
      if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json({ produto });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const usuario = req.user;
      const produto = await produtoModel.findById(req.params.id);
      
      if (usuario && usuario.tipo_usuario === 'vendedor' && produto.id_vendedor !== usuario.id_vendedores) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const produtoAtualizado = await produtoModel.update(req.params.id, req.body);
      res.json({ produto: produtoAtualizado });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const usuario = req.user;
      const produto = await produtoModel.findById(req.params.id);
      
      if (usuario && usuario.tipo_usuario === 'vendedor' && produto.id_vendedor !== usuario.id_vendedores) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      await produtoModel.delete(req.params.id);
      res.status(204).json({});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = produtoController;