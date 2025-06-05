const categoriaModel = require('../models/categoriaModel');

exports.createCategoria = async (req, res) => {
  try {
    const categoria = await categoriaModel.create(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCategorias = async (req, res) => {
  try {
    const categorias = await categoriaModel.findAll();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCategoriaById = async (req, res) => {
  try {
    const categoria = await categoriaModel.findById(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.status(200).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCategoria = async (req, res) => {
  try {
    const categoria = await categoriaModel.update(req.params.id, req.body);
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.status(200).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCategoria = async (req, res) => {
  try {
    const categoria = await categoriaModel.findById(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
    await categoriaModel.delete(req.params.id);
    res.status(204).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};