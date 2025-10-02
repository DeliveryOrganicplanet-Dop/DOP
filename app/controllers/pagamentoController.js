const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

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
      
      const body = {
        items: itens.map(item => ({
          title: item.nome,
          unit_price: parseFloat(item.preco),
          quantity: item.quantidade,
          currency_id: 'BRL'
        })),
        back_urls: {
          success: `${req.protocol}://${req.get('host')}/pagamento/sucesso`,
          failure: `${req.protocol}://${req.get('host')}/pagamento/falha`,
          pending: `${req.protocol}://${req.get('host')}/pagamento/pendente`
        }
      };

      const response = await preference.create({ body });
      
      req.session.carrinho = [];
      
      res.json({ 
        id: response.id,
        init_point: response.init_point 
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
      const pedidoModel = require('../models/pedidoModel');
      
      const pedido = await pedidoModel.findByExternalReference(payment.external_reference);
      if (pedido) {
        await pedidoModel.updateStatus(pedido.id, 'aprovado');
        console.log(`Pedido ${pedido.id} aprovado com sucesso`);
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
  }
};

module.exports = pagamentoController;