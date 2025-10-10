const pool = require('../../config/pool_conexoes');

const usuarioModel = {
  async findUserEmail(dadosForm) {
    const [results] = await pool.query(
      'SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?',
      [dadosForm.email_usuario]
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

  async findByEmail(email) {
    const [results] = await pool.query(
      'SELECT * FROM USUARIOS WHERE EMAIL_USUARIO = ?',
      [email]
    );
    return results[0];
  },

  async createGoogleUser(dados) {
    try {
      const { nome_usuario, email_usuario } = dados;
      const [result] = await pool.query(
        'INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, CPF_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, SENHA_USUARIO, TIPO_USUARIO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nome_usuario, email_usuario, '00000000000', `google${Date.now()}`, 'Google Login', 'Centro', 'São Paulo', 'SP', '00000000', 'google_auth', 'C']
      );
      
      // Criar registro na tabela CLIENTES
      await pool.query(
        'INSERT IGNORE INTO CLIENTES (id_usuario, cpf_cliente) VALUES (?, ?)',
        [result.insertId, `google_${result.insertId}_${Date.now()}`]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Erro ao criar usuário Google:', error);
      throw error;
    }
  },

  async updatePhoto(id, fotoPath) {
    console.log('Salvando foto:', { id, fotoPath });
    const result = await pool.query(
      'UPDATE USUARIOS SET FOTO_USUARIO = ? WHERE ID_USUARIO = ?',
      [fotoPath, id]
    );
    return result;
  },

  async removePhoto(id) {
    await pool.query(
      'UPDATE USUARIOS SET FOTO_USUARIO = NULL WHERE ID_USUARIO = ?',
      [id]
    );
  },

  async updateProfile(id, dados) {
    const { NOME_USUARIO, EMAIL_USUARIO } = dados;
    await pool.query(
      'UPDATE USUARIOS SET NOME_USUARIO = ?, EMAIL_USUARIO = ? WHERE ID_USUARIO = ?',
      [NOME_USUARIO, EMAIL_USUARIO, id]
    );
    return await this.findById(id);
  },

  async updatePassword(id, hashedPassword) {
    await pool.query(
      'UPDATE USUARIOS SET SENHA_USUARIO = ? WHERE ID_USUARIO = ?',
      [hashedPassword, id]
    );
  },

  async getUserStats(userId) {
    try {
      // Buscar cliente_id do usuário
      let [clienteResult] = await pool.query(
        'SELECT id_cliente FROM CLIENTES WHERE id_usuario = ?',
        [userId]
      );
      
      // Se não existe registro de cliente, criar um
      if (!clienteResult.length) {
        const userData = await this.findById(userId);
        const cpfCliente = userData?.CPF_USUARIO || `temp_${userId}_${Date.now()}`;
        
        await pool.query(
          'INSERT IGNORE INTO CLIENTES (id_usuario, cpf_cliente) VALUES (?, ?)',
          [userId, cpfCliente]
        );
        
        [clienteResult] = await pool.query(
          'SELECT id_cliente FROM CLIENTES WHERE id_usuario = ?',
          [userId]
        );
      }
      
      const clienteId = clienteResult[0].id_cliente;
      
      // Contar pedidos realizados (apenas confirmados)
      const [pedidosCount] = await pool.query(
        'SELECT COUNT(*) as total FROM PEDIDOS WHERE id_cliente = ? AND status_pedido IN ("confirmado", "entregue")',
        [clienteId]
      );
      
      // Calcular total gasto (apenas pedidos confirmados)
      const [totalGasto] = await pool.query(
        'SELECT COALESCE(SUM(valor_total), 0) as total FROM PEDIDOS WHERE id_cliente = ? AND status_pedido IN ("confirmado", "entregue")',
        [clienteId]
      );
      
      // Calcular dias como cliente
      const [diasCliente] = await pool.query(
        'SELECT COALESCE(DATEDIFF(NOW(), DATA_CRIACAO), 0) as dias FROM USUARIOS WHERE ID_USUARIO = ?',
        [userId]
      );
      
      return {
        pedidosRealizados: pedidosCount[0].total,
        totalGasto: parseFloat(totalGasto[0].total) || 0,
        diasComoCliente: Math.max(diasCliente[0].dias || 0, 0)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { pedidosRealizados: 0, totalGasto: 0, diasComoCliente: 0 };
    }
  }
};

module.exports = usuarioModel;