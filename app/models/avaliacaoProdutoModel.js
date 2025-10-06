const pool = require('../../config/pool_conexoes');

const avaliacaoProdutoModel = {
  async criar(dados) {
    const { id_usuario, id_produto, nota, comentario } = dados;
    const [result] = await pool.query(
      'INSERT INTO AVALIACOES_PRODUTOS (id_usuario, id_produto, nota, comentario) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nota = VALUES(nota), comentario = VALUES(comentario)',
      [id_usuario, id_produto, nota, comentario]
    );
    return result;
  },

  async obterMediaProduto(id_produto) {
    const [result] = await pool.query(
      'SELECT AVG(nota) as media, COUNT(*) as total FROM AVALIACOES_PRODUTOS WHERE id_produto = ?',
      [id_produto]
    );
    return {
      media: parseFloat(result[0].media || 0).toFixed(1),
      total: result[0].total
    };
  },

  async obterAvaliacoesProduto(id_produto) {
    const [results] = await pool.query(`
      SELECT a.*, u.NOME_USUARIO as nome_usuario 
      FROM AVALIACOES_PRODUTOS a 
      JOIN USUARIOS u ON a.id_usuario = u.ID_USUARIO 
      WHERE a.id_produto = ? 
      ORDER BY a.data_avaliacao DESC
    `, [id_produto]);
    return results;
  }
};

module.exports = avaliacaoProdutoModel;