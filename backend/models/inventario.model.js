import { pool } from "../config/database.js";

export const inventarioModel = {
  async addMovimiento(
    { idProducto, idTienda, tipo, cantidad, stockAnterior, stockNuevo, referenciaTipo, referenciaId, costoUnitario, nota },
    db = pool
  ) {
    const { rows } = await db.query(
      `INSERT INTO movimientoinventario
        (idproducto, idtienda, tipo, cantidad, stockanterior, stocknuevo, referenciatipo, referenciaid, costounitario, nota)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        idProducto,
        idTienda,
        tipo,
        cantidad,
        stockAnterior,
        stockNuevo,
        referenciaTipo ?? null,
        referenciaId ?? null,
        costoUnitario ?? null,
        nota ?? null
      ]
    );
    return rows[0];
  },

  async listByTienda(idTienda, { limit = 100, offset = 0 } = {}, db = pool) {
    const { rows } = await db.query(
      `SELECT mi.*, p.nombre AS nombre_producto
       FROM movimientoinventario mi
       INNER JOIN producto p ON p.idproducto = mi.idproducto
       WHERE mi.idtienda = $1
       ORDER BY mi.createdat DESC
       LIMIT $2 OFFSET $3`,
      [idTienda, limit, offset]
    );
    return rows;
  }
};
