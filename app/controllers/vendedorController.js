const vendedorModel = require('../models/vendedorModel');

exports.createVendedor = async (req, res) => {
  try {
    const vendedor = await vendedorModel.create(req.body);
    res.status(201).json(vendedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getVendedores = async (req, res) => {
  try {
    const vendedores = await vendedorModel.findAll();
    res.status(200).json(vendedores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getVendedorById = async (req, res) => {
  try {
    const vendedor = await vendedorModel.findById(req.params.id);
    if (!vendedor) return res.status(404).json({ error: 'Vendedor não encontrado' });
    res.status(200).json(vendedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateVendedor = async (req, res) => {
  try {
    const vendedor = await vendedorModel.update(req.params.id, req.body);
    if (!vendedor) return res.status(404).json({ error: 'Vendedor não encontrado' });
    res.status(200).json(vendedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteVendedor = async (req, res) => {
  try {
    const vendedor = await vendedorModel.findById(req.params.id);
    if (!vendedor) return res.status(404).json({ error: 'Vendedor não encontrado' });
    await vendedorModel.delete(req.params.id);
    res.status(204).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};