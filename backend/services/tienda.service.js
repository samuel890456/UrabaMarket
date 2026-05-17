import { tiendaModel } from "../models/tienda.model.js";
import { pedidoModel } from "../models/pedido.model.js"; // New import
import { ApiError } from "../utils/ApiError.js";
import { mapTienda } from "../utils/mappers.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";

export async function listPublicas(query) {
  const { page, limit, offset } = parsePagination(query);
  const idCategoria = query.idCategoria ? Number(query.idCategoria) : null;
  const { rows, total } = await tiendaModel.listPublic({ limit, offset, idCategoria });
  return {
    items: rows.map(mapTienda),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function getById(idTienda) {
  const row = await tiendaModel.findById(idTienda);
  if (!row || !row.activo) throw new ApiError.NotFound("Tienda no encontrada");
  return mapTienda(row);
}

export async function createForVendedor(idUsuario, data) {
  const existing = await tiendaModel.findByUsuario(idUsuario);
  if (existing) {
    throw new ApiError.Conflict("Ya tienes una tienda registrada");
  }
  const row = await tiendaModel.create({ idUsuario, ...data });
  return mapTienda(row);
}

export async function updateOwn(idUsuario, idTienda, data) {
  const row = await tiendaModel.findById(idTienda);
  if (!row || row.idusuario !== idUsuario) {
    throw new ApiError.NotFound("Tienda no encontrada");
  }
  const updated = await tiendaModel.update(idTienda, data);
  return mapTienda(updated);
}

export async function getMine(idUsuario) {
  const row = await tiendaModel.findByUsuario(idUsuario);
  if (!row) return null;
  return mapTienda(row);
}

export async function updateByAdmin(idTienda, data) {
  const updated = await tiendaModel.update(idTienda, data);
  if (!updated) throw new ApiError.NotFound("Tienda no encontrada");
  return mapTienda(updated);
}

export async function getOwnFinancialSummary(idUsuario, { fechaInicio, fechaFin } = {}) {
  const tienda = await tiendaModel.findByUsuario(idUsuario);
  if (!tienda) {
    throw new ApiError.Forbidden("No tienes una tienda asociada para obtener un resumen financiero.");
  }
  const summary = await pedidoModel.getStoreFinancialSummary(tienda.idtienda, { fechaInicio, fechaFin });
  return {
    totalVentasCount: Number(summary.total_ventas_count),
    totalIngresos: Number(summary.total_ingresos),
    totalGanancias: Number(summary.total_ganancias)
  };
}
