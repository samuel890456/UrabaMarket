import { pool } from "../config/database.js";

export const carritoModel = {
  async findActivoByUsuario(idUsuario, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM carrito
       WHERE idusuario = $1 AND estado = 'Activo'::tipo_estado_carrito
       ORDER BY idcarrito DESC LIMIT 1`,
      [idUsuario]
    );
    return rows[0] ?? null;
  },

  async findActivoByUsuarioForUpdate(idUsuario, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM carrito
       WHERE idusuario = $1 AND estado = 'Activo'::tipo_estado_carrito
       ORDER BY idcarrito DESC LIMIT 1
       FOR UPDATE`,
      [idUsuario]
    );
    return rows[0] ?? null;
  },

  async createActivo(idUsuario, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO carrito (idusuario, estado)
       VALUES ($1, 'Activo'::tipo_estado_carrito)
       RETURNING *`,
      [idUsuario]
    );
    return rows[0];
  },

  async findById(idCarrito, db = pool) {
    const { rows } = await db.query(`SELECT * FROM carrito WHERE idcarrito = $1`, [idCarrito]);
    return rows[0] ?? null;
  },

  async updateEstado(idCarrito, estado, db = pool) {
    await db.query(
      `UPDATE carrito SET estado = $1::tipo_estado_carrito, updatedat = CURRENT_TIMESTAMP
       WHERE idcarrito = $2`,
      [estado, idCarrito]
    );
  },

  async listItems(idCarrito, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM itemcarrito WHERE idcarrito = $1 ORDER BY iditem ASC`,
      [idCarrito]
    );
    return rows;
  },

  async listItemsForUpdate(idCarrito, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM itemcarrito WHERE idcarrito = $1 ORDER BY iditem ASC FOR UPDATE`,
      [idCarrito]
    );
    return rows;
  },

  async findItem(idCarrito, idProducto, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM itemcarrito WHERE idcarrito = $1 AND idproducto = $2`,
      [idCarrito, idProducto]
    );
    return rows[0] ?? null;
  },

  async updateItemPrice(idCarrito, idProducto, precioFijado, db = pool) {
    await db.query(
      `UPDATE itemcarrito SET preciofijado = $3 WHERE idcarrito = $1 AND idproducto = $2`,
      [idCarrito, idProducto, precioFijado]
    );
  },

  async upsertItem({ idCarrito, idProducto, cantidad, precioFijado, sumarCantidad }, db = pool) {
    if (sumarCantidad) {
      await db.query(
        `INSERT INTO itemcarrito (idcarrito, idproducto, cantidad, preciofijado)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (idcarrito, idproducto) DO UPDATE SET
           cantidad = itemcarrito.cantidad + EXCLUDED.cantidad,
           preciofijado = EXCLUDED.preciofijado`,
        [idCarrito, idProducto, cantidad, precioFijado]
      );
      return;
    }
    await db.query(
      `INSERT INTO itemcarrito (idcarrito, idproducto, cantidad, preciofijado)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (idcarrito, idproducto) DO UPDATE SET
         cantidad = EXCLUDED.cantidad,
         preciofijado = EXCLUDED.preciofijado`,
      [idCarrito, idProducto, cantidad, precioFijado]
    );
  },

  async deleteItem(idCarrito, idProducto, db = pool) {
    await db.query(`DELETE FROM itemcarrito WHERE idcarrito = $1 AND idproducto = $2`, [
      idCarrito,
      idProducto
    ]);
  },

  async clearItems(idCarrito, db = pool) {
    await db.query(`DELETE FROM itemcarrito WHERE idcarrito = $1`, [idCarrito]);
  }
};
