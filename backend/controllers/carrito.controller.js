import * as carritoService from "../services/carrito.service.js";

export async function get(req, res) {
  const data = await carritoService.getCarritoCompleto(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function addItem(req, res) {
  const data = await carritoService.addItem(req.user.idUsuario, req.body);
  res.json({ ok: true, data });
}

export async function updateItem(req, res) {
  const data = await carritoService.updateItemCantidad(
    req.user.idUsuario,
    Number(req.params.idProducto),
    req.body.cantidad
  );
  res.json({ ok: true, data });
}

export async function removeItem(req, res) {
  const data = await carritoService.removeItem(req.user.idUsuario, Number(req.params.idProducto));
  res.json({ ok: true, data });
}

export async function clear(req, res) {
  const data = await carritoService.clearCart(req.user.idUsuario);
  res.json({ ok: true, data });
}
