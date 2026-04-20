import { pool } from "../config/database.js";

export const compraProveedorModel = {
  async create({ idTienda, idUsuarioProveedor, total, estado = "Pendiente" }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO compraproveedor (idtienda, idusuarioproveedor, total, estado)
       VALUES ($1, $2, $3, $4::tipo_estado_compra)
       RETURNING *`,
      [idTienda, idUsuarioProveedor, total, estado]
    );
    return rows[0];
  },

  async addDetalle({ idCompra, idProductoVinculado, nombreItem, cantidad, precioMayoreo }, db = pool) {
    await db.query(
      `INSERT INTO detallecompraproveedor (idcompra, idproductovinculado, nombreitem, cantidad, preciomayoreo)
       VALUES ($1, $2, $3, $4, $5)`,
      [idCompra, idProductoVinculado ?? null, nombreItem ?? null, cantidad, precioMayoreo]
    );
  },

  async findById(idCompra, db = pool) {
    const { rows } = await db.query(`SELECT * FROM compraproveedor WHERE idcompra = $1`, [idCompra]);
    return rows[0] ?? null;
  },

  async listDetalle(idCompra, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM detallecompraproveedor WHERE idcompra = $1`,
      [idCompra]
    );
    return rows;
  },

  async listByTienda(idTienda, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM compraproveedor WHERE idtienda = $1 ORDER BY fecha DESC`,
      [idTienda]
    );
    return rows;
  },

  async listByProveedor(idUsuarioProveedor, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM compraproveedor WHERE idusuarioproveedor = $1 ORDER BY fecha DESC`,
      [idUsuarioProveedor]
    );
    return rows;
  },

  async updateEstado(idCompra, estado, db = pool) {
    const { rows } = await db.query(
      `UPDATE compraproveedor SET estado = $1::tipo_estado_compra WHERE idcompra = $2 RETURNING *`,
      [estado, idCompra]
    );
    return rows[0] ?? null;
  }
};
