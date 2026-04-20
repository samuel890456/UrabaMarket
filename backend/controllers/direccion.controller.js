import * as direccionService from "../services/direccion.service.js";

export async function list(req, res) {
  const data = await direccionService.listMine(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function create(req, res) {
  const data = await direccionService.create(req.user.idUsuario, req.body);
  res.status(201).json({ ok: true, data });
}

export async function update(req, res) {
  const data = await direccionService.update(
    req.user.idUsuario,
    Number(req.params.idDireccion),
    req.body
  );
  res.json({ ok: true, data });
}

export async function remove(req, res) {
  await direccionService.remove(req.user.idUsuario, Number(req.params.idDireccion));
  res.status(204).send();
}
