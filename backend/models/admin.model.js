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
        (SELECT COUNT(*)::int FROM producto WHERE activo = TRUE) AS productos_activos,
        (SELECT COUNT(*)::int FROM producto WHERE activo = FALSE) AS productos_inactivos,
        (SELECT COUNT(*)::int FROM pedido) AS total_pedidos,
        (SELECT COUNT(*)::int FROM pedido WHERE estado = 'Pendiente'::tipo_estado_pedido) AS pedidos_pendientes,
        (SELECT COALESCE(SUM(total), 0)::numeric FROM pedido) AS monto_pedidos,
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

  async listProductos({ limit, offset }) {
    const { rows } = await pool.query(
      `SELECT * FROM producto ORDER BY idproducto DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: c } = await pool.query(`SELECT COUNT(*)::int AS n FROM producto`);
    return { rows, total: c[0]?.n ?? 0 };
  }
};
