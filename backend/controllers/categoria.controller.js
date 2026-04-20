import * as categoriaService from "../services/categoria.service.js";

export async function listPublic(req, res) {
  const data = await categoriaService.listPublicas();
  res.json({ ok: true, data });
}

export async function listAdmin(req, res) {
  const data = await categoriaService.listAdmin(req.query);
  res.json({ ok: true, data });
}

export async function create(req, res) {
  const data = await categoriaService.create(req.body);
  res.status(201).json({ ok: true, data });
}

export async function update(req, res) {
  const data = await categoriaService.update(Number(req.params.idCategoria), req.body);
  res.json({ ok: true, data });
}

export async function getById(req, res) {
  const data = await categoriaService.getById(Number(req.params.idCategoria));
  res.json({ ok: true, data });
}
