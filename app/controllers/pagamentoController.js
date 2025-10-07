const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const pool = require('../../config/pool_conexoes');

// Cache do mapeamento de produtos
let produtoCache = null;

// Função para carregar mapeamento de produtos
async function carregarMapeamentoProdutos() {
  try {
    const [produtos] = await pool.query('SELECT id_prod, nome_prod FROM PRODUTOS WHERE ativo = TRUE');
    produtoCache = {};
    produtos.forEach(produto => {
      produtoCache[produto.nome_prod] = produto.id_prod;
    });
    console.log('Mapeamento de produtos carregado:', produtoCache);
  } catch (error) {
    console.error('Erro ao carregar mapeamento:', error);
  }
}

// Função para buscar produto por nome
function getProdutoIdByName(nome) {
  if (!produtoCache) {
    console.log('Cache não carregado, usando fallback');
    return null;
  }
  return produtoCache[nome] || null;
}

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const pagamentoController = {
  async criarPreferencia(req, res) {
    try {
      const { itens, usuario } = req.body;
      const preference = new Preference(client);
      
      // Carregar mapeamento de produtos
      await carregarMapeamentoProdutos();
      
      // Verificar se itens é um array e tem conteúdo
      const itensArray = Array.isArray(itens) ? itens : [];
      
      if (itensArray.length === 0) {
        return res.status(400).json({ error: 'Carrinho vazio' });
      }
      
      // Calcular total
      const total = itensArray.reduce((sum, item) => {
        return sum + (parseFloat(item.preco) * parseInt(item.quantidade));
      }, 0);
      
      // Criar pedido no banco ANTES do pagamento
      const usuarioModel = require('../models/usuarioModel');
      const clienteData = await usuarioModel.findById(req.session.usuario.id);
      
      // Buscar ou criar cliente
      let [cliente] = await pool.query(
        'SELECT id_cliente FROM CLIENTES WHERE id_usuario = ?',
        [req.session.usuario.id]
      );
      
      if (!cliente.length) {
        const cpfCliente = clienteData.CPF_USUARIO || `temp_${req.session.usuario.id}_${Date.now()}`;
        await pool.query(
          'INSERT IGNORE INTO CLIENTES (id_usuario, cpf_cliente) VALUES (?, ?)',
          [req.session.usuario.id, cpfCliente]
        );
        [cliente] = await pool.query(
          'SELECT id_cliente FROM CLIENTES WHERE id_usuario = ?',
          [req.session.usuario.id]
        );
      }
      
      const clienteId = cliente[0].id_cliente;
      
      // Criar pedido
      const [pedidoResult] = await pool.query(
        'INSERT INTO PEDIDOS (id_cliente, dt_pedido, status_pedido, valor_total) VALUES (?, NOW(), ?, ?)',
        [clienteId, 'pendente', total]
      );
      
      const pedidoId = pedidoResult.insertId;
      console.log('Pedido criado com ID:', pedidoId);
      
      // Salvar itens do pedido na tabela PEDIDOS_PRODUTOS
      for (const item of itensArray) {
        let produtoId = item.id;
        
        if (!produtoId) {
          produtoId = getProdutoIdByName(item.nome);
        }
        
        console.log(`Item: ${item.nome}, ProdutoID: ${produtoId}`);
        
        if (produtoId) {
          await pool.query(
            'INSERT INTO PEDIDOS_PRODUTOS (ID_PEDIDO, ID_PROD, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
            [pedidoId, produtoId, item.quantidade, item.preco]
          );
          console.log('Item salvo no pedido');
        } else {
          console.log('Produto não encontrado:', item.nome);
        }
      }
      
      const externalReference = `pedido_${pedidoId}_${Date.now()}`;
      
      await pool.query(
        'UPDATE PEDIDOS SET observacoes = ? WHERE id_pedido = ?',
        [externalReference, pedidoId]
      );
      
      const body = {
        items: itensArray.map(item => ({
          title: item.nome || 'Produto',
          unit_price: parseFloat(item.preco) || 1.0,
          quantity: parseInt(item.quantidade) || 1,
          currency_id: 'BRL'
        })),
        external_reference: externalReference,
        payer: {
          email: req.session.usuario.email,
          name: req.session.usuario.nome
        },
        back_urls: {
          success: `${req.protocol}://${req.get('host')}/pagamento/sucesso?external_reference=${externalReference}&user_id=${req.session.usuario.id}`,
          failure: `${req.protocol}://${req.get('host')}/pagamento/falha`,
          pending: `${req.protocol}://${req.get('host')}/pagamento/pendente`
        }
      };

      const response = await preference.create({ body });
      
      console.log('Pedido salvo com referência:', externalReference);
      
      req.session.carrinho = [];
      
      res.json({ 
        id: response.id,
        init_point: response.init_point,
        pedido_id: pedidoId,
        external_reference: externalReference
      });
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
  },

  async webhook(req, res) {
    try {
      const { action, api_version, data, date_created, id, live_mode, type, user_id } = req.body;
      
      console.log('Webhook MP:', { type, action, data });
      
      if (type === 'payment') {
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: data.id });
        
        const status = paymentInfo.status;
        const externalReference = paymentInfo.external_reference;
        
        switch (status) {
          case 'approved':
            console.log(`Pagamento aprovado: ${externalReference}`);
            await this.processarPedidoAprovado(paymentInfo);
            break;
          case 'rejected':
            console.log(`Pagamento rejeitado: ${externalReference}`);
            break;
          case 'pending':
            console.log(`Pagamento pendente: ${externalReference}`);
            break;
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Erro no webhook:', error);
      res.status(500).send('Erro');
    }
  },

  async processarPedidoAprovado(payment) {
    try {
      const pool = require('../../config/pool_conexoes');
      
      // Buscar pedido pela referência externa
      const [pedidos] = await pool.query(
        'SELECT id_pedido FROM PEDIDOS WHERE observacoes = ?',
        [payment.external_reference]
      );
      
      if (pedidos.length > 0) {
        const pedidoId = pedidos[0].id_pedido;
        
        // Atualizar status para confirmado
        await pool.query(
          'UPDATE PEDIDOS SET status_pedido = ? WHERE id_pedido = ?',
          ['confirmado', pedidoId]
        );
        
        console.log(`Pedido ${pedidoId} aprovado com sucesso`);
      }
    } catch (error) {
      console.error('Erro ao processar pedido aprovado:', error);
    }
  },

  async processarPedidoRejeitado(payment) {
    try {
      const pedidoModel = require('../models/pedidoModel');
      
      const pedido = await pedidoModel.findByExternalReference(payment.external_reference);
      if (pedido) {
        await pedidoModel.updateStatus(pedido.id, 'rejeitado');
      }
    } catch (error) {
      console.error('Erro ao processar pedido rejeitado:', error);
    }
  },

  async processarPedidoPendente(payment) {
    try {
      const pedidoModel = require('../models/pedidoModel');
      
      const pedido = await pedidoModel.findByExternalReference(payment.external_reference);
      if (pedido) {
        await pedidoModel.updateStatus(pedido.id, 'pendente');
      }
    } catch (error) {
      console.error('Erro ao processar pedido pendente:', error);
    }
  },


};

module.exports = pagamentoController;