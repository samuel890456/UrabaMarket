import { adminModel } from "../models/admin.model.js";
import { usuarioModel } from "../models/usuario.model.js";
import { pedidoModel } from "../models/pedido.model.js";
import { compraProveedorModel } from "../models/compraProveedor.model.js"; // New import
import { mapCompraProveedor, mapProducto, mapTienda } from "../utils/mappers.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";
import { ApiError } from "../utils/ApiError.js";

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
      total: row.total_tiendas,
      activas: row.tiendas_activas,
      inactivas: row.tiendas_inactivas
    },
    productos: {
      total: row.total_productos,
      activos: row.productos_activos,
      inactivos: row.productos_inactivos,
      topVendidos: row.top_vendidos
    },
    pedidos: {
      total: row.total_pedidos,
      pendientes: row.pedidos_pendientes,
      montoTotal: row.monto_pedidos != null ? Number(row.monto_pedidos) : 0,
      gananciaTotal: row.total_ganancias != null ? Number(row.total_ganancias) : 0
    },
    comprasProveedor: {
      total: row.compras_b2b,
      montoTotal: row.monto_compras_b2b != null ? Number(row.monto_compras_b2b) : 0
    }
  };
}

export async function listAllPedidosAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const { idUsuario, estado, fechaInicio, fechaFin, sortBy, sortOrder } = query;
  const { rows, total } = await adminModel.listAllPedidos({
    idUsuario,
    estado,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    sortBy,
    sortOrder
  });
  const items = rows.map(row => ({
    ...row,
    total: Number(row.total),
    subtotal_pedido: Number(row.subtotal_pedido),
    ganancia_pedido: Number(row.ganancia_pedido),
    fecha: row.fecha.toISOString()
  }));
  return {
    items,
    meta: paginationMeta({ page, limit, total })
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

export async function listAllComprasProveedorAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const { idTienda, idUsuarioProveedor, estado, fechaInicio, fechaFin, sortBy, sortOrder } = query;
  const { rows, total } = await adminModel.listAllComprasProveedor({
    idTienda,
    idUsuarioProveedor,
    estado,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    sortBy,
    sortOrder
  });
  const items = rows.map(row => ({
    ...mapCompraProveedor(row),
    nombreTienda: row.nombre_tienda,
    nombreProveedor: row.nombre_proveedor,
    emailProveedor: row.email_proveedor,
    nombre_tienda: row.nombre_tienda,
    nombre_proveedor: row.nombre_proveedor,
    email_proveedor: row.email_proveedor,
    fecha: row.fecha.toISOString()
  }));
  return {
    items,
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

export async function getUserByIdAdmin(idUsuario) {
  const user = await usuarioModel.findById(idUsuario);
  if (!user) {
    throw new ApiError.NotFound("Usuario no encontrado.");
  }
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUserAdmin(idUsuario, data) {
  const updatedUser = await usuarioModel.update(idUsuario, data);
  if (!updatedUser) {
    throw new ApiError.NotFound("Usuario no encontrado para actualizar.");
  }
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

export async function getOrderByIdAdmin(idPedido) {
  const order = await pedidoModel.findByIdAdmin(idPedido);
  if (!order) {
    throw new ApiError.NotFound("Pedido no encontrado.");
  }
  return {
    ...order,
    total: Number(order.total),
    subtotal_pedido: Number(order.subtotal_pedido),
    ganancia_pedido: Number(order.ganancia_pedido),
    detalles_items: order.detalles_items || [],
    fecha: order.fecha.toISOString()
  };
}

export async function getSupplierPurchaseByIdAdmin(idCompra) {
  const purchase = await compraProveedorModel.findByIdAdmin(idCompra);
  if (!purchase) {
    throw new ApiError.NotFound("Compra a proveedor no encontrada.");
  }
  return {
    ...mapCompraProveedor(purchase),
    nombreTienda: purchase.nombre_tienda,
    nombreProveedor: purchase.nombre_proveedor,
    emailProveedor: purchase.email_proveedor,
    nombre_tienda: purchase.nombre_tienda,
    nombre_proveedor: purchase.nombre_proveedor,
    email_proveedor: purchase.email_proveedor,
    total: Number(purchase.total),
    detalles_items: purchase.detalles_items || [],
    fecha: purchase.fecha.toISOString()
  };
}
