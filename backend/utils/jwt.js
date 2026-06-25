import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function signUserToken({ idUsuario, email, roles = [] }) {
  return signToken({
    sub: idUsuario,
    email,
    roles
  });
}
