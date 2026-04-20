export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || "Error interno del servidor";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    ok: false,
    message
  });
}
