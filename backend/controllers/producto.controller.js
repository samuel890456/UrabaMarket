import * as productoService from "../services/producto.service.js";

export async function search(req, res) {
  const data = await productoService.search(req.query);
  res.json({ ok: true, data });
}

export async function listByTienda(req, res) {
  const data = await productoService.listByTienda(Number(req.params.idTienda), {
    soloActivos: true
  });
  res.json({ ok: true, data });
}

export async function listMine(req, res) {
  const data = await productoService.listMineVendedor(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function getById(req, res) {
  const increment = req.query.visita === "1" || req.query.visita === "true";
  const data = await productoService.getById(Number(req.params.idProducto), {
    incrementVisitas: increment
  });
  res.json({ ok: true, data });
}

export async function create(req, res) {
  const data = await productoService.createForTienda(req.user.idUsuario, req.body);
  res.status(201).json({ ok: true, data });
}

export async function update(req, res) {
  const data = await productoService.updateOwn(
    req.user.idUsuario,
    Number(req.params.idProducto),
    req.body
  );
  res.json({ ok: true, data });
}

export async function remove(req, res) {
  const data = await productoService.removeOwn(req.user.idUsuario, Number(req.params.idProducto));
  res.json({ ok: true, data });
}

export async function listLowStock(req, res) {
  const data = await productoService.listLowStockProductsForSeller(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function listExpired(req, res) {
  const data = await productoService.listExpiredProductsForSeller(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function listSoonToExpire(req, res) {
  const days = req.query.days ? Number(req.query.days) : undefined;
  const data = await productoService.listSoonToExpireProductsForSeller(req.user.idUsuario, days);
  res.json({ ok: true, data });
}