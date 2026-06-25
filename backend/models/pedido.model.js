import { pool } from "../config/database.js";
import { productoModel } from "./producto.model.js"; // Import productoModel

export const pedidoModel = {
  async create({ idUsuario, idDireccionEnvio, total, estado = "Pendiente" }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO pedido (idusuario, iddireccionenvio, total, estado)
       VALUES ($1, $2, $3, $4::tipo_estado_pedido)
       RETURNING *`,
      [idUsuario, idDireccionEnvio, total, estado]
    );
    return rows[0];
  },

  async addDetalle({ idPedido, idProducto, idTienda, cantidad, precioUnitario }, db = pool) {
    // Fetch product cost price from productoModel
    const producto = await productoModel.findById(idProducto, db);
    const costoUnitario = producto?.preciocosto ?? producto?.precioCosto ?? null;
    const ganancia = (costoUnitario !== null) ? (precioUnitario - costoUnitario) : null;

    await db.query(
      `INSERT INTO detallepedido (idpedido, idproducto, idtienda, cantidad, preciounitario, costounitario, ganancia)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [idPedido, idProducto, idTienda, cantidad, precioUnitario, costoUnitario, ganancia]
    );
  },

  async findById(idPedido, db = pool) {
    const { rows } = await db.query(
      `SELECT
          p.*,
          u.nombre AS nombre_cliente,
          u.email AS email_cliente,
          u.telefono AS telefono_cliente
       FROM pedido p
       LEFT JOIN usuario u ON u.idusuario = p.idusuario
       WHERE p.idpedido = $1`,
      [idPedido]
    );
    return rows[0] ?? null;
  },

  async listDetalle(idPedido, db = pool) {
    const { rows } = await db.query(
      `SELECT
          d.*,
          p.nombre AS nombre_producto,
          p.imagenprincipal AS imagen_producto,
          p.marca AS marca_producto,
          t.nombre AS nombre_tienda,
          t.descripcion AS descripcion_tienda
       FROM detallepedido d
       LEFT JOIN producto p ON d.idproducto = p.idproducto
       LEFT JOIN tienda t ON d.idtienda = t.idtienda
       WHERE d.idpedido = $1
       ORDER BY d.iddetalle ASC`,
      [idPedido]
    );
    return rows;
  },

  async listByUsuario(idUsuario, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM pedido WHERE idusuario = $1 ORDER BY fecha DESC`,
      [idUsuario]
    );
    return rows;
  },

  async listByTiendaVendedor(idTienda, db = pool) {
    const { rows } = await db.query(
      `SELECT DISTINCT p.*
       FROM pedido p
       INNER JOIN detallepedido d ON d.idpedido = p.idpedido
       WHERE d.idtienda = $1
       ORDER BY p.fecha DESC`,
      [idTienda]
    );
    return rows;
  },

  async updateEstado(idPedido, estado, db = pool) {
    const { rows } = await db.query(
      `UPDATE pedido SET estado = $1::tipo_estado_pedido WHERE idpedido = $2 RETURNING *`,
      [estado, idPedido]
    );
    return rows[0] ?? null;
  },

  async getStoreFinancialSummary(idTienda, { fechaInicio, fechaFin }, db = pool) {
    const params = [idTienda];
    const parts = [`dp.idtienda = $1`, `p.estado <> 'Cancelado'::tipo_estado_pedido`];
    let n = 2;

    if (fechaInicio) {
      parts.push(`p.fecha >= $${n++}`);
      params.push(fechaInicio);
    }
    if (fechaFin) {
      parts.push(`p.fecha <= $${n++}`);
      params.push(fechaFin);
    }

    const where = parts.join(" AND ");

    const { rows } = await db.query(
      `SELECT
          COUNT(DISTINCT p.idpedido)::int AS total_ventas_count,
          COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS total_ingresos,
          COALESCE(SUM(COALESCE(dp.ganancia, 0) * dp.cantidad), 0)::numeric AS total_ganancias
       FROM detallepedido dp
       INNER JOIN pedido p ON dp.idpedido = p.idpedido
       WHERE ${where}`,
      params
    );
    return rows[0] ?? { total_ventas_count: 0, total_ingresos: 0, total_ganancias: 0 };
  },

  async getStoreFinancialDashboard(idTienda, { fechaInicio, fechaFin }, db = pool) {
    const params = [idTienda];
    const parts = [`dp.idtienda = $1`, `p.estado <> 'Cancelado'::tipo_estado_pedido`];
    let n = 2;

    if (fechaInicio) {
      parts.push(`p.fecha >= $${n++}`);
      params.push(fechaInicio);
    }
    if (fechaFin) {
      parts.push(`p.fecha <= $${n++}`);
      params.push(fechaFin);
    }

    const where = parts.join(" AND ");

    const { rows: summaryRows } = await db.query(
      `SELECT
          COUNT(DISTINCT p.idpedido)::int AS total_ventas_count,
          COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS total_ingresos,
          COALESCE(SUM(COALESCE(dp.ganancia, 0) * dp.cantidad), 0)::numeric AS total_ganancias,
          COALESCE(SUM(dp.cantidad), 0)::int AS unidades_vendidas,
          CASE WHEN COUNT(DISTINCT p.idpedido) > 0
            THEN COALESCE(SUM(dp.cantidad * dp.preciounitario), 0) / COUNT(DISTINCT p.idpedido)
            ELSE 0
          END::numeric AS ticket_promedio
       FROM detallepedido dp
       INNER JOIN pedido p ON dp.idpedido = p.idpedido
       WHERE ${where}`,
      params
    );

    const { rows: byDate } = await db.query(
      `SELECT DATE(p.fecha) AS fecha,
              COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS ingresos,
              COUNT(DISTINCT p.idpedido)::int AS pedidos
       FROM detallepedido dp
       INNER JOIN pedido p ON dp.idpedido = p.idpedido
       WHERE ${where}
       GROUP BY DATE(p.fecha)
       ORDER BY fecha ASC`,
      params
    );

    const whereTop = where.replaceAll("p.fecha", "pe.fecha").replaceAll("p.estado", "pe.estado");

    const { rows: topProducts } = await db.query(
      `SELECT prod.idproducto, prod.nombre,
              COALESCE(SUM(dp.cantidad), 0)::int AS unidades,
              COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS ingresos
       FROM detallepedido dp
       INNER JOIN pedido pe ON dp.idpedido = pe.idpedido
       INNER JOIN producto prod ON prod.idproducto = dp.idproducto
       WHERE ${whereTop}
       GROUP BY prod.idproducto, prod.nombre
       ORDER BY unidades DESC, ingresos DESC
       LIMIT 5`,
      params
    );

    return {
      summary: summaryRows[0] ?? {},
      byDate,
      topProducts
    };
  },

  async findByIdAdmin(idPedido, db = pool) {
    const { rows } = await db.query(
      `SELECT
          p.*,
          u.nombre AS nombre_usuario,
          u.email AS email_usuario,
          COALESCE(SUM(dp.cantidad * dp.preciounitario), 0)::numeric AS subtotal_pedido,
          COALESCE(SUM(COALESCE(dp.ganancia, 0) * dp.cantidad), 0)::numeric AS ganancia_pedido,
          json_agg(json_build_object(
              'idDetalle', dp.idDetalle,
              'idProducto', dp.idProducto,
              'nombreProducto', prod.nombre,
              'cantidad', dp.cantidad,
              'precioUnitario', dp.precioUnitario,
              'costoUnitario', dp.costoUnitario,
              'ganancia', dp.ganancia
          )) FILTER (WHERE dp.idDetalle IS NOT NULL) AS detalles_items
       FROM pedido p
       INNER JOIN usuario u ON p.idusuario = u.idusuario
       LEFT JOIN detallepedido dp ON p.idpedido = dp.idpedido
       LEFT JOIN producto prod ON dp.idProducto = prod.idProducto
       WHERE p.idpedido = $1
       GROUP BY p.idpedido, u.idusuario`,
      [idPedido]
    );
    return rows[0] ?? null;
  }
};
