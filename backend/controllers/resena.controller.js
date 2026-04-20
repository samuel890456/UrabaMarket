import * as resenaService from "../services/resena.service.js";

export async function create(req, res) {
  const data = await resenaService.create(req.user.idUsuario, req.body);
  res.status(201).json({ ok: true, data });
}

export async function listByProducto(req, res) {
  const data = await resenaService.listByProducto(Number(req.query.idProducto));
  res.json({ ok: true, data });
}
