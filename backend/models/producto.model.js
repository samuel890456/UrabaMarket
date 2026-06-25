import { pool } from "../config/database.js";

let productoColumnsCache = null;

async function getProductoColumns(db = pool) {
  if (productoColumnsCache) return productoColumnsCache;
  const { rows } = await db.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = 'producto'`
  );
  productoColumnsCache = new Set(rows.map((row) => row.column_name));
  return productoColumnsCache;
}

async function getPrecioColumn(db = pool) {
  const columns = await getProductoColumns(db);
  if (columns.has("precio")) return "precio";
  if (columns.has("precioventa")) return "precioventa";
  return "precio";
}

export const productoModel = {
  async findById(idProducto, db = pool) {
    const { rows } = await db.query(`SELECT * FROM producto WHERE idproducto = $1`, [idProducto]);
    return rows[0] ?? null;
  },

  async findByIdForUpdate(idProducto, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM producto WHERE idproducto = $1 FOR UPDATE`,
      [idProducto]
    );
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

  async search({ q, idCategoria, idTienda, idProveedor, marca, minPrecio, maxPrecio, sortBy = 'idProducto', sortOrder = 'DESC', limit, offset }, db = pool) {
    const precioColumn = await getPrecioColumn(db);
    const parts = [`p.activo = TRUE`];
    const params = [];
    let n = 1;

    // Existing filters
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
    if (idTienda) {
      params.push(idTienda);
      parts.push(`p.idtienda = $${n++}`);
    }
    if (idProveedor) {
      params.push(idProveedor);
      parts.push(`p.idproveedor = $${n++}`);
    }

    // New filters
    if (marca) {
      params.push(`%${marca}%`);
      parts.push(`LOWER(p.marca) LIKE LOWER($${n++})`);
    }
    if (minPrecio !== undefined && minPrecio !== null) { // Check for null as well
      params.push(minPrecio);
      parts.push(`p.${precioColumn} >= $${n++}`);
    }
    if (maxPrecio !== undefined && maxPrecio !== null) { // Check for null as well
      params.push(maxPrecio);
      parts.push(`p.${precioColumn} <= $${n++}`);
    }

    const where = parts.join(" AND ");

    // Build ORDER BY clause
    let orderByClause = 'p.idproducto'; // Default sort by ID
    if (sortBy === 'precio') {
        orderByClause = `p.${precioColumn}`;
    } else if (sortBy === 'popularidad' || sortBy === 'vendidos') {
        orderByClause = 'p.vendidostotales';
    } else if (sortBy === 'masRecientes' || sortBy === 'createdAt') {
        orderByClause = 'p.createdat';
    }
    // Ensure sortOrder is 'ASC' or 'DESC'
    const finalSortOrder = (sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';


    params.push(limit, offset);
    const lim = n;
    const off = n + 1;

    const { rows } = await db.query(
      `SELECT p.*, t.nombre AS nombre_tienda
       FROM producto p
       LEFT JOIN tienda t ON t.idtienda = p.idtienda
       WHERE ${where}
       ORDER BY ${orderByClause} ${finalSortOrder}
       LIMIT $${lim} OFFSET $${off}`,
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
    { idTienda, idCategoria, nombre, descripcion, precio, precioCosto, stock, imagenPrincipal, activo = true,
      marca, iva, fechaVencimiento, idProveedor, idProductoMayorista, stockMinimo, vendidosTotales = 0,
      promociones, descuento },
    db = pool
  ) {
    const precioColumn = await getPrecioColumn(db);
    const { rows } = await db.query(
      `INSERT INTO producto (idtienda, idcategoria, nombre, descripcion, ${precioColumn}, precioCosto, stock, imagenprincipal, activo,
        marca, iva, fechaVencimiento, idProveedor, idProductoMayorista, stockMinimo, vendidosTotales, promociones, descuento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        idTienda,
        idCategoria ?? null,
        nombre,
        descripcion ?? null,
        precio,
        precioCosto ?? null,
        stock ?? 0,
        imagenPrincipal ?? null,
        activo,
        marca ?? null,
        iva ?? null,
        fechaVencimiento ?? null,
        idProveedor ?? null,
        idProductoMayorista ?? null,
        stockMinimo ?? 0,
        vendidosTotales,
        promociones ?? null,
        descuento ?? null
      ]
    );
    return rows[0];
  },

  async update(idProducto, data, db = pool) {
    const precioColumn = await getPrecioColumn(db);
    const fields = [];
    const vals = [];
    let i = 1;
    const map = {
      idCategoria: "idcategoria",
      nombre: "nombre",
      descripcion: "descripcion",
      precio: precioColumn,
      precioCosto: "precioCosto",
      stock: "stock",
      imagenPrincipal: "imagenprincipal",
      activo: "activo",
      marca: "marca",
      iva: "iva",
      fechaVencimiento: "fechaVencimiento",
      idProveedor: "idProveedor",
      idProductoMayorista: "idProductoMayorista",
      stockMinimo: "stockMinimo",
      vendidosTotales: "vendidosTotales",
      promociones: "promociones",
      descuento: "descuento"
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
       RETURNING *, stock - $2 AS stock_anterior`,
      [idProducto, delta]
    );
    return rows[0] ?? null;
  },

  async findByWholesaleProductAndTienda(idProductoMayorista, idTienda, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM producto
       WHERE idproductomayorista = $1 AND idtienda = $2
       ORDER BY idproducto ASC
       LIMIT 1`,
      [idProductoMayorista, idTienda]
    );
    return rows[0] ?? null;
  },

  async listLowStockProducts(idTienda, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM producto WHERE idtienda = $1 AND stock <= stockMinimo AND activo = TRUE ORDER BY nombre ASC`,
      [idTienda]
    );
    return rows;
  },

  async listExpiredProducts(idTienda, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM producto WHERE idtienda = $1 AND fechaVencimiento IS NOT NULL AND fechaVencimiento < CURRENT_DATE ORDER BY fechaVencimiento ASC`,
      [idTienda]
    );
    return rows;
  },

  async listSoonToExpireProducts(idTienda, days = 30, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM producto WHERE idtienda = $1 AND fechaVencimiento IS NOT NULL AND fechaVencimiento >= CURRENT_DATE AND fechaVencimiento <= CURRENT_DATE + INTERVAL '${days} days' ORDER BY fechaVencimiento ASC`,
      [idTienda]
    );
    return rows;
  }
};
