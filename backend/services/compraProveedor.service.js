import { compraProveedorModel } from "../models/compraProveedor.model.js";
import { usuarioModel } from "../models/usuario.model.js";
import { tiendaModel } from "../models/tienda.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapCompraProveedor, mapDetalleCompraProveedor } from "../utils/mappers.js";

export async function crearDesdeTienda(idUsuarioVendedor, { idUsuarioProveedor, items }) {
  const tienda = await tiendaModel.findByUsuario(idUsuarioVendedor);
  if (!tienda) {
    throw new ApiError.BadRequest("La tienda no existe");
  }
  const proveedor = await usuarioModel.findById(idUsuarioProveedor);
  if (!proveedor || proveedor.rol !== "Proveedor") {
    throw new ApiError.BadRequest("Proveedor invalido");
  }
  let total = 0;
  for (const it of items) {
    total += Number(it.precioMayoreo) * it.cantidad;
  }
  const compra = await compraProveedorModel.create({
    idTienda: tienda.idtienda,
    idUsuarioProveedor,
    total
  });
  for (const it of items) {
    await compraProveedorModel.addDetalle({
      idCompra: compra.idcompra,
      idProductoVinculado: it.idProductoVinculado ?? null,
      nombreItem: it.nombreItem ?? null,
      cantidad: it.cantidad,
      precioMayoreo: it.precioMayoreo
    });
  }
  const detalles = await compraProveedorModel.listDetalle(compra.idcompra);
  return {
    compra: mapCompraProveedor(compra),
    detalles: detalles.map(mapDetalleCompraProveedor)
  };
}

export async function listForTienda(idUsuarioVendedor) {
  const tienda = await tiendaModel.findByUsuario(idUsuarioVendedor);
  if (!tienda) return [];
  const rows = await compraProveedorModel.listByTienda(tienda.idtienda);
  return rows.map(mapCompraProveedor);
}

export async function listForProveedor(idUsuarioProveedor) {
  const rows = await compraProveedorModel.listByProveedor(idUsuarioProveedor);
  return rows.map(mapCompraProveedor);
}

export async function getById(idCompra, idUsuario, { rol }) {
  const c = await compraProveedorModel.findById(idCompra);
  if (!c) throw new ApiError.NotFound("Compra no encontrada");
  const tienda = await tiendaModel.findById(c.idtienda);
  const ok =
    rol === "Administrador" ||
    c.idusuarioproveedor === idUsuario ||
    (tienda && tienda.idusuario === idUsuario);
  if (!ok) throw new ApiError.Forbidden("No puedes ver esta compra");
  const detalles = await compraProveedorModel.listDetalle(idCompra);
  return {
    compra: mapCompraProveedor(c),
    detalles: detalles.map(mapDetalleCompraProveedor)
  };
}

export async function updateEstado(idCompra, estado, idUsuario, { rol }) {
  const c = await compraProveedorModel.findById(idCompra);
  if (!c) throw new ApiError.NotFound("Compra no encontrada");
  const tienda = await tiendaModel.findById(c.idtienda);
  const ok =
    rol === "Administrador" ||
    c.idusuarioproveedor === idUsuario ||
    (tienda && tienda.idusuario === idUsuario);
  if (!ok) throw new ApiError.Forbidden("No puedes actualizar esta compra");
  const row = await compraProveedorModel.updateEstado(idCompra, estado);
  return mapCompraProveedor(row);
}
