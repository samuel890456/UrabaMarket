import { direccionModel } from "../models/direccion.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapDireccion } from "../utils/mappers.js";

export async function listMine(idUsuario) {
  const rows = await direccionModel.listByUsuario(idUsuario);
  return rows.map(mapDireccion);
}

export async function create(idUsuario, data) {
  if (data.esPrincipal) {
    await direccionModel.clearPrincipalForUser(idUsuario);
  }
  const row = await direccionModel.create({ idUsuario, ...data });
  return mapDireccion(row);
}

export async function update(idUsuario, idDireccion, data) {
  const existing = await direccionModel.findById(idDireccion);
  if (!existing || existing.idusuario !== idUsuario) {
    throw new ApiError.NotFound("Direccion no encontrada");
  }
  if (data.esPrincipal) {
    await direccionModel.clearPrincipalForUser(idUsuario);
  }
  const row = await direccionModel.update(idDireccion, data);
  return mapDireccion(row);
}

export async function remove(idUsuario, idDireccion) {
  const existing = await direccionModel.findById(idDireccion);
  if (!existing || existing.idusuario !== idUsuario) {
    throw new ApiError.NotFound("Direccion no encontrada");
  }
  await direccionModel.delete(idDireccion);
}
