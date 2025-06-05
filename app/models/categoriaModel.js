const pool = require('../../config/pool_conexoes.js');

const categoriaModel = {
  async create(dados) {
    const { nome_categoria } = dados;
    const [result] = await pool.query(
      'INSERT INTO CATEGORIAS (nome_categoria) VALUES (?)',
      [nome_categoria]
    );
    return { id_categoria: result.insertId, ...dados };
  },

  async findAll() {
    const [results] = await pool.query('SELECT * FROM CATEGORIAS');
    return results;
  },

  async findById(id) {
    const [results] = await pool.query('SELECT * FROM CATEGORIAS WHERE id_categoria = ?', [id]);
    return results[0];
  },

  async update(id, dados) {
    const { nome_categoria } = dados;
    await pool.query(
      'UPDATE CATEGORIAS SET nome_categoria = ? WHERE id_categoria = ?',
      [nome_categoria, id]
    );
    return await this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM CATEGORIAS WHERE id_categoria = ?', [id]);
  },
};

module.exports = categoriaModel;