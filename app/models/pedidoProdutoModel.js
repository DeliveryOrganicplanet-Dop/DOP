const pool = require('../../config/pool_conexoes');

const pedidoProdutoModel = {
  async create(dados) {
    const { ID_PEDIDO, ID_PROD } = dados;
    await pool.query(
      'INSERT INTO PEDIDOS_PRODUTOS (ID_PEDIDO, ID_PROD) VALUES (?, ?)',
      [ID_PEDIDO, ID_PROD]
    );
    return dados;
  },

  async findAll() {
    const [results] = await pool.query(
      'SELECT pp.*, p.nome_prod, ped.id_cliente FROM PEDIDOS_PRODUTOS pp JOIN PRODUTOS p ON pp.ID_PROD = p.id_prod JOIN PEDIDOS ped ON pp.ID_PEDIDO = ped.id_pedido'
    );
    return results;
  },

  async findById(id_pedido, id_prod) {
    const [results] = await pool.query(
      'SELECT pp.*, p.nome_prod, ped.id_cliente FROM PEDIDOS_PRODUTOS pp JOIN PRODUTOS p ON pp.ID_PROD = p.id_prod JOIN PEDIDOS ped ON pp.ID_PEDIDO = ped.id_pedido WHERE pp.ID_PEDIDO = ? AND pp.ID_PROD = ?',
      [id_pedido, id_prod]
    );
    return results[0];
  },

  async findByCliente(id_usuario) {
    const [results] = await pool.query(
      'SELECT pp.*, p.nome_prod, ped.id_cliente FROM PEDIDOS_PRODUTOS pp JOIN PRODUTOS p ON pp.ID_PROD = p.id_prod JOIN PEDIDOS ped ON pp.ID_PEDIDO = ped.id_pedido JOIN CLIENTES c ON ped.id_cliente = c.id_cliente WHERE c.id_usuario = ?',
      [id_usuario]
    );
    return results;
  },

  async delete(id_pedido, id_prod) {
    await pool.query(
      'DELETE FROM PEDIDOS_PRODUTOS WHERE ID_PEDIDO = ? AND ID_PROD = ?',
      [id_pedido, id_prod]
    );
  },
};

module.exports = pedidoProdutoModel;