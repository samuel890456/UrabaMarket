import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError.Unauthorized("Se requiere token Bearer"));
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const sub = payload.sub;
    req.user = {
      idUsuario: typeof sub === "string" ? Number(sub) : sub,
      email: payload.email,
      rol: payload.rol
    };
    next();
  } catch {
    return next(new ApiError.Unauthorized("Token invalido o expirado"));
  }
}

export function authorize(...roles) {
  const allowedRoles = roles.flat();
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError.Unauthorized());
    }
    if (!allowedRoles.length || allowedRoles.includes(req.user.rol)) {
      return next();
    }
    return next(new ApiError.Forbidden("No tienes permiso para esta accion"));
  };
}
