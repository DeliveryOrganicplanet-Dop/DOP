const pool = require('../../config/pool_conexoes');

const vendedorModel = {
  async create(dados) {
    const { tipo_pessoa, digito_pessoa, id_usuario } = dados;
    const [result] = await pool.query(
      'INSERT INTO VENDEDORES (tipo_pessoa, digito_pessoa, id_usuario) VALUES (?, ?, ?)',
      [tipo_pessoa, digito_pessoa, id_usuario]
    );
    return { id_vendedores: result.insertId, ...dados };
  },

  async findAll() {
    const [results] = await pool.query(
      'SELECT v.*, u.NOME_USUARIO, u.EMAIL_USUARIO FROM VENDEDORES v JOIN USUARIOS u ON v.id_usuario = u.ID_USUARIO'
    );
    return results;
  },

  async findById(id) {
    const [results] = await pool.query(
      'SELECT v.*, u.NOME_USUARIO, u.EMAIL_USUARIO FROM VENDEDORES v JOIN USUARIOS u ON v.id_usuario = u.ID_USUARIO WHERE v.id_vendedores = ?',
      [id]
    );
    return results[0];
  },

  async update(id, dados) {
    const { tipo_pessoa, digito_pessoa, id_usuario } = dados;
    await pool.query(
      'UPDATE VENDEDORES SET tipo_pessoa = ?, digito_pessoa = ?, id_usuario = ? WHERE id_vendedores = ?',
      [tipo_pessoa, digito_pessoa, id_usuario, id]
    );
    return await this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM VENDEDORES WHERE id_vendedores = ?', [id]);
  },
};

module.exports = vendedorModel;