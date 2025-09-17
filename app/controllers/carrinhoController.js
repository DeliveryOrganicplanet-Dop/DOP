const carrinhoController = {
  // Adicionar produto ao carrinho (sessão)
  adicionarProduto(req, res) {
    const { nome, preco, imagem } = req.body;
    
    if (!req.session.carrinho) {
      req.session.carrinho = [];
    }
    
    const itemExistente = req.session.carrinho.find(item => item.nome === nome);
    
    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      req.session.carrinho.push({ nome, preco, imagem, quantidade: 1 });
    }
    
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar carrinho' });
      }
      res.json({ success: true, carrinho: req.session.carrinho });
    });
  },

  // Obter carrinho
  obterCarrinho(req, res) {
    const carrinho = req.session.carrinho || [];
    res.json({ carrinho });
  },

  // Alterar quantidade
  alterarQuantidade(req, res) {
    const { nome, quantidade } = req.body;
    
    if (!req.session.carrinho) {
      return res.status(404).json({ error: 'Carrinho vazio' });
    }
    
    const item = req.session.carrinho.find(item => item.nome === nome);
    if (item) {
      item.quantidade = Math.max(1, quantidade);
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao atualizar carrinho' });
        }
        res.json({ success: true, carrinho: req.session.carrinho });
      });
    } else {
      res.status(404).json({ error: 'Item não encontrado' });
    }
  },

  // Remover item
  removerItem(req, res) {
    const { nome } = req.body;
    
    if (!req.session.carrinho) {
      return res.status(404).json({ error: 'Carrinho vazio' });
    }
    
    req.session.carrinho = req.session.carrinho.filter(item => item.nome !== nome);
    
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao remover item' });
      }
      res.json({ success: true, carrinho: req.session.carrinho });
    });
  },

  // Limpar carrinho
  limparCarrinho(req, res) {
    req.session.carrinho = [];
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao limpar carrinho' });
      }
      res.json({ success: true });
    });
  }
};

module.exports = carrinhoController;