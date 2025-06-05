const produtoModel = require('../models/produtoModel');

const produtoController = {
  async create(req, res) {
    try {
      const produto = await produtoModel.create(req.body);
      res.status(201).json({ produto });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async findAll(req, res) {
    try {
      const produtos = await produtoModel.findAll();
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
      const produto = await produtoModel.update(req.params.id, req.body);
      res.json({ produto });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await produtoModel.delete(req.params.id);
      res.status(204).json({});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = produtoController;