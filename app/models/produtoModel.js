const pool = require('../../config/pool_conexoes');

const produtoModel = {
  async create(dados) {
    const { NOME_PRODUTO, PRECO_PRODUTO, DESCRICAO_PRODUTO, CATEGORIA_ID } = dados;
    const [result] = await pool.query(
      'INSERT INTO PRODUTOS (NOME_PRODUTO, PRECO_PRODUTO, DESCRICAO_PRODUTO, CATEGORIA_ID) VALUES (?, ?, ?, ?)',
      [NOME_PRODUTO, PRECO_PRODUTO, DESCRICAO_PRODUTO, CATEGORIA_ID]
    );
    return { ID_PRODUTO: result.insertId, ...dados };
  },

  async findAll() {
    const [results] = await pool.query('SELECT * FROM PRODUTOS');
    return results;
  },

  async findById(id) {
    const [results] = await pool.query('SELECT * FROM PRODUTOS WHERE ID_PRODUTO = ?', [id]);
    return results[0];
  },

  async update(id, dados) {
    const { NOME_PRODUTO, PRECO_PRODUTO, DESCRICAO_PRODUTO, CATEGORIA_ID } = dados;
    await pool.query(
      'UPDATE PRODUTOS SET NOME_PRODUTO = ?, PRECO_PRODUTO = ?, DESCRICAO_PRODUTO = ?, CATEGORIA_ID = ? WHERE ID_PRODUTO = ?',
      [NOME_PRODUTO, PRECO_PRODUTO, DESCRICAO_PRODUTO, CATEGORIA_ID, id]
    );
    return await this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM PRODUTOS WHERE ID_PRODUTO = ?', [id]);
  },
};

module.exports = produtoModel;