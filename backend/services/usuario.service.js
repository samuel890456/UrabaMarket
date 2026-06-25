import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { usuarioModel } from "../models/usuario.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapUsuario } from "../utils/mappers.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";

export async function getMe(idUsuario) {
  const row = await usuarioModel.findById(idUsuario);
  if (!row) throw new ApiError.NotFound("Usuario no encontrado");
  return mapUsuario(row);
}

export async function updateMe(idUsuario, data) {
  const payload = { ...data };
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, env.BCRYPT_ROUNDS);
  }
  const row = await usuarioModel.update(idUsuario, payload);
  if (!row) throw new ApiError.NotFound("Usuario no encontrado");
  return mapUsuario(row);
}

export async function listUsuarios(query) {
  const { page, limit, offset } = parsePagination(query);
  const rol = query.rol ?? null;
  const q = query.q?.trim() || null;
  const total = await usuarioModel.count(rol, q);
  const rows = await usuarioModel.list({ limit, offset, rol, q });
  return {
    items: rows.map((r) => mapUsuario(r)),
    meta: paginationMeta({ page, limit, total })
  };
}

export async function getUsuarioById(idUsuario) {
  const row = await usuarioModel.findById(idUsuario);
  if (!row) throw new ApiError.NotFound("Usuario no encontrado");
  return mapUsuario(row);
}

export async function updateUsuarioAdmin(idUsuario, data) {
  const payload = { ...data };
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, env.BCRYPT_ROUNDS);
  }
  const row = await usuarioModel.update(idUsuario, payload);
  if (!row) throw new ApiError.NotFound("Usuario no encontrado");
  return mapUsuario(row);
}
