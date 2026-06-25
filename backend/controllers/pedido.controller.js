import { tiendaModel } from "../models/tienda.model.js";
import { hasRole } from "../middlewares/auth.js";
import * as pedidoService from "../services/pedido.service.js";

export async function checkout(req, res) {
  const data = await pedidoService.checkout(req.user.idUsuario, req.body.idDireccionEnvio);
  res.status(201).json({ ok: true, data });
}

export async function listMine(req, res) {
  const data = await pedidoService.listMine(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function listTienda(req, res) {
  const tienda = await tiendaModel.findByUsuario(req.user.idUsuario);
  if (!tienda) {
    return res.json({ ok: true, data: [] });
  }
  const data = await pedidoService.listForTienda(tienda.idtienda);
  res.json({ ok: true, data });
}

export async function getById(req, res) {
  let idTiendaVendedor = null;
  if (hasRole(req.user, "Vendedor")) {
    const tienda = await tiendaModel.findByUsuario(req.user.idUsuario);
    idTiendaVendedor = tienda ? tienda.idtienda : null;
  }
  const data = await pedidoService.getById(req.user.idUsuario, Number(req.params.idPedido), {
    esAdmin: hasRole(req.user, "Administrador"),
    idTiendaVendedor
  });
  res.json({ ok: true, data });
}

export async function updateEstado(req, res) {
  const data = await pedidoService.updateEstado(
    Number(req.params.idPedido),
    req.body.estado,
    req.user.idUsuario, // Pass idUsuario
    req.user.roles
  );
  res.json({ ok: true, data });
}
