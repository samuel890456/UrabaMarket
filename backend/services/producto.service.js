import { productoModel } from "../models/producto.model.js";
import { tiendaModel } from "../models/tienda.model.js";
import { productoMayoristaModel } from "../models/productoMayorista.model.js"; // New Import
import { ApiError } from "../utils/ApiError.js";
import { mapProducto } from "../utils/mappers.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";

export async function search(query) {
  const { page, limit, offset } = parsePagination(query);
  const q = query.q?.trim() || null;
  const idCategoria = query.idCategoria ? Number(query.idCategoria) : null;
  const marca = query.marca?.trim() || null;
  const minPrecio = query.minPrecio ? Number(query.minPrecio) : null;
  const maxPrecio = query.maxPrecio ? Number(query.maxPrecio) : null;
  const sortBy = query.sortBy || 'idProducto';
  const sortOrder = query.sortOrder || 'DESC';

  const { rows, total } = await productoModel.search({
    q,
    idCategoria,
    marca,
    minPrecio,
    maxPrecio,
    sortBy,
    sortOrder,
    limit,
    offset
  });
  return {
    items: rows.map(mapProducto),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function getById(idProducto, { incrementVisitas = false } = {}) {
  const row = await productoModel.findById(idProducto);
  if (!row || !row.activo) throw new ApiError.NotFound("Producto no encontrado");
  if (incrementVisitas) {
    await productoModel.incrementVisitas(idProducto);
    row.visitas = (row.visitas ?? 0) + 1;
  }
  return mapProducto(row);
}

export async function listByTienda(idTienda, { soloActivos = true } = {}) {
  const rows = await productoModel.listByTienda(idTienda, { activo: soloActivos });
  return rows.map(mapProducto);
}

/** Todos los productos de la tienda del vendedor (activos e inactivos). */
export async function listMineVendedor(idUsuario) {
  const tienda = await tiendaModel.findByUsuario(idUsuario);
  if (!tienda) {
    return [];
  }
  const rows = await productoModel.listByTienda(tienda.idtienda, { activo: false });
  return rows.map(mapProducto);
}

export async function createForTienda(idUsuario, data) {
  const tienda = await tiendaModel.findByUsuario(idUsuario);
  if (!tienda) {
    throw new ApiError.BadRequest("Debes tener una tienda para crear productos");
  }
  const row = await productoModel.create({
    idTienda: tienda.idtienda,
    ...data
  });
  return mapProducto(row);
}

export async function updateOwn(idUsuario, idProducto, data) {
  const tienda = await tiendaModel.findByUsuario(idUsuario);
  if (!tienda) throw new ApiError.Forbidden("No tienes tienda");
  const prod = await productoModel.findById(idProducto);
  if (!prod || prod.idtienda !== tienda.idtienda) {
    throw new ApiError.NotFound("Producto no encontrado");
  }
  const row = await productoModel.update(idProducto, data);
  return mapProducto(row);
}

export async function removeOwn(idUsuario, idProducto) {
  return updateOwn(idUsuario, idProducto, { activo: false });
}

export async function listLowStockProductsForSeller(idUsuario) {
  const tienda = await tiendaModel.findByUsuario(idUsuario);
  if (!tienda) {
    throw new ApiError.Forbidden("No tienes una tienda asociada");
  }
  const rows = await productoModel.listLowStockProducts(tienda.idtienda);
  return rows.map(mapProducto);
}

export async function listExpiredProductsForSeller(idUsuario) {
  const tienda = await tiendaModel.findByUsuario(idUsuario);
  if (!tienda) {
    throw new ApiError.Forbidden("No tienes una tienda asociada");
  }
  const rows = await productoModel.listExpiredProducts(tienda.idtienda);
  return rows.map(mapProducto);
}

export async function listSoonToExpireProductsForSeller(idUsuario, days) {
  const tienda = await tiendaModel.findByUsuario(idUsuario);
  if (!tienda) {
    throw new ApiError.Forbidden("No tienes una tienda asociada");
  }
  const rows = await productoModel.listSoonToExpireProducts(tienda.idtienda, days);
  return rows.map(mapProducto);
}

// New function to create a retail product from a wholesale product
export async function createRetailProductFromWholesale(idUsuarioVendedor, idProductoMayorista, retailDetails) {
  const tienda = await tiendaModel.findByUsuario(idUsuarioVendedor);
  if (!tienda) {
    throw new ApiError.BadRequest("El vendedor debe tener una tienda para crear productos al por menor.");
  }

  const wholesaleProduct = await productoMayoristaModel.findById(idProductoMayorista);
  if (!wholesaleProduct || !wholesaleProduct.activo) {
    throw new ApiError.NotFound("Producto mayorista no encontrado o no disponible.");
  }

  // Combine wholesale product data with seller's retail details
  const newRetailProductData = {
    idTienda: tienda.idtienda,
    idProductoMayorista: idProductoMayorista, // Link to the original wholesale product
    idProveedor: wholesaleProduct.idproveedor, // Store the original supplier's ID
    nombre: retailDetails.nombre || wholesaleProduct.nombre,
    descripcion: retailDetails.descripcion || wholesaleProduct.descripcion,
    // Assuming imagenPrincipal can be re-used or updated by seller
    imagenPrincipal: retailDetails.imagenPrincipal || wholesaleProduct.imagenprincipal,
    precio: retailDetails.precioVenta, // Seller's defined selling price
    precioCosto: retailDetails.precioCosto || wholesaleProduct.preciomayorista, // Cost to seller
    stock: retailDetails.stock, // Initial stock from this wholesale purchase
    stockMinimo: retailDetails.stockMinimo || 0,
    activo: retailDetails.activo ?? true,
    marca: retailDetails.marca || wholesaleProduct.marca,
    iva: retailDetails.iva || wholesaleProduct.ivamayorista, // Assuming iva is the same or seller can override
    fechaVencimiento: retailDetails.fechaVencimiento || wholesaleProduct.fechavencimiento,
    idCategoria: retailDetails.idCategoria || wholesaleProduct.idcategoria,
    promociones: retailDetails.promociones || null,
    descuento: retailDetails.descuento || null,
  };

  const newProduct = await productoModel.create(newRetailProductData);
  return mapProducto(newProduct);
}
