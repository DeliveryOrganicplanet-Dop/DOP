const pool = require('../../config/pool_conexoes');

const pedidoModel = {
  async create(pedidoData) {
    const { usuario_id, total, status, external_reference, payment_id } = pedidoData;
    
    const [result] = await pool.query(
      'INSERT INTO pedidos (usuario_id, total, status, external_reference, payment_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [usuario_id, total, status, external_reference, payment_id]
    );
    
    return result.insertId;
  },

  async updateStatus(pedidoId, status) {
    await pool.query(
      'UPDATE pedidos SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, pedidoId]
    );
  },

  async findByExternalReference(externalReference) {
    const [rows] = await pool.query(
      'SELECT * FROM pedidos WHERE external_reference = ?',
      [externalReference]
    );
    return rows[0];
  }
};

module.exports = pedidoModel;