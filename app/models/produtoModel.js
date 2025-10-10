const pool = require('../../config/pool_conexoes');

const produtoModel = {
  async create(dados) {
    const { nome_prod, valor_unitario, qtde_estoque, id_categoria, id_imagem, id_vendedor } = dados;
    
    const [result] = await pool.query(
      'INSERT INTO PRODUTOS (nome_prod, valor_unitario, qtde_estoque, id_categoria, id_imagem, id_vendedor, ativo) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [nome_prod, valor_unitario, qtde_estoque || 999, id_categoria, id_imagem, id_vendedor]
    );
    return { id_prod: result.insertId, ...dados };
  },

  async findAll() {
    const [results] = await pool.query(`
      SELECT p.*, i.nome_imagem, u.NOME_USUARIO as nome_vendedor 
      FROM PRODUTOS p 
      LEFT JOIN IMAGENS i ON p.id_imagem = i.id_imagem 
      LEFT JOIN VENDEDORES v ON p.id_vendedor = v.id_vendedores
      LEFT JOIN USUARIOS u ON v.id_usuario = u.ID_USUARIO
      WHERE p.ativo = TRUE
    `);
    return results;
  },

  async findByVendedor(id_vendedor) {
    const [results] = await pool.query(`
      SELECT p.*, i.nome_imagem 
      FROM PRODUTOS p 
      LEFT JOIN IMAGENS i ON p.id_imagem = i.id_imagem 
      WHERE p.ativo = TRUE AND p.id_vendedor = ?
    `, [id_vendedor]);
    return results;
  },

  async findById(id) {
    const [results] = await pool.query('SELECT * FROM PRODUTOS WHERE id_prod = ?', [id]);
    return results[0];
  },

  async findByIdWithCategory(id) {
    const [results] = await pool.query(`
      SELECT p.*, i.nome_imagem, c.nome_categoria, 
             u.NOME_USUARIO as nome_vendedor, u.EMAIL_USUARIO as email_vendedor,
             u.CELULAR_USUARIO as celular_vendedor, u.CIDADE_USUARIO as cidade_vendedor,
             u.UF_USUARIO as uf_vendedor
      FROM PRODUTOS p 
      LEFT JOIN IMAGENS i ON p.id_imagem = i.id_imagem 
      LEFT JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria 
      LEFT JOIN VENDEDORES v ON p.id_vendedor = v.id_vendedores
      LEFT JOIN USUARIOS u ON v.id_usuario = u.ID_USUARIO
      WHERE p.id_prod = ? AND p.ativo = TRUE
    `, [id]);
    
    if (results[0] && results[0].id_vendedor) {
      // Buscar avaliações do vendedor
      const [avaliacoes] = await pool.query(`
        SELECT AVG(nota) as media, COUNT(*) as total
        FROM AVALIACOES_VENDEDORES 
        WHERE id_vendedor = ?
      `, [results[0].id_vendedor]);
      
      results[0].media_avaliacao_vendedor = avaliacoes[0].media || 0;
      results[0].total_avaliacoes_vendedor = avaliacoes[0].total || 0;
      
      // Buscar avaliações do produto
      const avaliacaoProdutoModel = require('./avaliacaoProdutoModel');
      const avaliacao = await avaliacaoProdutoModel.obterMediaProduto(id);
      results[0].media_avaliacao = avaliacao.media;
      results[0].total_avaliacoes = avaliacao.total;
    }
    
    return results[0];
  },

  async update(id, dados) {
    const { nome_prod, valor_unitario, qtde_estoque, id_categoria, id_imagem } = dados;
    await pool.query(
      'UPDATE PRODUTOS SET nome_prod = ?, valor_unitario = ?, qtde_estoque = ?, id_categoria = ?, id_imagem = ? WHERE id_prod = ?',
      [nome_prod, valor_unitario, qtde_estoque, id_categoria, id_imagem, id]
    );
    return await this.findById(id);
  },

  async delete(id) {
    await pool.query('UPDATE PRODUTOS SET ativo = FALSE WHERE id_prod = ?', [id]);
  },

  async search(termo) {
    const [results] = await pool.query(`
      SELECT p.*, i.nome_imagem, c.nome_categoria 
      FROM PRODUTOS p 
      LEFT JOIN IMAGENS i ON p.id_imagem = i.id_imagem 
      LEFT JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria 
      WHERE p.ativo = TRUE AND (
        p.nome_prod LIKE ? OR 
        c.nome_categoria LIKE ?
      )
      ORDER BY p.nome_prod
    `, [`%${termo}%`, `%${termo}%`]);
    return results;
  },
};

module.exports = produtoModel;