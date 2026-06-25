import { pool } from "../config/database.js";

export const adminModel = {
  async getEstadisticasResumen() {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM usuario) AS total_usuarios,
        (SELECT COUNT(DISTINCT ur.idusuario)::int FROM usuariorol ur INNER JOIN rol r ON r.idrol = ur.idrol WHERE r.nombre = 'Cliente') AS clientes,
        (SELECT COUNT(DISTINCT ur.idusuario)::int FROM usuariorol ur INNER JOIN rol r ON r.idrol = ur.idrol WHERE r.nombre = 'Vendedor') AS vendedores,
        (SELECT COUNT(DISTINCT ur.idusuario)::int FROM usuariorol ur INNER JOIN rol r ON r.idrol = ur.idrol WHERE r.nombre = 'Proveedor') AS proveedores,
        (SELECT COUNT(DISTINCT ur.idusuario)::int FROM usuariorol ur INNER JOIN rol r ON r.idrol = ur.idrol WHERE r.nombre = 'Administrador') AS administradores,
        (SELECT COUNT(*)::int FROM tienda WHERE activo = TRUE) AS tiendas_activas,
        (SELECT COUNT(*)::int FROM tienda WHERE activo = FALSE) AS tiendas_inactivas,
        (SELECT COUNT(*)::int FROM tienda) AS total_tiendas,
        (SELECT COUNT(*)::int FROM producto WHERE activo = TRUE) AS productos_activos,
        (SELECT COUNT(*)::int FROM producto WHERE activo = FALSE) AS productos_inactivos,
        (SELECT COUNT(*)::int FROM producto) AS total_productos,
        (SELECT COUNT(*)::int FROM pedido) AS total_pedidos,
        (SELECT COUNT(*)::int FROM pedido WHERE estado = 'Pendiente'::tipo_estado_pedido) AS pedidos_pendientes,
        (SELECT COALESCE(SUM(total), 0)::numeric FROM pedido) AS monto_pedidos,
        (SELECT COALESCE(SUM(COALESCE(dp.ganancia, 0) * dp.cantidad), 0)::numeric FROM detallepedido dp) AS total_ganancias,
        (SELECT json_agg(p.nombre) FROM (SELECT p.nombre FROM producto p ORDER BY p.vendidosTotales DESC LIMIT 5) p) AS top_vendidos,
        (SELECT COUNT(*)::int FROM compraproveedor) AS compras_b2b,
        (SELECT COALESCE(SUM(total), 0)::numeric FROM compraproveedor) AS monto_compras_b2b
    `);
    return rows[0] ?? null;
  },

  async listTiendas({ q = null, idCategoria = null, limit, offset }) {
    const parts = [];
    const params = [];
    let n = 1;

    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      parts.push(`(LOWER(t.nombre) LIKE $${n} OR LOWER(COALESCE(t.descripcion, '')) LIKE $${n} OR LOWER(COALESCE(t.direccion, '')) LIKE $${n})`);
      n += 1;
    }
    if (idCategoria) {
      params.push(idCategoria);
      parts.push(`t.idcategoria = $${n++}`);
    }
    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";
    params.push(limit, offset);
    const lim = n;
    const off = n + 1;

    const { rows } = await pool.query(
      `SELECT t.*, u.nombre AS nombre_usuario, u.email AS email_usuario
       FROM tienda t
       LEFT JOIN usuario u ON u.idusuario = t.idusuario
       ${where}
       ORDER BY t.idtienda DESC
       LIMIT $${lim} OFFSET $${off}`,
      params
    );
    const countParams = params.slice(0, -2);
    const { rows: c } = await pool.query(`SELECT COUNT(*)::int AS n FROM tienda t ${where}`, countParams);
    return { rows, total: c[0]?.n ?? 0 };
  },

  async listProductos({
    q = null,
    idCategoria = null,
    idTienda = null,
    idProveedor = null,
    marca = null,
    minPrecio = null,
    maxPrecio = null,
    sortBy = "idProducto",
    sortOrder = "DESC",
    limit,
    offset
  }) {
    const params = [];
    const parts = [];
    let n = 1;

    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      parts.push(`(LOWER(p.nombre) LIKE $${n} OR LOWER(COALESCE(p.descripcion, '')) LIKE $${n} OR LOWER(COALESCE(t.nombre, '')) LIKE $${n})`);
      n += 1;
    }
    if (idCategoria) {
      parts.push(`p.idcategoria = $${n++}`);
      params.push(idCategoria);
    }
    if (idTienda) {
      parts.push(`p.idtienda = $${n++}`);
      params.push(idTienda);
    }
    if (idProveedor) {
      parts.push(`p.idproveedor = $${n++}`);
      params.push(idProveedor);
    }
    if (marca) {
      params.push(`%${marca.toLowerCase()}%`);
      parts.push(`LOWER(COALESCE(p.marca, '')) LIKE $${n++}`);
    }
    if (minPrecio != null) {
      parts.push(`p.precio >= $${n++}`);
      params.push(minPrecio);
    }
    if (maxPrecio != null) {
      parts.push(`p.precio <= $${n++}`);
      params.push(maxPrecio);
    }
    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";

    const sortColumns = {
      idProducto: "p.idproducto",
      nombre: "p.nombre",
      precio: "p.precio",
      vendidosTotales: "p.vendidostotales",
      createdAt: "p.createdat",
      stock: "p.stock"
    };
    const orderByClause = sortColumns[sortBy] ?? sortColumns.idProducto;
    const finalSortOrder = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

    params.push(limit, offset);
    const lim = n;
    const off = n + 1;

    const { rows } = await pool.query(
      `SELECT p.*, t.nombre AS nombre_tienda, pr.nombreempresa AS nombre_proveedor
       FROM producto p
       LEFT JOIN tienda t ON t.idtienda = p.idtienda
       LEFT JOIN proveedor pr ON pr.idproveedor = p.idproveedor
       ${where}
       ORDER BY ${orderByClause} ${finalSortOrder}
       LIMIT $${lim} OFFSET $${off}`,
      params
    );
    const countParams = params.slice(0, -2); // Remove limit and offset for count
    const { rows: c } = await pool.query(
      `SELECT COUNT(*)::int AS n
       FROM producto p
       LEFT JOIN tienda t ON t.idtienda = p.idtienda
       LEFT JOIN proveedor pr ON pr.idproveedor = p.idproveedor
       ${where}`,
      countParams
    );
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
          COALESCE(SUM(COALESCE(dp.ganancia, 0) * dp.cantidad), 0) AS ganancia_pedido
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
  },

  async getStoreAdminDetail(idTienda) {
    const [
      store,
      productSummary,
      financial,
      salesByDate,
      ordersByStatus,
      products,
      recentProducts,
      recentOrders,
      b2bSummary,
      b2bByStatus,
      b2bPurchases,
      movements
    ] = await Promise.all([
      pool.query(
        `SELECT
            t.*,
            c.nombre AS categoria_nombre,
            d.ciudad,
            u.nombre AS vendedor_nombre,
            u.email AS vendedor_email,
            u.telefono AS vendedor_telefono,
            u.avatarurl AS vendedor_avatarurl
         FROM tienda t
         LEFT JOIN categoria c ON c.idcategoria = t.idcategoria
         LEFT JOIN usuario u ON u.idusuario = t.idusuario
         LEFT JOIN LATERAL (
            SELECT ciudad
            FROM direccion
            WHERE idusuario = t.idusuario
            ORDER BY esprincipal DESC, updatedat DESC
            LIMIT 1
         ) d ON TRUE
         WHERE t.idtienda = $1`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            COUNT(*)::int AS productos_totales,
            COUNT(*) FILTER (WHERE activo = TRUE)::int AS productos_activos,
            COUNT(*) FILTER (WHERE activo = FALSE)::int AS productos_inactivos,
            COALESCE(SUM(stock), 0)::int AS stock_total,
            COALESCE(SUM(visitas), 0)::int AS visitas_totales
         FROM producto
         WHERE idtienda = $1`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            COUNT(DISTINCT pe.idpedido)::int AS pedidos_totales,
            COUNT(DISTINCT pe.idpedido) FILTER (WHERE pe.estado = 'Completado'::tipo_estado_pedido)::int AS pedidos_completados,
            COALESCE(SUM(dp.cantidad), 0)::int AS unidades_vendidas,
            COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS ingresos,
            COALESCE(SUM(COALESCE(dp.ganancia, 0) * dp.cantidad), 0)::numeric AS ganancia,
            CASE WHEN COUNT(DISTINCT pe.idpedido) > 0
              THEN COALESCE(SUM(dp.cantidad * dp.preciounitario), 0) / COUNT(DISTINCT pe.idpedido)
              ELSE 0
            END::numeric AS ticket_promedio
         FROM detallepedido dp
         INNER JOIN pedido pe ON pe.idpedido = dp.idpedido
         WHERE dp.idtienda = $1 AND pe.estado <> 'Cancelado'::tipo_estado_pedido`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            DATE(pe.fecha) AS fecha,
            COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS ingresos,
            COUNT(DISTINCT pe.idpedido)::int AS pedidos
         FROM detallepedido dp
         INNER JOIN pedido pe ON pe.idpedido = dp.idpedido
         WHERE dp.idtienda = $1 AND pe.estado <> 'Cancelado'::tipo_estado_pedido
         GROUP BY DATE(pe.fecha)
         ORDER BY fecha ASC
         LIMIT 30`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            pe.estado,
            COUNT(DISTINCT pe.idpedido)::int AS pedidos,
            COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS total
         FROM detallepedido dp
         INNER JOIN pedido pe ON pe.idpedido = dp.idpedido
         WHERE dp.idtienda = $1
         GROUP BY pe.estado
         ORDER BY pedidos DESC`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            p.*,
            c.nombre AS categoria_nombre,
            COALESCE(SUM(dp.cantidad) FILTER (WHERE pe.idpedido IS NOT NULL), 0)::int AS unidades_vendidas_periodo,
            COALESCE(SUM(dp.cantidad * dp.preciounitario) FILTER (WHERE pe.idpedido IS NOT NULL), 0)::numeric AS ingresos
         FROM producto p
         LEFT JOIN categoria c ON c.idcategoria = p.idcategoria
         LEFT JOIN detallepedido dp ON dp.idproducto = p.idproducto
         LEFT JOIN pedido pe ON pe.idpedido = dp.idpedido AND pe.estado <> 'Cancelado'::tipo_estado_pedido
         WHERE p.idtienda = $1
         GROUP BY p.idproducto, c.nombre
         ORDER BY p.activo DESC, p.updatedat DESC, p.idproducto DESC`,
        [idTienda]
      ),
      pool.query(
        `SELECT * FROM producto
         WHERE idtienda = $1
         ORDER BY createdat DESC
         LIMIT 6`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            pe.idpedido,
            pe.fecha,
            pe.estado,
            u.nombre AS nombre_cliente,
            COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS total,
            COALESCE(SUM(dp.cantidad), 0)::int AS items
         FROM detallepedido dp
         INNER JOIN pedido pe ON pe.idpedido = dp.idpedido
         LEFT JOIN usuario u ON u.idusuario = pe.idusuario
         WHERE dp.idtienda = $1
         GROUP BY pe.idpedido, u.idusuario
         ORDER BY pe.fecha DESC
         LIMIT 8`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            COUNT(*)::int AS compras_count,
            COALESCE(SUM(total), 0)::numeric AS total_compras
         FROM compraproveedor
         WHERE idtienda = $1`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            estado,
            COUNT(*)::int AS compras,
            COALESCE(SUM(total), 0)::numeric AS total
         FROM compraproveedor
         WHERE idtienda = $1
         GROUP BY estado
         ORDER BY compras DESC`,
        [idTienda]
      ),
      pool.query(
        `SELECT
            cp.*,
            COALESCE(pr.nombreempresa, u.nombre) AS nombre_proveedor,
            u.email AS email_proveedor,
            COUNT(dcp.iddetallecompra)::int AS items
         FROM compraproveedor cp
         LEFT JOIN usuario u ON u.idusuario = cp.idusuarioproveedor
         LEFT JOIN proveedor pr ON pr.idusuario = u.idusuario
         LEFT JOIN detallecompraproveedor dcp ON dcp.idcompra = cp.idcompra
         WHERE cp.idtienda = $1
         GROUP BY cp.idcompra, pr.idproveedor, u.idusuario
         ORDER BY cp.fecha DESC
         LIMIT 12`,
        [idTienda]
      ),
      pool.query(
        `SELECT mi.*, p.nombre AS nombre_producto
         FROM movimientoinventario mi
         LEFT JOIN producto p ON p.idproducto = mi.idproducto
         WHERE mi.idtienda = $1
         ORDER BY mi.createdat DESC
         LIMIT 10`,
        [idTienda]
      )
    ]);

    return {
      store: store.rows[0] ?? null,
      productSummary: productSummary.rows[0] ?? null,
      financial: financial.rows[0] ?? null,
      salesByDate: salesByDate.rows,
      ordersByStatus: ordersByStatus.rows,
      products: products.rows,
      recentProducts: recentProducts.rows,
      recentOrders: recentOrders.rows,
      b2bSummary: b2bSummary.rows[0] ?? null,
      b2bByStatus: b2bByStatus.rows,
      b2bPurchases: b2bPurchases.rows,
      movements: movements.rows
    };
  },

  async getUserRelations(idUsuario) {
    const [tiendas, proveedor, productosTienda, productosProveedor, comprasTienda, comprasProveedor, pedidos] = await Promise.all([
      pool.query(
        `SELECT t.*, COUNT(p.idproducto)::int AS productos_count
         FROM tienda t
         LEFT JOIN producto p ON p.idtienda = t.idtienda
         WHERE t.idusuario = $1
         GROUP BY t.idtienda
         ORDER BY t.idtienda DESC`,
        [idUsuario]
      ),
      pool.query(`SELECT * FROM proveedor WHERE idusuario = $1`, [idUsuario]),
      pool.query(
        `SELECT p.*, t.nombre AS nombre_tienda
         FROM producto p
         INNER JOIN tienda t ON t.idtienda = p.idtienda
         WHERE t.idusuario = $1
         ORDER BY p.idproducto DESC
         LIMIT 8`,
        [idUsuario]
      ),
      pool.query(
        `SELECT pm.*, pr.nombreempresa AS nombre_proveedor
         FROM productomayorista pm
         INNER JOIN proveedor pr ON pr.idproveedor = pm.idproveedor
         WHERE pr.idusuario = $1
         ORDER BY pm.idproductomayorista DESC
         LIMIT 8`,
        [idUsuario]
      ),
      pool.query(
        `SELECT cp.*, t.nombre AS nombre_tienda, pu.nombreempresa AS nombre_proveedor
         FROM compraproveedor cp
         INNER JOIN tienda t ON t.idtienda = cp.idtienda
         LEFT JOIN proveedor pu ON pu.idusuario = cp.idusuarioproveedor
         WHERE t.idusuario = $1
         ORDER BY cp.fecha DESC
         LIMIT 8`,
        [idUsuario]
      ),
      pool.query(
        `SELECT cp.*, t.nombre AS nombre_tienda
         FROM compraproveedor cp
         INNER JOIN tienda t ON t.idtienda = cp.idtienda
         WHERE cp.idusuarioproveedor = $1
         ORDER BY cp.fecha DESC
         LIMIT 8`,
        [idUsuario]
      ),
      pool.query(
        `SELECT * FROM pedido WHERE idusuario = $1 ORDER BY fecha DESC LIMIT 8`,
        [idUsuario]
      )
    ]);

    return {
      tiendas: tiendas.rows,
      proveedor: proveedor.rows[0] ?? null,
      productosTienda: productosTienda.rows,
      productosProveedor: productosProveedor.rows,
      comprasTienda: comprasTienda.rows,
      comprasProveedor: comprasProveedor.rows,
      pedidos: pedidos.rows
    };
  }
};
