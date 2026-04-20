import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { usuarioModel } from "../models/usuario.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapUsuario } from "../utils/mappers.js";
import { signUserToken } from "../utils/jwt.js";

export async function register({ nombre, email, password, telefono, rol }) {
  if (rol === "Administrador") {
    throw new ApiError.Forbidden("No puedes registrarte como administrador");
  }
  const exists = await usuarioModel.findByEmail(email);
  if (exists) {
    throw new ApiError.Conflict("El email ya esta registrado");
  }
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const row = await usuarioModel.create({
    nombre,
    email,
    password: passwordHash,
    telefono: telefono ?? null,
    rol
  });
  const user = mapUsuario(row);
  const token = signUserToken({
    idUsuario: user.idUsuario,
    email: user.email,
    rol: user.rol
  });
  return { user, token };
}

export async function login({ email, password }) {
  const row = await usuarioModel.findByEmail(email);
  if (!row || !row.activo) {
    throw new ApiError.Unauthorized("Credenciales invalidas");
  }
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) {
    throw new ApiError.Unauthorized("Credenciales invalidas");
  }
  const user = mapUsuario(row);
  const token = signUserToken({
    idUsuario: user.idUsuario,
    email: user.email,
    rol: user.rol
  });
  return { user, token };
}
