const pool = require('../../config/pool_conexoes');

exports.getEnderecosByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    // Buscar endereços cadastrados
    let [enderecos] = await pool.query(
      'SELECT * FROM ENDERECOS_USUARIO WHERE id_usuario = ? AND ativo = TRUE ORDER BY is_principal DESC',
      [id_usuario]
    );
    
    // Se não tem endereços, criar um baseado no cadastro do usuário
    if (enderecos.length === 0) {
      const [usuario] = await pool.query(
        'SELECT LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO FROM USUARIOS WHERE ID_USUARIO = ?',
        [id_usuario]
      );
      if (usuario.length > 0) {
        const u = usuario[0];
        // Verifica se todos os campos estão preenchidos
        if (
          u.LOGRADOURO_USUARIO &&
          u.BAIRRO_USUARIO &&
          u.CIDADE_USUARIO &&
          u.UF_USUARIO &&
          u.CEP_USUARIO
        ) {
          await pool.query(
            'INSERT INTO ENDERECOS_USUARIO (id_usuario, nome_endereco, logradouro, bairro, cidade, uf, cep, is_principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id_usuario, 'Endereço Principal', u.LOGRADOURO_USUARIO, u.BAIRRO_USUARIO, u.CIDADE_USUARIO, u.UF_USUARIO, u.CEP_USUARIO, true]
          );
          // Buscar novamente
          [enderecos] = await pool.query(
            'SELECT * FROM ENDERECOS_USUARIO WHERE id_usuario = ? AND ativo = TRUE ORDER BY is_principal DESC',
            [id_usuario]
          );
        } else {
          // Retorna erro informando que o cadastro está incompleto
          return res.status(400).json({ error: 'Preencha todos os campos de endereço no cadastro do usuário para gerar o endereço principal.' });
        }
      }
    }
    
    res.json(enderecos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.criarEndereco = async (req, res) => {
  try {
    const enderecoModel = require('../models/enderecoModel');
    const endereco = await enderecoModel.create(req.body);
    res.json(endereco);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.calcularFrete = async (req, res) => {
  try {
    const { cep_destino, carrinho } = req.body;
    
    // Buscar vendedor mais próximo (simulação - você pode implementar lógica mais complexa)
    const [vendedores] = await pool.query(`
      SELECT v.*, u.CEP_USUARIO, u.CIDADE_USUARIO, u.UF_USUARIO 
      FROM VENDEDORES v 
      JOIN USUARIOS u ON v.id_usuario = u.ID_USUARIO 
      WHERE u.TIPO_USUARIO = 'V'
      LIMIT 1
    `);
    
    if (!vendedores.length) {
      return res.status(400).json({ error: 'Nenhum vendedor disponível' });
    }
    
    const vendedor = vendedores[0];
    
    // Cálculo simples de frete baseado na distância (simulação)
    const frete = calcularFreteSimples(vendedor.CEP_USUARIO, cep_destino, carrinho);
    
    res.json({
      frete: frete.toFixed(2),
      vendedor: {
        nome: vendedor.NOME_USUARIO,
        cidade: vendedor.CIDADE_USUARIO,
        uf: vendedor.UF_USUARIO
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function calcularFreteSimples(cepOrigem, cepDestino, carrinho) {
  // Lógica simplificada - você pode integrar com APIs de frete reais
  const pesoTotal = carrinho.reduce((total, item) => total + (item.quantidade || 1), 0);
  const valorTotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  
  // Frete base + peso + percentual do valor
  let frete = 10; // Frete base
  frete += pesoTotal * 2; // R$ 2 por item
  
  if (valorTotal > 100) {
    frete *= 0.5; // 50% desconto para compras acima de R$ 100
  }
  
  return Math.max(frete, 5); // Mínimo R$ 5
}

module.exports = exports;