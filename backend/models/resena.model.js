import { pool } from "../config/database.js";

/** Tabla reseña (PostgreSQL: identificadores en minúsculas). */
export const resenaModel = {
  async create({ idUsuario, idProducto, puntuacion, comentario }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO reseña (idusuario, idproducto, puntuacion, comentario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [idUsuario, idProducto, puntuacion, comentario ?? null]
    );
    return rows[0];
  },

  async listByProducto(idProducto, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM reseña WHERE idproducto = $1 ORDER BY createdat DESC`,
      [idProducto]
    );
    return rows;
  },

  async findByUsuarioProducto(idUsuario, idProducto, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM reseña WHERE idusuario = $1 AND idproducto = $2 LIMIT 1`,
      [idUsuario, idProducto]
    );
    return rows[0] ?? null;
  }
};
