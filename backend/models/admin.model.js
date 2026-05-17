import { pool } from "../config/database.js";

export const adminModel = {
  async getEstadisticasResumen() {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM usuario) AS total_usuarios,
        (SELECT COUNT(*)::int FROM usuario WHERE rol = 'Cliente'::tipo_rol) AS clientes,
        (SELECT COUNT(*)::int FROM usuario WHERE rol = 'Vendedor'::tipo_rol) AS vendedores,
        (SELECT COUNT(*)::int FROM usuario WHERE rol = 'Proveedor'::tipo_rol) AS proveedores,
        (SELECT COUNT(*)::int FROM usuario WHERE rol = 'Administrador'::tipo_rol) AS administradores,
        (SELECT COUNT(*)::int FROM tienda WHERE activo = TRUE) AS tiendas_activas,
        (SELECT COUNT(*)::int FROM tienda WHERE activo = FALSE) AS tiendas_inactivas,
        (SELECT COUNT(*)::int FROM tienda) AS total_tiendas,
        (SELECT COUNT(*)::int FROM producto WHERE activo = TRUE) AS productos_activos,
        (SELECT COUNT(*)::int FROM producto WHERE activo = FALSE) AS productos_inactivos,
        (SELECT COUNT(*)::int FROM producto) AS total_productos,
        (SELECT COUNT(*)::int FROM pedido) AS total_pedidos,
        (SELECT COUNT(*)::int FROM pedido WHERE estado = 'Pendiente'::tipo_estado_pedido) AS pedidos_pendientes,
        (SELECT COALESCE(SUM(total), 0)::numeric FROM pedido) AS monto_pedidos,
        (SELECT COALESCE(SUM(dp.ganancia), 0)::numeric FROM detallepedido dp) AS total_ganancias,
        (SELECT json_agg(p.nombre) FROM (SELECT p.nombre FROM producto p ORDER BY p.vendidosTotales DESC LIMIT 5) p) AS top_vendidos,
        (SELECT COUNT(*)::int FROM compraproveedor) AS compras_b2b,
        (SELECT COALESCE(SUM(total), 0)::numeric FROM compraproveedor) AS monto_compras_b2b
    `);
    return rows[0] ?? null;
  },

  async listTiendas({ limit, offset }) {
    const { rows } = await pool.query(
      `SELECT * FROM tienda ORDER BY idtienda DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: c } = await pool.query(`SELECT COUNT(*)::int AS n FROM tienda`);
    return { rows, total: c[0]?.n ?? 0 };
  },

  async listProductos({ idTienda, limit, offset }) {
    const params = [];
    const parts = [];
    let n = 1;

    if (idTienda) {
      parts.push(`idtienda = $${n++}`);
      params.push(idTienda);
    }
    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";

    params.push(limit, offset);
    const lim = n;
    const off = n + 1;

    const { rows } = await pool.query(
      `SELECT * FROM producto ${where} ORDER BY idproducto DESC LIMIT $${lim} OFFSET $${off}`,
      params
    );
    const countParams = params.slice(0, -2); // Remove limit and offset for count
    const { rows: c } = await pool.query(`SELECT COUNT(*)::int AS n FROM producto ${where}`, countParams);
    return { rows, total: c[0]?.n ?? 0 };
  },

  async listAllPedidos({ idUsuario, estado, fechaInicio, fechaFin, limit, offset, sortBy = 'fecha', sortOrder = 'DESC' }) {
    const parts = [];
    const params = [];
    let n = 1;

    if (idUsuario) {
      parts.push(`p.idusuario = $${n++}`);
      params.push(idUsuario);
    }
    if (estado) {
      parts.push(`p.estado = $${n++}::tipo_estado_pedido`);
      params.push(estado);
    }
    if (fechaInicio) {
      parts.push(`p.fecha >= $${n++}`);
      params.push(fechaInicio);
    }
    if (fechaFin) {
      parts.push(`p.fecha <= $${n++}`);
      params.push(fechaFin);
    }

    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";

    let orderByClause = 'p.fecha';
    if (sortBy === 'total') {
      orderByClause = 'p.total';
    } else if (sortBy === 'usuario') {
        orderByClause = 'u.nombre';
    }
    const finalSortOrder = (sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    params.push(limit, offset);
    const lim = n;
    const off = n + 1;

    const { rows } = await pool.query(
      `SELECT
          p.*,
          u.nombre AS nombre_usuario,
          u.email AS email_usuario,
          COALESCE(SUM(dp.cantidad * dp.preciounitario), 0) AS subtotal_pedido,
          COALESCE(SUM(dp.ganancia), 0) AS ganancia_pedido
       FROM pedido p
       INNER JOIN usuario u ON p.idusuario = u.idusuario
       LEFT JOIN detallepedido dp ON p.idpedido = dp.idpedido
       ${where}
       GROUP BY p.idpedido, u.idusuario
       ORDER BY ${orderByClause} ${finalSortOrder}
       LIMIT $${lim} OFFSET $${off}`,
      params
    );

    const countParams = params.slice(0, -2);
    const { rows: c } = await pool.query(
      `SELECT COUNT(DISTINCT p.idpedido)::int AS n
       FROM pedido p
       INNER JOIN usuario u ON p.idusuario = u.idusuario
       LEFT JOIN detallepedido dp ON p.idpedido = dp.idpedido
       ${where}`,
      countParams
    );

    return { rows, total: c[0]?.n ?? 0 };
  },

  async listAllComprasProveedor({ idTienda, idUsuarioProveedor, estado, fechaInicio, fechaFin, limit, offset, sortBy = 'fecha', sortOrder = 'DESC' }) {
    const parts = [];
    const params = [];
    let n = 1;

    if (idTienda) {
      parts.push(`cp.idtienda = $${n++}`);
      params.push(idTienda);
    }
    if (idUsuarioProveedor) {
      parts.push(`cp.idusuarioProveedor = $${n++}`);
      params.push(idUsuarioProveedor);
    }
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

    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";

    let orderByClause = 'cp.fecha';
    if (sortBy === 'total') {
      orderByClause = 'cp.total';
    } else if (sortBy === 'tienda') {
        orderByClause = 't.nombre';
    } else if (sortBy === 'proveedor') {
        orderByClause = 'u.nombre';
    }
    const finalSortOrder = (sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    params.push(limit, offset);
    const lim = n;
    const off = n + 1;

    const { rows } = await pool.query(
      `SELECT
          cp.*,
          t.nombre AS nombre_tienda,
          u.nombre AS nombre_proveedor,
          u.email AS email_proveedor
       FROM compraproveedor cp
       INNER JOIN tienda t ON cp.idtienda = t.idtienda
       INNER JOIN usuario u ON cp.idusuarioProveedor = u.idusuario
       ${where}
       ORDER BY ${orderByClause} ${finalSortOrder}
       LIMIT $${lim} OFFSET $${off}`,
      params
    );

    const countParams = params.slice(0, -2);
    const { rows: c } = await pool.query(
      `SELECT COUNT(*)::int AS n
       FROM compraproveedor cp
       INNER JOIN tienda t ON cp.idtienda = t.idtienda
       INNER JOIN usuario u ON cp.idusuarioProveedor = u.idusuario
       ${where}`,
      countParams
    );

    return { rows, total: c[0]?.n ?? 0 };
  }
};