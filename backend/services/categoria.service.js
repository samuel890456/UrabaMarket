import { categoriaModel } from "../models/categoria.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapCategoria } from "../utils/mappers.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";

export async function listPublicas() {
  const rows = await categoriaModel.listActivas();
  return rows.map(mapCategoria);
}

export async function listAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await categoriaModel.listAll({ limit, offset });
  return {
    items: rows.map(mapCategoria),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function create(data) {
  const row = await categoriaModel.create(data);
  return mapCategoria(row);
}

export async function update(idCategoria, data) {
  const row = await categoriaModel.update(idCategoria, data);
  if (!row) throw new ApiError.NotFound("Categoria no encontrada");
  return mapCategoria(row);
}

export async function getById(idCategoria) {
  const row = await categoriaModel.findById(idCategoria);
  if (!row) throw new ApiError.NotFound("Categoria no encontrada");
  return mapCategoria(row);
}
