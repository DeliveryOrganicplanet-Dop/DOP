const pool = require('../../config/pool_conexoes.js');

const clienteModel = {
  async create(dados) {
    const { cpf_cliente, id_usuario } = dados;
    const [result] = await pool.query(
      'INSERT INTO CLIENTES (cpf_cliente, id_usuario) VALUES (?, ?)',
      [cpf_cliente, id_usuario]
    );
    return { id_cliente: result.insertId, ...dados };
  },

  async findAll() {
    const [results] = await pool.query(
      'SELECT c.*, u.NOME_USUARIO, u.EMAIL_USUARIO FROM CLIENTES c JOIN USUARIOS u ON c.id_usuario = u.ID_USUARIO'
    );
    return results;
  },

  async findById(id) {
    const [results] = await pool.query(
      'SELECT c.*, u.NOME_USUARIO, u.EMAIL_USUARIO FROM CLIENTES c JOIN USUARIOS u ON c.id_usuario = u.ID_USUARIO WHERE c.id_cliente = ?',
      [id]
    );
    return results[0];
  },

  async update(id, dados) {
    const { cpf_cliente, id_usuario } = dados;
    await pool.query(
      'UPDATE CLIENTES SET cpf_cliente = ?, id_usuario = ? WHERE id_cliente = ?',
      [cpf_cliente, id_usuario, id]
    );
    return await this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM CLIENTES WHERE id_cliente = ?', [id]);
  },
};

module.exports = clienteModel;