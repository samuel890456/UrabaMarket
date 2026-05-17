import * as tiendaService from "../services/tienda.service.js";

export async function listPublic(req, res) {
  const data = await tiendaService.listPublicas(req.query);
  res.json({ ok: true, data });
}

export async function getMine(req, res) {
  const data = await tiendaService.getMine(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function getById(req, res) {
  const data = await tiendaService.getById(Number(req.params.idTienda));
  res.json({ ok: true, data });
}

export async function create(req, res) {
  const data = await tiendaService.createForVendedor(req.user.idUsuario, req.body);
  res.status(201).json({ ok: true, data });
}

export async function updateOwn(req, res) {
  const data = await tiendaService.updateOwn(
    req.user.idUsuario,
    Number(req.params.idTienda),
    req.body
  );
  res.json({ ok: true, data });
}

export async function updateAdmin(req, res) {
  const data = await tiendaService.updateByAdmin(Number(req.params.idTienda), req.body);
  res.json({ ok: true, data });
}

export async function getFinancialSummary(req, res) {
  const { fechaInicio, fechaFin } = req.query;
  const data = await tiendaService.getOwnFinancialSummary(req.user.idUsuario, { fechaInicio, fechaFin });
  res.json({ ok: true, data });
}