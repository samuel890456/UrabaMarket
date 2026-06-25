import { pool } from "../config/database.js";

export const productoMayoristaModel = {
  async findById(idProductoMayorista, db = pool) {
    const { rows } = await db.query(`SELECT * FROM productomayorista WHERE idproductomayorista = $1`, [idProductoMayorista]);
    return rows[0] ?? null;
  },

  async findByIdForUpdate(idProductoMayorista, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM productomayorista WHERE idproductomayorista = $1 FOR UPDATE`,
      [idProductoMayorista]
    );
    return rows[0] ?? null;
  },

  async listByProveedor(idProveedor, { activo = true } = {}, db = pool) {
    const { rows } = await db.query(
      activo
        ? `SELECT * FROM productomayorista WHERE idproveedor = $1 AND activo = TRUE ORDER BY nombre ASC`
        : `SELECT * FROM productomayorista WHERE idproveedor = $1 ORDER BY nombre ASC`,
      [idProveedor]
    );
    return rows;
  },

  async search({ q, idCategoria, idProveedor, limit, offset, sortBy = 'nombre', sortOrder = 'ASC' }, db = pool) {
    const parts = [`activo = TRUE`];
    const params = [];
    let n = 1;

    if (q) {
      params.push(`%${q}%`);
      parts.push(`(LOWER(nombre) LIKE LOWER($${n}) OR LOWER(COALESCE(descripcion, '')) LIKE LOWER($${n}))`);
      n++;
    }
    if (idCategoria) {
      params.push(idCategoria);
      parts.push(`idcategoria = $${n++}`);
    }
    if (idProveedor) {
      params.push(idProveedor);
      parts.push(`idproveedor = $${n++}`);
    }

    const where = parts.join(" AND ");

    let orderByClause = 'nombre';
    if (sortBy === 'precioMayorista') {
        orderByClause = 'preciomayorista';
    } else if (sortBy === 'createdAt') {
        orderByClause = 'createdat';
    }
    const finalSortOrder = (sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    params.push(limit, offset);
    const lim = n;
    const off = n + 1;

    const { rows } = await db.query(
      `SELECT * FROM productomayorista WHERE ${where} ORDER BY ${orderByClause} ${finalSortOrder} LIMIT $${lim} OFFSET $${off}`,
      params
    );
    const countParams = params.slice(0, -2);
    const { rows: c } = await db.query(
      `SELECT COUNT(*)::int AS n FROM productomayorista WHERE ${where}`,
      countParams
    );
    return { rows, total: c[0]?.n ?? 0 };
  },

  async create(
    {
      idProveedor,
      idCategoria,
      nombre,
      descripcion,
      precioMayorista,
      stockMayorista,
      marca,
      ivaMayorista,
      fechaVencimiento,
      imagenPrincipal,
      tipoProducto,
      lote,
      fechaFabricacion,
      garantiaMeses,
      vidaUtilMeses,
      modelo,
      compatibilidad,
      numeroSerie,
      activo = true
    },
    db = pool
  ) {
    const fullColumns = [
      ["idproveedor", idProveedor],
      ["idcategoria", idCategoria ?? null],
      ["nombre", nombre],
      ["descripcion", descripcion ?? null],
      ["preciomayorista", precioMayorista],
      ["stockmayorista", stockMayorista ?? 0],
      ["marca", marca ?? null],
      ["ivamayorista", ivaMayorista ?? null],
      ["fechavencimiento", fechaVencimiento ?? null],
      ["imagenprincipal", imagenPrincipal ?? null],
      ["tipoproducto", tipoProducto ?? "General"],
      ["lote", lote ?? null],
      ["fechafabricacion", fechaFabricacion ?? null],
      ["garantiameses", garantiaMeses ?? null],
      ["vidautilmeses", vidaUtilMeses ?? null],
      ["modelo", modelo ?? null],
      ["compatibilidad", compatibilidad ?? null],
      ["numeroserie", numeroSerie ?? null],
      ["activo", activo]
    ];

    async function insert(columns) {
      const names = columns.map(([col]) => col);
      const values = columns.map(([, value]) => value);
      const placeholders = values.map((_, index) => `$${index + 1}`);
      const { rows } = await db.query(
        `INSERT INTO productomayorista (${names.join(", ")})
         VALUES (${placeholders.join(", ")})
         RETURNING *`,
        values
      );
      return rows[0];
    }

    try {
      return await insert(fullColumns);
    } catch (error) {
      if (error.code !== "42703") throw error;
      const legacyColumns = fullColumns.filter(([col]) =>
        [
          "idproveedor",
          "idcategoria",
          "nombre",
          "descripcion",
          "preciomayorista",
          "stockmayorista",
          "marca",
          "ivamayorista",
          "fechavencimiento",
          "activo"
        ].includes(col)
      );
      return insert(legacyColumns);
    }
  },

  async update(idProductoMayorista, data, db = pool) {
    const fields = [];
    const vals = [];
    let i = 1;
    const map = {
      idCategoria: "idcategoria",
      nombre: "nombre",
      descripcion: "descripcion",
      precioMayorista: "preciomayorista",
      stockMayorista: "stockmayorista",
      marca: "marca",
      ivaMayorista: "ivamayorista",
      fechaVencimiento: "fechavencimiento",
      imagenPrincipal: "imagenprincipal",
      tipoProducto: "tipoproducto",
      lote: "lote",
      fechaFabricacion: "fechafabricacion",
      garantiaMeses: "garantiameses",
      vidaUtilMeses: "vidautilmeses",
      modelo: "modelo",
      compatibilidad: "compatibilidad",
      numeroSerie: "numeroserie",
      activo: "activo"
    };
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) {
        vals.push(data[k]);
        fields.push(`${col} = $${i++}`);
      }
    }
    if (!fields.length) return this.findById(idProductoMayorista, db);
    fields.push(`updatedat = CURRENT_TIMESTAMP`);
    vals.push(idProductoMayorista);

    async function runUpdate(updateFields, updateVals, idParamIndex) {
      const { rows } = await db.query(
        `UPDATE productomayorista SET ${updateFields.join(", ")} WHERE idproductomayorista = $${idParamIndex} RETURNING *`,
        updateVals
      );
      return rows[0] ?? null;
    }

    try {
      return await runUpdate(fields, vals, i);
    } catch (error) {
      if (error.code !== "42703") throw error;
      const legacyCols = new Set([
        "idcategoria",
        "nombre",
        "descripcion",
        "preciomayorista",
        "stockmayorista",
        "marca",
        "ivamayorista",
        "fechavencimiento",
        "activo"
      ]);
      const legacyEntries = Object.entries(map).filter(([key, col]) => data[key] !== undefined && legacyCols.has(col));
      const legacyVals = [];
      const legacyFields = [];
      let param = 1;
      for (const [key, col] of legacyEntries) {
        legacyVals.push(data[key]);
        legacyFields.push(`${col} = $${param++}`);
      }
      if (!legacyFields.length) return this.findById(idProductoMayorista, db);
      legacyFields.push(`updatedat = CURRENT_TIMESTAMP`);
      legacyVals.push(idProductoMayorista);
      return runUpdate(legacyFields, legacyVals, param);
    }
  },

  async adjustStockMayorista(idProductoMayorista, delta, db = pool) {
    const { rows } = await db.query(
      `UPDATE productomayorista SET stockmayorista = stockmayorista + $2, updatedat = CURRENT_TIMESTAMP
       WHERE idproductomayorista = $1 AND stockmayorista + $2 >= 0
       RETURNING *`,
      [idProductoMayorista, delta]
    );
    return rows[0] ?? null;
  }
};
