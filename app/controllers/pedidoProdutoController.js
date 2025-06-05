const pedidoProdutoModel = require('../models/pedidoProdutoModel');

exports.createPedidoProduto = async (req, res) => {
  try {
    const pedidoProduto = await pedidoProdutoModel.create(req.body);
    res.status(201).json(pedidoProduto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPedidosProdutos = async (req, res) => {
  try {
    const pedidosProdutos = await pedidoProdutoModel.findAll();
    res.status(200).json(pedidosProdutos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPedidosProdutosByCliente = async (id_usuario) => {
  try {
    const pedidosProdutos = await pedidoProdutoModel.findByCliente(id_usuario);
    return pedidosProdutos;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getPedidoProdutoById = async (req, res) => {
  try {
    const { id_pedido, id_prod } = req.params;
    const pedidoProduto = await pedidoProdutoModel.findById(id_pedido, id_prod);
    if (!pedidoProduto) return res.status(404).json({ error: 'Relação pedido-produto não encontrada' });
    res.status(200).json(pedidoProduto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePedidoProduto = async (req, res) => {
  try {
    const { id_pedido, id_prod } = req.params;
    const pedidoProduto = await pedidoProdutoModel.findById(id_pedido, id_prod);
    if (!pedidoProduto) return res.status(404).json({ error: 'Relação pedido-produto não encontrada' });
    await pedidoProdutoModel.delete(id_pedido, id_prod);
    res.status(204).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};