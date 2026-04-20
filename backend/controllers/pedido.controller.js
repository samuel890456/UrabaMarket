import { tiendaModel } from "../models/tienda.model.js";
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
  if (req.user.rol === "Vendedor") {
    const tienda = await tiendaModel.findByUsuario(req.user.idUsuario);
    idTiendaVendedor = tienda ? tienda.idtienda : null;
  }
  const data = await pedidoService.getById(req.user.idUsuario, Number(req.params.idPedido), {
    esAdmin: req.user.rol === "Administrador",
    idTiendaVendedor
  });
  res.json({ ok: true, data });
}

export async function updateEstado(req, res) {
  const data = await pedidoService.updateEstadoAdmin(
    Number(req.params.idPedido),
    req.body.estado
  );
  res.json({ ok: true, data });
}
