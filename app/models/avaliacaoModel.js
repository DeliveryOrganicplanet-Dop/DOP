const pool = require('../../config/pool_conexoes');

const avaliacaoModel = {
  async criarTabela() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS AVALIACOES_VENDEDORES (
        id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
        id_vendedor INT NOT NULL,
        id_usuario INT UNSIGNED NOT NULL,
        nota TINYINT NOT NULL CHECK (nota >= 1 AND nota <= 5),
        comentario TEXT,
        data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_vendedor) REFERENCES VENDEDORES(id_vendedores),
        FOREIGN KEY (id_usuario) REFERENCES USUARIOS(ID_USUARIO),
        UNIQUE KEY unique_avaliacao (id_vendedor, id_usuario)
      )
    `);
  },

  async criar(dados) {
    const { id_vendedor, id_usuario, nota, comentario } = dados;
    const [result] = await pool.query(
      'INSERT INTO AVALIACOES_VENDEDORES (id_vendedor, id_usuario, nota, comentario) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nota = VALUES(nota), comentario = VALUES(comentario)',
      [id_vendedor, id_usuario, nota, comentario]
    );
    return result;
  },

  async obterMediaVendedor(id_vendedor) {
    const [result] = await pool.query(
      'SELECT AVG(nota) as media, COUNT(*) as total FROM AVALIACOES_VENDEDORES WHERE id_vendedor = ?',
      [id_vendedor]
    );
    return {
      media: parseFloat(result[0].media || 0).toFixed(1),
      total: result[0].total
    };
  },

  async obterAvaliacoesVendedor(id_vendedor) {
    const [results] = await pool.query(`
      SELECT a.*, u.NOME_USUARIO as nome_cliente 
      FROM AVALIACOES_VENDEDORES a 
      JOIN USUARIOS u ON a.id_usuario = u.ID_USUARIO 
      WHERE a.id_vendedor = ? 
      ORDER BY a.data_avaliacao DESC
    `, [id_vendedor]);
    return results;
  }
};

module.exports = avaliacaoModel;