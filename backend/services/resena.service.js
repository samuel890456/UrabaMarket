import { resenaModel } from "../models/resena.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapResena } from "../utils/mappers.js";

export async function create(idUsuario, data) {
  const dup = await resenaModel.findByUsuarioProducto(idUsuario, data.idProducto);
  if (dup) {
    throw new ApiError.Conflict("Ya valoraste este producto");
  }
  const row = await resenaModel.create({
    idUsuario,
    idProducto: data.idProducto,
    puntuacion: data.puntuacion,
    comentario: data.comentario ?? null
  });
  return mapResena(row);
}

export async function listByProducto(idProducto) {
  const rows = await resenaModel.listByProducto(idProducto);
  return rows.map(mapResena);
}
