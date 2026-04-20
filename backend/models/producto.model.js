import { pool } from "../config/database.js";

export const productoModel = {
  async findById(idProducto, db = pool) {
    const { rows } = await db.query(`SELECT * FROM producto WHERE idproducto = $1`, [idProducto]);
    return rows[0] ?? null;
  },

  async incrementVisitas(idProducto, db = pool) {
    await db.query(`UPDATE producto SET visitas = visitas + 1 WHERE idproducto = $1`, [
      idProducto
    ]);
  },

  async listByTienda(idTienda, { activo = true } = {}, db = pool) {
    const { rows } = await db.query(
      activo
        ? `SELECT * FROM producto WHERE idtienda = $1 AND activo = TRUE ORDER BY nombre ASC`
        : `SELECT * FROM producto WHERE idtienda = $1 ORDER BY nombre ASC`,
      [idTienda]
    );
    return rows;
  },

  async search({ q, idCategoria, limit, offset }, db = pool) {
    const parts = [`p.activo = TRUE`];
    const params = [];
    let n = 1;
    if (q) {
      params.push(`%${q}%`);
      parts.push(
        `(LOWER(p.nombre) LIKE LOWER($${n}) OR LOWER(COALESCE(p.descripcion, '')) LIKE LOWER($${n}))`
      );
      n++;
    }
    if (idCategoria) {
      params.push(idCategoria);
      parts.push(`p.idcategoria = $${n++}`);
    }
    params.push(limit, offset);
    const where = parts.join(" AND ");
    const lim = n;
    const off = n + 1;
    const { rows } = await db.query(
      `SELECT p.* FROM producto p WHERE ${where} ORDER BY p.idproducto DESC LIMIT $${lim} OFFSET $${off}`,
      params
    );
    const countParams = params.slice(0, -2);
    const { rows: c } = await db.query(
      `SELECT COUNT(*)::int AS n FROM producto p WHERE ${where}`,
      countParams
    );
    return { rows, total: c[0]?.n ?? 0 };
  },

  async create(
    { idTienda, idCategoria, nombre, descripcion, precio, stock, imagenPrincipal, activo = true },
    db = pool
  ) {
    const { rows } = await db.query(
      `INSERT INTO producto (idtienda, idcategoria, nombre, descripcion, precio, stock, imagenprincipal, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        idTienda,
        idCategoria ?? null,
        nombre,
        descripcion ?? null,
        precio,
        stock ?? 0,
        imagenPrincipal ?? null,
        activo
      ]
    );
    return rows[0];
  },

  async update(idProducto, data, db = pool) {
    const fields = [];
    const vals = [];
    let i = 1;
    const map = {
      idCategoria: "idcategoria",
      nombre: "nombre",
      descripcion: "descripcion",
      precio: "precio",
      stock: "stock",
      imagenPrincipal: "imagenprincipal",
      activo: "activo"
    };
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) {
        vals.push(data[k]);
        fields.push(`${col} = $${i++}`);
      }
    }
    if (!fields.length) return this.findById(idProducto, db);
    fields.push(`updatedat = CURRENT_TIMESTAMP`);
    vals.push(idProducto);
    const { rows } = await db.query(
      `UPDATE producto SET ${fields.join(", ")} WHERE idproducto = $${i} RETURNING *`,
      vals
    );
    return rows[0] ?? null;
  },

  async adjustStock(idProducto, delta, db = pool) {
    const { rows } = await db.query(
      `UPDATE producto SET stock = stock + $2, updatedat = CURRENT_TIMESTAMP
       WHERE idproducto = $1 AND stock + $2 >= 0
       RETURNING *`,
      [idProducto, delta]
    );
    return rows[0] ?? null;
  }
};
