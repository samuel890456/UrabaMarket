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

  async listPublic({ limit, offset, idCategoria = null, q = null }, db = pool) {
    const params = [];
    let n = 1;
    let where = `WHERE activo = TRUE`;
    if (idCategoria) {
      params.push(idCategoria);
      where += ` AND idcategoria = $${n++}`;
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      where += ` AND (LOWER(nombre) LIKE $${n} OR LOWER(COALESCE(descripcion, '')) LIKE $${n} OR LOWER(COALESCE(direccion, '')) LIKE $${n})`;
      n += 1;
    }
    params.push(limit, offset);
    const lim = n;
    const off = n + 1;
    const { rows } = await db.query(
      `SELECT * FROM tienda ${where} ORDER BY idtienda DESC LIMIT $${lim} OFFSET $${off}`,
      params
    );
    const countParams = [];
    let countWhere = `WHERE activo = TRUE`;
    let countN = 1;
    if (idCategoria) {
      countParams.push(idCategoria);
      countWhere += ` AND idcategoria = $${countN++}`;
    }
    if (q) {
      countParams.push(`%${q.toLowerCase()}%`);
      countWhere += ` AND (LOWER(nombre) LIKE $${countN} OR LOWER(COALESCE(descripcion, '')) LIKE $${countN} OR LOWER(COALESCE(direccion, '')) LIKE $${countN})`;
    }
    const { rows: c } = await db.query(
      `SELECT COUNT(*)::int AS n FROM tienda ${countWhere}`,
      countParams
    );
    return { rows, total: c[0]?.n ?? 0 };
  },

  async create({ idUsuario, idCategoria, nombre, descripcion, direccion, logoUrl, bannerUrl, activo = true }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO tienda (idusuario, idcategoria, nombre, descripcion, direccion, logourl, bannerurl, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [idUsuario, idCategoria ?? null, nombre, descripcion ?? null, direccion ?? null, logoUrl ?? null, bannerUrl ?? null, activo]
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
    if (data.logoUrl !== undefined) {
      vals.push(data.logoUrl);
      fields.push(`logourl = $${i++}`);
    }
    if (data.bannerUrl !== undefined) {
      vals.push(data.bannerUrl);
      fields.push(`bannerurl = $${i++}`);
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
