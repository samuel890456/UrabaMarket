import { pool } from "../config/database.js";

export const pedidoModel = {
  async create({ idUsuario, idDireccionEnvio, total, estado = "Pendiente" }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO pedido (idusuario, iddireccionenvio, total, estado)
       VALUES ($1, $2, $3, $4::tipo_estado_pedido)
       RETURNING *`,
      [idUsuario, idDireccionEnvio, total, estado]
    );
    return rows[0];
  },

  async addDetalle({ idPedido, idProducto, idTienda, cantidad, precioUnitario }, db = pool) {
    await db.query(
      `INSERT INTO detallepedido (idpedido, idproducto, idtienda, cantidad, preciounitario)
       VALUES ($1, $2, $3, $4, $5)`,
      [idPedido, idProducto, idTienda, cantidad, precioUnitario]
    );
  },

  async findById(idPedido, db = pool) {
    const { rows } = await db.query(`SELECT * FROM pedido WHERE idpedido = $1`, [idPedido]);
    return rows[0] ?? null;
  },

  async listDetalle(idPedido, db = pool) {
    const { rows } = await db.query(`SELECT * FROM detallepedido WHERE idpedido = $1`, [idPedido]);
    return rows;
  },

  async listByUsuario(idUsuario, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM pedido WHERE idusuario = $1 ORDER BY fecha DESC`,
      [idUsuario]
    );
    return rows;
  },

  async listByTiendaVendedor(idTienda, db = pool) {
    const { rows } = await db.query(
      `SELECT DISTINCT p.*
       FROM pedido p
       INNER JOIN detallepedido d ON d.idpedido = p.idpedido
       WHERE d.idtienda = $1
       ORDER BY p.fecha DESC`,
      [idTienda]
    );
    return rows;
  },

  async updateEstado(idPedido, estado, db = pool) {
    const { rows } = await db.query(
      `UPDATE pedido SET estado = $1::tipo_estado_pedido WHERE idpedido = $2 RETURNING *`,
      [estado, idPedido]
    );
    return rows[0] ?? null;
  }
};
