import { ApiError } from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(new ApiError.NotFound(`Ruta no encontrada: ${req.originalUrl}`));
}
