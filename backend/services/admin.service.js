import { adminModel } from "../models/admin.model.js";
import { mapProducto, mapTienda } from "../utils/mappers.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";

export async function getEstadisticasResumen() {
  const row = await adminModel.getEstadisticasResumen();
  if (!row) return {};
  return {
    usuarios: {
      total: row.total_usuarios,
      porRol: {
        Cliente: row.clientes,
        Vendedor: row.vendedores,
        Proveedor: row.proveedores,
        Administrador: row.administradores
      }
    },
    tiendas: {
      activas: row.tiendas_activas,
      inactivas: row.tiendas_inactivas
    },
    productos: {
      activos: row.productos_activos,
      inactivos: row.productos_inactivos
    },
    pedidos: {
      total: row.total_pedidos,
      pendientes: row.pedidos_pendientes,
      montoTotal: row.monto_pedidos != null ? Number(row.monto_pedidos) : 0
    },
    comprasProveedor: {
      total: row.compras_b2b,
      montoTotal: row.monto_compras_b2b != null ? Number(row.monto_compras_b2b) : 0
    }
  };
}

export async function listTiendasAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await adminModel.listTiendas({ limit, offset });
  return {
    items: rows.map(mapTienda),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function listProductosAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await adminModel.listProductos({ limit, offset });
  return {
    items: rows.map(mapProducto),
    meta: paginationMeta({ page, limit, total })
  };
}
