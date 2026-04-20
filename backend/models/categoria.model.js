import { pool } from "../config/database.js";

export const categoriaModel = {
  async findById(idCategoria, db = pool) {
    const { rows } = await db.query(`SELECT * FROM categoria WHERE idcategoria = $1`, [idCategoria]);
    return rows[0] ?? null;
  },

  async listActivas(db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM categoria WHERE activo = TRUE ORDER BY nombre ASC`
    );
    return rows;
  },

  async listAll({ limit, offset }, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM categoria ORDER BY idcategoria DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: c } = await db.query(`SELECT COUNT(*)::int AS n FROM categoria`);
    return { rows, total: c[0]?.n ?? 0 };
  },

  async create({ nombre, descripcion, activo = true }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO categoria (nombre, descripcion, activo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion ?? null, activo]
    );
    return rows[0];
  },

  async update(idCategoria, data, db = pool) {
    const fields = [];
    const vals = [];
    let i = 1;
    if (data.nombre != null) {
      vals.push(data.nombre);
      fields.push(`nombre = $${i++}`);
    }
    if (data.descripcion !== undefined) {
      vals.push(data.descripcion);
      fields.push(`descripcion = $${i++}`);
    }
    if (data.activo != null) {
      vals.push(data.activo);
      fields.push(`activo = $${i++}`);
    }
    if (!fields.length) return this.findById(idCategoria, db);
    fields.push(`updatedat = CURRENT_TIMESTAMP`);
    vals.push(idCategoria);
    const { rows } = await db.query(
      `UPDATE categoria SET ${fields.join(", ")} WHERE idcategoria = $${i} RETURNING *`,
      vals
    );
    return rows[0] ?? null;
  }
};
