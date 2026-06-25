import * as adminService from "../services/admin.service.js";

export async function estadisticas(req, res) {
  const data = await adminService.getEstadisticasResumen();
  res.json({ ok: true, data });
}

export async function listTiendas(req, res) {
  const data = await adminService.listTiendasAdmin(req.query);
  res.json({ ok: true, data });
}

export async function getStoreDetailsAdmin(req, res) {
  const idTienda = Number(req.params.idTienda);
  if (!Number.isInteger(idTienda) || idTienda <= 0) {
    return res.status(400).json({ ok: false, message: "ID de tienda invalido." });
  }
  const data = await adminService.getStoreByIdAdmin(idTienda);
  res.json({ ok: true, data });
}

export async function listProductos(req, res) {
  const data = await adminService.listProductosAdmin(req.query);
  res.json({ ok: true, data });
}

export async function listPedidos(req, res) {
  const data = await adminService.listAllPedidosAdmin(req.query);
  res.json({ ok: true, data });
}

export async function listComprasProveedor(req, res) {
  const data = await adminService.listAllComprasProveedorAdmin(req.query);
  res.json({ ok: true, data });
}

export async function getUserDetailsAdmin(req, res) {
  const data = await adminService.getUserByIdAdmin(Number(req.params.idUsuario));
  res.json({ ok: true, data });
}

export async function patchUserAdmin(req, res) {
  const data = await adminService.updateUserAdmin(Number(req.params.idUsuario), req.body);
  res.json({ ok: true, data });
}

export async function getOrderDetailsAdmin(req, res) {
  const data = await adminService.getOrderByIdAdmin(Number(req.params.idPedido));
  res.json({ ok: true, data });
}

export async function getSupplierPurchaseDetailsAdmin(req, res) {
  const idCompra = Number(req.params.idCompra);
  if (!Number.isInteger(idCompra) || idCompra <= 0) {
    return res.status(400).json({ ok: false, message: "ID de compra a proveedor invalido." });
  }
  const data = await adminService.getSupplierPurchaseByIdAdmin(idCompra);
  res.json({ ok: true, data });
}
