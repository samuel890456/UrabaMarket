import { adminModel } from "../models/admin.model.js";
import { usuarioModel } from "../models/usuario.model.js";
import { pedidoModel } from "../models/pedido.model.js";
import { compraProveedorModel } from "../models/compraProveedor.model.js"; // New import
import { mapCompraProveedor, mapProducto, mapTienda, mapUsuario } from "../utils/mappers.js";
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
  const { q, idCategoria } = query;
  const { rows, total } = await adminModel.listTiendas({
    q: q?.trim() || null,
    idCategoria: idCategoria ? Number(idCategoria) : null,
    limit,
    offset
  });
  return {
    items: rows.map((row) => ({
      ...mapTienda(row),
      nombreUsuario: row.nombre_usuario,
      emailUsuario: row.email_usuario
    })),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function getStoreByIdAdmin(idTienda) {
  const data = await adminModel.getStoreAdminDetail(idTienda);
  if (!data.store) {
    throw new ApiError.NotFound("Tienda no encontrada.");
  }

  const productos = data.products.map((row) => ({
    ...mapProducto(row),
    categoriaNombre: row.categoria_nombre,
    ingresos: Number(row.ingresos ?? 0),
    unidadesVendidasPeriodo: Number(row.unidades_vendidas_periodo ?? 0)
  }));

  const revenue = Number(data.financial?.ingresos ?? 0);
  const completedOrders = Number(data.financial?.pedidos_completados ?? 0);
  const totalOrders = Number(data.financial?.pedidos_totales ?? 0);
  const b2bTotal = Number(data.b2bSummary?.total_compras ?? 0);

  return {
    store: {
      ...mapTienda(data.store),
      categoriaNombre: data.store.categoria_nombre,
      ciudad: data.store.ciudad,
      vendedor: {
        idUsuario: data.store.idusuario,
        nombre: data.store.vendedor_nombre,
        email: data.store.vendedor_email,
        telefono: data.store.vendedor_telefono,
        avatarUrl: data.store.vendedor_avatarurl
      }
    },
    metrics: {
      productosTotales: Number(data.productSummary?.productos_totales ?? 0),
      productosActivos: Number(data.productSummary?.productos_activos ?? 0),
      productosInactivos: Number(data.productSummary?.productos_inactivos ?? 0),
      stockTotal: Number(data.productSummary?.stock_total ?? 0),
      visitasTotales: Number(data.productSummary?.visitas_totales ?? 0),
      ventasTotales: Number(data.financial?.unidades_vendidas ?? 0),
      ingresos: revenue,
      pedidosTotales: totalOrders,
      pedidosCompletados: completedOrders,
      ticketPromedio: Number(data.financial?.ticket_promedio ?? 0),
      comprasB2B: Number(data.b2bSummary?.compras_count ?? 0),
      abastecimientoTotal: b2bTotal,
      margenEstimado: Number(data.financial?.ganancia ?? 0)
    },
    products: productos,
    financial: {
      byDate: data.salesByDate.map((row) => ({
        fecha: row.fecha,
        ingresos: Number(row.ingresos ?? 0),
        pedidos: Number(row.pedidos ?? 0)
      })),
      byStatus: data.ordersByStatus.map((row) => ({
        estado: row.estado,
        pedidos: Number(row.pedidos ?? 0),
        total: Number(row.total ?? 0)
      }))
    },
    b2b: {
      purchases: data.b2bPurchases.map((row) => ({
        ...mapCompraProveedor(row),
        nombreProveedor: row.nombre_proveedor,
        emailProveedor: row.email_proveedor,
        items: Number(row.items ?? 0),
        total: Number(row.total ?? 0),
        fecha: row.fecha?.toISOString?.() ?? row.fecha
      })),
      byStatus: data.b2bByStatus.map((row) => ({
        estado: row.estado,
        compras: Number(row.compras ?? 0),
        total: Number(row.total ?? 0)
      }))
    },
    recent: {
      products: data.recentProducts.map(mapProducto),
      orders: data.recentOrders.map((row) => ({
        idPedido: row.idpedido,
        fecha: row.fecha?.toISOString?.() ?? row.fecha,
        estado: row.estado,
        cliente: row.nombre_cliente,
        total: Number(row.total ?? 0),
        items: Number(row.items ?? 0)
      })),
      movements: data.movements.map((row) => ({
        idMovimiento: row.idmovimiento,
        idProducto: row.idproducto,
        nombreProducto: row.nombre_producto,
        tipo: row.tipo,
        cantidad: Number(row.cantidad ?? 0),
        stockAnterior: Number(row.stockanterior ?? 0),
        stockNuevo: Number(row.stocknuevo ?? 0),
        referenciaTipo: row.referenciatipo,
        referenciaId: row.referenciaid,
        nota: row.nota,
        createdAt: row.createdat?.toISOString?.() ?? row.createdat
      }))
    }
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
  const { q, idCategoria, idTienda, idProveedor, marca, minPrecio, maxPrecio, sortBy, sortOrder } = query;
  const { rows, total } = await adminModel.listProductos({
    q: q?.trim() || null,
    idCategoria: idCategoria ? Number(idCategoria) : null,
    idTienda: idTienda ? Number(idTienda) : null,
    idProveedor: idProveedor ? Number(idProveedor) : null,
    marca: marca?.trim() || null,
    minPrecio: minPrecio !== undefined && minPrecio !== "" ? Number(minPrecio) : null,
    maxPrecio: maxPrecio !== undefined && maxPrecio !== "" ? Number(maxPrecio) : null,
    sortBy,
    sortOrder,
    limit,
    offset
  });
  return {
    items: rows.map((row) => ({
      ...mapProducto(row),
      nombreProveedor: row.nombre_proveedor
    })),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function getUserByIdAdmin(idUsuario) {
  const user = await usuarioModel.findById(idUsuario);
  if (!user) {
    throw new ApiError.NotFound("Usuario no encontrado.");
  }
  const relations = await adminModel.getUserRelations(idUsuario);
  return {
    ...mapUsuario(user),
    relations: {
      tiendas: relations.tiendas.map((row) => ({
        ...mapTienda(row),
        productosCount: Number(row.productos_count ?? 0)
      })),
      proveedor: relations.proveedor
        ? {
            idProveedor: relations.proveedor.idproveedor,
            idUsuario: relations.proveedor.idusuario,
            nombreEmpresa: relations.proveedor.nombreempresa,
            productosQueDistribuye: relations.proveedor.productosquedistribuye
          }
        : null,
      productosTienda: relations.productosTienda.map(mapProducto),
      productosProveedor: relations.productosProveedor.map((row) => ({
        idProductoMayorista: row.idproductomayorista,
        idProveedor: row.idproveedor,
        nombre: row.nombre,
        precioMayorista: Number(row.preciomayorista ?? 0),
        stockMayorista: Number(row.stockmayorista ?? 0),
        nombreProveedor: row.nombre_proveedor,
        activo: row.activo
      })),
      comprasTienda: relations.comprasTienda.map((row) => ({
        ...mapCompraProveedor(row),
        nombreTienda: row.nombre_tienda,
        nombreProveedor: row.nombre_proveedor
      })),
      comprasProveedor: relations.comprasProveedor.map((row) => ({
        ...mapCompraProveedor(row),
        nombreTienda: row.nombre_tienda
      })),
      pedidos: relations.pedidos.map((row) => ({
        ...row,
        total: Number(row.total ?? 0),
        fecha: row.fecha?.toISOString?.() ?? row.fecha
      }))
    }
  };
}

export async function updateUserAdmin(idUsuario, data) {
  const updatedUser = await usuarioModel.update(idUsuario, data);
  if (!updatedUser) {
    throw new ApiError.NotFound("Usuario no encontrado para actualizar.");
  }
  return mapUsuario(updatedUser);
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
