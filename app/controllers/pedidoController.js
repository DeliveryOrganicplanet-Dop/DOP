const pedidoModel = require('../models/pedidoModel');

exports.createPedido = async (req, res) => {
  try {
    const pedido = await pedidoModel.create(req.body);
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPedidos = async (req, res) => {
  try {
    const pedidos = await pedidoModel.findAll();
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPedidoById = async (req, res) => {
  try {
    const pedido = await pedidoModel.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(200).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUltimoPedidoByCliente = async (id_usuario) => {
  try {
    const [pedido] = await pedidoModel.findUltimoByCliente(id_usuario);
    return pedido;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.updatePedido = async (req, res) => {
  try {
    const pedido = await pedidoModel.update(req.params.id, req.body);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(200).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePedido = async (req, res) => {
  try {
    const pedido = await pedidoModel.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    await pedidoModel.delete(req.params.id);
    res.status(204).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};