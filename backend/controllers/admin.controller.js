import * as adminService from "../services/admin.service.js";

export async function estadisticas(req, res) {
  const data = await adminService.getEstadisticasResumen();
  res.json({ ok: true, data });
}

export async function listTiendas(req, res) {
  const data = await adminService.listTiendasAdmin(req.query);
  res.json({ ok: true, data });
}

export async function listProductos(req, res) {
  const data = await adminService.listProductosAdmin(req.query);
  res.json({ ok: true, data });
}
