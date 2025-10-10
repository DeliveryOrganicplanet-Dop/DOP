const pool = require('../../config/pool_conexoes');

const enderecoModel = {
  async create(dados) {
    const { id_usuario, logradouro, bairro, cidade, uf, cep } = dados;
    const [result] = await pool.query(
      'INSERT INTO ENDERECOS_USUARIO (id_usuario, nome_endereco, logradouro, bairro, cidade, uf, cep, is_principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id_usuario, 'Endereço Principal', logradouro, bairro, cidade, uf, cep, true]
    );
    return { id_endereco: result.insertId, ...dados };
  }
};

module.exports = enderecoModel;