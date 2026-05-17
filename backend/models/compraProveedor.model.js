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

  // Modified addDetalle to use idProductoMayorista
  async addDetalle({ idCompra, idProductoMayorista, cantidad, precioMayoreo }, db = pool) {
    await db.query(
      `INSERT INTO detallecompraproveedor (idcompra, idproductomayorista, cantidad, preciomayoreo)
       VALUES ($1, $2, $3, $4)`,
      [idCompra, idProductoMayorista, cantidad, precioMayoreo]
    );
  },

  async findById(idCompra, db = pool) {
    const { rows } = await db.query(`SELECT * FROM compraproveedor WHERE idcompra = $1`, [idCompra]);
    return rows[0] ?? null;
  },

  async listDetalle(idCompra, db = pool) {
    const { rows } = await db.query(
      `SELECT
          dcp.*,
          pm.nombre AS nombre_producto_mayorista,
          pm.marca,
          pm.imagenprincipal,
          pm.idcategoria,
          pm.idproveedor
       FROM detallecompraproveedor dcp
       INNER JOIN productomayorista pm ON dcp.idproductomayorista = pm.idproductomayorista
       WHERE dcp.idcompra = $1
       ORDER BY dcp.iddetallecompra ASC`,
      [idCompra]
    );
    return rows;
  },

  async listByTienda(idTienda, db = pool) {
    const { rows } = await db.query(
      `SELECT
          cp.*,
          p.nombreempresa AS nombre_proveedor,
          u.email AS email_proveedor
       FROM compraproveedor cp
       INNER JOIN usuario u ON cp.idusuarioproveedor = u.idusuario
       LEFT JOIN proveedor p ON p.idusuario = u.idusuario
       WHERE cp.idtienda = $1
       ORDER BY cp.fecha DESC`,
      [idTienda]
    );
    return rows;
  },

  // Modified listByProveedor to include pagination and filters
  async listByProveedor(idUsuarioProveedor, { estado, fechaInicio, fechaFin, limit, offset, sortBy = 'fecha', sortOrder = 'DESC' }, db = pool) {
    const parts = [`cp.idusuarioproveedor = $1`];
    const params = [idUsuarioProveedor];
    let n = 2;

    if (estado) {
      parts.push(`cp.estado = $${n++}::tipo_estado_compra`);
      params.push(estado);
    }
    if (fechaInicio) {
      parts.push(`cp.fecha >= $${n++}`);
      params.push(fechaInicio);
    }
    if (fechaFin) {
      parts.push(`cp.fecha <= $${n++}`);
      params.push(fechaFin);
    }

    const where = parts.join(" AND ");

    let orderByClause = 'cp.fecha';
    if (sortBy === 'total') {
      orderByClause = 'cp.total';
    } else if (sortBy === 'tienda') {
        orderByClause = 't.nombre';
    }
    const finalSortOrder = (sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    params.push(limit, offset);
    const lim = n;
    const off = n + 1;

    const { rows } = await db.query(
      `SELECT
          cp.*,
          t.nombre AS nombre_tienda,
          u_comprador.nombre AS nombre_comprador,
          u_comprador.email AS email_comprador
       FROM compraproveedor cp
       INNER JOIN tienda t ON cp.idtienda = t.idtienda
       INNER JOIN usuario u_comprador ON t.idusuario = u_comprador.idusuario
       WHERE ${where}
       ORDER BY ${orderByClause} ${finalSortOrder}
       LIMIT $${lim} OFFSET $${off}`,
      params
    );

    const countParams = params.slice(0, -2);
    const { rows: c } = await db.query(
      `SELECT COUNT(*)::int AS n
       FROM compraproveedor cp
       INNER JOIN tienda t ON cp.idtienda = t.idtienda
       INNER JOIN usuario u_comprador ON t.idusuario = u_comprador.idusuario
       WHERE ${where}`,
      countParams
    );

    return { rows, total: c[0]?.n ?? 0 };
  },

  async updateEstado(idCompra, estado, db = pool) {
    const { rows } = await db.query(
      `UPDATE compraproveedor SET estado = $1::tipo_estado_compra WHERE idcompra = $2 RETURNING *`,
      [estado, idCompra]
    );
    return rows[0] ?? null;
  },

  async updateTotal(idCompra, total, db = pool) {
    const { rows } = await db.query(
      `UPDATE compraproveedor SET total = $1 WHERE idcompra = $2 RETURNING *`,
      [total, idCompra]
    );
    return rows[0] ?? null;
  },

  async findDraftByTiendaAndProveedor(idTienda, idUsuarioProveedor, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM compraproveedor
       WHERE idtienda = $1 AND idusuarioproveedor = $2 AND estado = 'Draft'::tipo_estado_compra
       ORDER BY fecha DESC
       LIMIT 1`,
      [idTienda, idUsuarioProveedor]
    );
    return rows[0] ?? null;
  },

  async listDraftByTienda(idTienda, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM compraproveedor
       WHERE idtienda = $1 AND estado = 'Draft'::tipo_estado_compra
       ORDER BY fecha DESC`,
      [idTienda]
    );
    return rows;
  },

  async delete(idCompra, db = pool) {
    await db.query(`DELETE FROM compraproveedor WHERE idcompra = $1`, [idCompra]);
  },

  async findByIdAdmin(idCompra, db = pool) {
    const { rows } = await db.query(
      `SELECT
          cp.*,
          t.nombre AS nombre_tienda,
          t.idusuario AS id_usuario_tienda,
          u_prov.nombre AS nombre_proveedor,
          u_prov.email AS email_proveedor,
          json_agg(json_build_object(
              'idDetalleCompra', dcp.iddetallecompra,
              'idProductoMayorista', dcp.idproductomayorista,
              'nombreItem', pm.nombre,
              'cantidad', dcp.cantidad,
              'precioMayoreo', dcp.preciomayoreo,
              'marca', pm.marca,
              'imagenPrincipal', pm.imagenprincipal
          ) ORDER BY dcp.iddetallecompra) FILTER (WHERE dcp.iddetallecompra IS NOT NULL) AS detalles_items
       FROM compraproveedor cp
       INNER JOIN tienda t ON cp.idtienda = t.idtienda
       INNER JOIN usuario u_prov ON cp.idusuarioproveedor = u_prov.idusuario
       LEFT JOIN detallecompraproveedor dcp ON cp.idcompra = dcp.idcompra
       LEFT JOIN productomayorista pm ON dcp.idproductomayorista = pm.idproductomayorista
       WHERE cp.idcompra = $1
       GROUP BY cp.idcompra, t.idtienda, u_prov.idusuario`,
      [idCompra]
    );
    return rows[0] ?? null;
  }
};
