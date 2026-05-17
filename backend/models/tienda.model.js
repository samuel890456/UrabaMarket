import { pool } from "../config/database.js";

export const tiendaModel = {
  async findById(idTienda, db = pool) {
    const { rows } = await db.query(`SELECT * FROM tienda WHERE idtienda = $1`, [idTienda]);
    return rows[0] ?? null;
  },

  async findByUsuario(idUsuario, db = pool) {
    const { rows } = await db.query(`SELECT * FROM tienda WHERE idusuario = $1`, [idUsuario]);
    return rows[0] ?? null;
  },

  async listPublic({ limit, offset, idCategoria = null }, db = pool) {
    const params = [];
    let n = 1;
    let where = `WHERE activo = TRUE`;
    if (idCategoria) {
      params.push(idCategoria);
      where += ` AND idcategoria = $${n++}`;
    }
    params.push(limit, offset);
    const lim = n;
    const off = n + 1;
    const { rows } = await db.query(
      `SELECT * FROM tienda ${where} ORDER BY idtienda DESC LIMIT $${lim} OFFSET $${off}`,
      params
    );
    const countParams = idCategoria ? [idCategoria] : [];
    const { rows: c } = await db.query(
      `SELECT COUNT(*)::int AS n FROM tienda WHERE activo = TRUE${idCategoria ? " AND idcategoria = $1" : ""}`,
      countParams
    );
    return { rows, total: c[0]?.n ?? 0 };
  },

  async create({ idUsuario, idCategoria, nombre, descripcion, direccion, activo = true }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO tienda (idusuario, idcategoria, nombre, descripcion, direccion, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [idUsuario, idCategoria ?? null, nombre, descripcion ?? null, direccion ?? null, activo]
    );
    return rows[0];
  },

  async update(idTienda, data, db = pool) {
    const fields = [];
    const vals = [];
    let i = 1;
    if (data.idCategoria !== undefined) {
      vals.push(data.idCategoria);
      fields.push(`idcategoria = $${i++}`);
    }
    if (data.nombre != null) {
      vals.push(data.nombre);
      fields.push(`nombre = $${i++}`);
    }
    if (data.descripcion !== undefined) {
      vals.push(data.descripcion);
      fields.push(`descripcion = $${i++}`);
    }
    if (data.direccion !== undefined) { // New field
      vals.push(data.direccion);
      fields.push(`direccion = $${i++}`);
    }
    if (data.activo != null) {
      vals.push(data.activo);
      fields.push(`activo = $${i++}`);
    }
    if (!fields.length) return this.findById(idTienda, db);
    fields.push(`updatedat = CURRENT_TIMESTAMP`);
    vals.push(idTienda);
    const { rows } = await db.query(
      `UPDATE tienda SET ${fields.join(", ")} WHERE idtienda = $${i} RETURNING *`,
      vals
    );
    return rows[0] ?? null;
  }
};
