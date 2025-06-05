const clienteModel = require('../models/clienteModel');

exports.createCliente = async (req, res) => {
  try {
    const cliente = await clienteModel.create(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getClientes = async (req, res) => {
  try {
    const clientes = await clienteModel.findAll();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const cliente = await clienteModel.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.status(200).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const cliente = await clienteModel.update(req.params.id, req.body);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.status(200).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await clienteModel.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    await clienteModel.delete(req.params.id);
    res.status(204).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};