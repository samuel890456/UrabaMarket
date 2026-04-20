import { productoModel } from "../models/producto.model.js";
import { tiendaModel } from "../models/tienda.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapProducto } from "../utils/mappers.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";

export async function search(query) {
  const { page, limit, offset } = parsePagination(query);
  const q = query.q?.trim() || null;
  const idCategoria = query.idCategoria ? Number(query.idCategoria) : null;
  const { rows, total } = await productoModel.search({ q, idCategoria, limit, offset });
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
