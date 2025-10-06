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

exports.getVendedoresWithUsers = async () => {
  try {
    const vendedorModel = require('../models/vendedorModel');
    const avaliacaoModel = require('../models/avaliacaoModel');
    
    // Criar tabela de avaliações se não existir
    await avaliacaoModel.criarTabela();
    
    const vendedores = await vendedorModel.findAllWithUsers();
    
    // Adicionar média de avaliações para cada vendedor
    for (let vendedor of vendedores) {
      const avaliacao = await avaliacaoModel.obterMediaVendedor(vendedor.id_vendedores);
      vendedor.media_avaliacao = avaliacao.media;
      vendedor.total_avaliacoes = avaliacao.total;
    }
    
    return vendedores;
  } catch (error) {
    throw error;
  }
};

exports.avaliarVendedor = async (req, res) => {
  try {
    const avaliacaoModel = require('../models/avaliacaoModel');
    const { id_vendedor, nota, comentario } = req.body;
    
    await avaliacaoModel.criar({
      id_vendedor,
      id_usuario: req.session.usuario.id,
      nota,
      comentario
    });
    
    res.json({ success: true, message: 'Avaliação salva com sucesso!' });
  } catch (error) {
    console.error('Erro ao avaliar vendedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};