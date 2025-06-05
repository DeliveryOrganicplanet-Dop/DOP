const pool = require('../../config/pool_conexoes');

const pedidoModel = {
  async create(dados) {
    const { id_cliente, dt_pedido } = dados;
    const [result] = await pool.query(
      'INSERT INTO PEDIDOS (id_cliente, dt_pedido) VALUES (?, ?)',
      [id_cliente, dt_pedido]
    );
    return { id_pedido: result.insertId, ...dados };
  },

  async findAll() {
    const [results] = await pool.query(
      'SELECT p.*, c.cpf_cliente, u.NOME_USUARIO FROM PEDIDOS p JOIN CLIENTES c ON p.id_cliente = c.id_cliente JOIN USUARIOS u ON c.id_usuario = u.ID_USUARIO'
    );
    return results;
  },

  async findById(id) {
    const [results] = await pool.query(
      'SELECT p.*, c.cpf_cliente, u.NOME_USUARIO FROM PEDIDOS p JOIN CLIENTES c ON p.id_cliente = c.id_cliente JOIN USUARIOS u ON c.id_usuario = u.ID_USUARIO WHERE p.id_pedido = ?',
      [id]
    );
    return results[0];
  },

  async findUltimoByCliente(id_usuario) {
    const [results] = await pool.query(
      'SELECT p.*, c.cpf_cliente, u.NOME_USUARIO FROM PEDIDOS p JOIN CLIENTES c ON p.id_cliente = c.id_cliente JOIN USUARIOS u ON c.id_usuario = u.ID_USUARIO WHERE c.id_usuario = ? ORDER BY p.dt_pedido DESC LIMIT 1',
      [id_usuario]
    );
    return results[0];
  },

  async update(id, dados) {
    const { id_cliente, dt_pedido } = dados;
    await pool.query(
      'UPDATE PEDIDOS SET id_cliente = ?, dt_pedido = ? WHERE id_pedido = ?',
      [id_cliente, dt_pedido, id]
    );
    return await this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM PEDIDOS WHERE id_pedido = ?', [id]);
  },
};

module.exports = pedidoModel;