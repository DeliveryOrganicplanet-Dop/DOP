const pool = require('../../config/pool_conexoes');

const usuarioModel = {
  async findUserEmail(dadosForm) {
    const [results] = await pool.query(
      'SELECT ID_USUARIO AS id_usuario, NOME_USUARIO AS usuario, SENHA_USUARIO AS senha_usuario, TIPO_USUARIO AS tipo_usuario FROM USUARIOS WHERE EMAIL_USUARIO = ?',
      [dadosForm.user_usuario]
    );
    return results[0];
  },

  async create(dados) {
    const { NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, CPF_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, SENHA_USUARIO, TIPO_USUARIO } = dados;
    const [result] = await pool.query(
      'INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, CPF_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, SENHA_USUARIO, TIPO_USUARIO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, CPF_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, SENHA_USUARIO, TIPO_USUARIO]
    );
    return { ID_USUARIO: result.insertId, ...dados };
  },

  async findAll() {
    const [results] = await pool.query('SELECT * FROM USUARIOS');
    return results;
  },

  async findById(id) {
    const [results] = await pool.query('SELECT * FROM USUARIOS WHERE ID_USUARIO = ?', [id]);
    return results[0];
  },

  async update(id, dados) {
    const { NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, CPF_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, SENHA_USUARIO, TIPO_USUARIO } = dados;
    await pool.query(
      'UPDATE USUARIOS SET NOME_USUARIO = ?, EMAIL_USUARIO = ?, CELULAR_USUARIO = ?, CPF_USUARIO = ?, LOGRADOURO_USUARIO = ?, BAIRRO_USUARIO = ?, CIDADE_USUARIO = ?, UF_USUARIO = ?, CEP_USUARIO = ?, SENHA_USUARIO = ?, TIPO_USUARIO = ? WHERE ID_USUARIO = ?',
      [NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, CPF_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, SENHA_USUARIO, TIPO_USUARIO, id]
    );
    return await this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM USUARIOS WHERE ID_USUARIO = ?', [id]);
  },
};

module.exports = usuarioModel;