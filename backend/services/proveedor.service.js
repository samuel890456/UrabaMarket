import { proveedorModel } from "../models/proveedor.model.js";
import { productoMayoristaModel } from "../models/productoMayorista.model.js";
import { compraProveedorModel } from "../models/compraProveedor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";
import * as compraProveedorService from "./compraProveedor.service.js";

// Helper for mapping ProductoMayorista (similar to mapProducto/mapTienda)
// We'll create a simple one here.
function mapProductoMayorista(prod) {
  if (!prod) return null;
  return {
    idProductoMayorista: prod.idproductomayorista,
    idProveedor: prod.idproveedor,
    idCategoria: prod.idcategoria,
    nombre: prod.nombre,
    descripcion: prod.descripcion,
    precioMayorista: Number(prod.preciomayorista),
    stockMayorista: prod.stockmayorista,
    marca: prod.marca,
    ivaMayorista: prod.ivamayorista != null ? Number(prod.ivamayorista) : null,
    fechaVencimiento: prod.fechavencimiento,
    imagenPrincipal: prod.imagenprincipal,
    tipoProducto: prod.tipoproducto ?? "General",
    lote: prod.lote,
    fechaFabricacion: prod.fechafabricacion,
    garantiaMeses: prod.garantiameses,
    vidaUtilMeses: prod.vidautilmeses,
    modelo: prod.modelo,
    compatibilidad: prod.compatibilidad,
    numeroSerie: prod.numeroserie,
    activo: prod.activo,
    createdAt: prod.createdat,
    updatedAt: prod.updatedat,
  };
}

function mapProveedor(row) {
  if (!row) return null;
  return {
    idProveedor: row.idproveedor,
    idUsuario: row.idusuario,
    nombreEmpresa: row.nombreempresa,
    productosQueDistribuye: row.productosquedistribuye,
    nombreUsuario: row.nombre_usuario,
    email: row.email,
    createdAt: row.createdat,
    updatedAt: row.updatedat
  };
}

async function requireProveedorProfile(idUsuario) {
  const proveedor = await proveedorModel.findByUsuario(idUsuario);
  if (!proveedor) {
    throw new ApiError.Forbidden("Tu usuario proveedor no tiene perfil de proveedor asociado");
  }
  return proveedor;
}

export async function listAllProveedores() {
  const proveedores = await proveedorModel.listAll();
  return proveedores.map(mapProveedor);
}

// ProductoMayorista CRUD for supplier
export async function createProductoMayorista(idUsuarioProveedor, data) {
  const proveedor = await requireProveedorProfile(idUsuarioProveedor);
  const productoMayorista = await productoMayoristaModel.create({ idProveedor: proveedor.idproveedor, ...data });
  return mapProductoMayorista(productoMayorista);
}

export async function updateProductoMayorista(idProductoMayorista, data, idUsuarioProveedor) {
  const proveedor = await requireProveedorProfile(idUsuarioProveedor);
  const prod = await productoMayoristaModel.findById(idProductoMayorista);
  if (!prod || prod.idproveedor !== proveedor.idproveedor) {
    throw new ApiError.NotFound("Producto mayorista no encontrado o no autorizado");
  }
  const updatedProd = await productoMayoristaModel.update(idProductoMayorista, data);
  return mapProductoMayorista(updatedProd);
}

export async function removeProductoMayorista(idProductoMayorista, idUsuarioProveedor) {
  return updateProductoMayorista(idProductoMayorista, { activo: false }, idUsuarioProveedor);
}

export async function getProductoMayoristaById(idProductoMayorista) {
  const prod = await productoMayoristaModel.findById(idProductoMayorista);
  if (!prod) {
    throw new ApiError.NotFound("Producto mayorista no encontrado");
  }
  return mapProductoMayorista(prod);
}

export async function listMisProductosMayoristas(idUsuarioProveedor, query) {
  const proveedor = await requireProveedorProfile(idUsuarioProveedor);
  const { page, limit, offset } = parsePagination(query);
  const { q, idCategoria, sortBy, sortOrder } = query;
  const { rows, total } = await productoMayoristaModel.search({
    idProveedor: proveedor.idproveedor,
    q: q || undefined,
    idCategoria: idCategoria || undefined,
    limit,
    offset,
    sortBy,
    sortOrder
  });
  return {
    items: rows.map(mapProductoMayorista),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function listCatalogoMayorista(query) {
  const { page, limit, offset } = parsePagination(query);
  const { q, idCategoria, idProveedor, sortBy, sortOrder } = query;
  const { rows, total } = await productoMayoristaModel.search({
    q: q || undefined,
    idCategoria: idCategoria || undefined,
    idProveedor: idProveedor || undefined,
    limit,
    offset,
    sortBy,
    sortOrder
  });
  return {
    items: rows.map(mapProductoMayorista),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function adjustProductoMayoristaStock(idProductoMayorista, delta, idUsuarioProveedor) {
  const proveedor = await requireProveedorProfile(idUsuarioProveedor);
  const prod = await productoMayoristaModel.findById(idProductoMayorista);
  if (!prod || prod.idproveedor !== proveedor.idproveedor) {
    throw new ApiError.NotFound("Producto mayorista no encontrado o no autorizado");
  }
  const updatedProd = await productoMayoristaModel.adjustStockMayorista(idProductoMayorista, delta);
  return mapProductoMayorista(updatedProd);
}

// CompraProveedor management for supplier
export async function listSupplierOrders(idUsuarioProveedor, query) {
  const { page, limit, offset } = parsePagination(query);
  const { estado, fechaInicio, fechaFin, sortBy, sortOrder } = query;
  const { rows, total } = await compraProveedorModel.listByProveedor(idUsuarioProveedor, {
    estado: estado || undefined,
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
    limit,
    offset,
    sortBy,
    sortOrder
  });
  const items = rows.map(row => ({
    ...row,
    total: Number(row.total),
    fecha: row.fecha?.toISOString?.() ?? row.fecha
  }));
  return {
    items,
    meta: paginationMeta({ page, limit, total })
  };
}

export async function getSupplierOrderById(idCompra, idUsuarioProveedor) {
  const order = await compraProveedorModel.findByIdAdmin(idCompra); // Reusing findByIdAdmin, but will check ownership
  if (!order || order.idusuarioproveedor !== idUsuarioProveedor) {
    throw new ApiError.NotFound("Orden de compra a proveedor no encontrada o no autorizada.");
  }
  return {
    ...order,
    total: Number(order.total),
    detalles_items: order.detalles_items || [],
    fecha: order.fecha?.toISOString?.() ?? order.fecha
  };
}

export async function updateSupplierOrderStatus(idCompra, estado, idUsuarioProveedor) {
  return compraProveedorService.updateEstado(idCompra, estado, idUsuarioProveedor, { rol: "Proveedor" });
}
