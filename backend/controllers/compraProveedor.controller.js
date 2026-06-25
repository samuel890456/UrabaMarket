import * as compraProveedorService from "../services/compraProveedor.service.js";

export async function create(req, res) {
  const data = await compraProveedorService.crearDesdeTienda(req.user.idUsuario, req.body);
  res.status(201).json({ ok: true, data });
}

export async function listMineTienda(req, res) {
  const data = await compraProveedorService.listForTienda(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function listMineProveedor(req, res) {
  const data = await compraProveedorService.listForProveedor(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function getById(req, res) {
  const data = await compraProveedorService.getById(Number(req.params.idCompra), req.user.idUsuario, {
    roles: req.user.roles
  });
  res.json({ ok: true, data });
}

export async function updateEstado(req, res) {
  const data = await compraProveedorService.updateEstado(
    Number(req.params.idCompra),
    req.body.estado,
    req.user.idUsuario,
    { roles: req.user.roles }
  );
  res.json({ ok: true, data });
}
