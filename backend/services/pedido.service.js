import { pool } from "../config/database.js";
import { carritoModel } from "../models/carrito.model.js";
import { direccionModel } from "../models/direccion.model.js";
import { pedidoModel } from "../models/pedido.model.js";
import { productoModel } from "../models/producto.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapDetallePedido, mapPedido } from "../utils/mappers.js";

export async function checkout(idUsuario, idDireccionEnvio) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const carrito = await carritoModel.findActivoByUsuario(idUsuario, client);
    if (!carrito) {
      throw new ApiError.BadRequest("No hay carrito activo");
    }
    const items = await carritoModel.listItems(carrito.idcarrito, client);
    if (!items.length) {
      throw new ApiError.BadRequest("El carrito esta vacio");
    }
    const dir = await direccionModel.findById(idDireccionEnvio, client);
    if (!dir || dir.idusuario !== idUsuario) {
      throw new ApiError.BadRequest("Direccion de envio invalida");
    }
    let total = 0;
    for (const it of items) {
      const prod = await productoModel.findById(it.idproducto, client);
      if (!prod || !prod.activo) {
        throw new ApiError.BadRequest(`Producto ${it.idproducto} no disponible`);
      }
      if (prod.stock < it.cantidad) {
        throw new ApiError.BadRequest(`Stock insuficiente: ${prod.nombre}`);
      }
      total += Number(it.preciofijado) * it.cantidad;
    }
    const pedidoRow = await pedidoModel.create(
      { idUsuario, idDireccionEnvio, total },
      client
    );
    const idPedido = pedidoRow.idpedido;
    for (const it of items) {
      const prod = await productoModel.findById(it.idproducto, client);
      await pedidoModel.addDetalle(
        {
          idPedido,
          idProducto: it.idproducto,
          idTienda: prod.idtienda,
          cantidad: it.cantidad,
          precioUnitario: it.preciofijado
        },
        client
      );
      const updated = await productoModel.adjustStock(it.idproducto, -it.cantidad, client);
      if (!updated) {
        throw new ApiError.BadRequest(`No se pudo descontar stock del producto ${it.idproducto}`);
      }
    }
    await carritoModel.updateEstado(carrito.idcarrito, "Comprado", client);
    await client.query("COMMIT");
    const p = await pedidoModel.findById(idPedido, pool);
    const detalles = await pedidoModel.listDetalle(idPedido, pool);
    return {
      pedido: mapPedido(p),
      detalles: detalles.map(mapDetallePedido)
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function listMine(idUsuario) {
  const rows = await pedidoModel.listByUsuario(idUsuario);
  return rows.map(mapPedido);
}

export async function getById(idUsuario, idPedido, { esAdmin = false, idTiendaVendedor = null } = {}) {
  const p = await pedidoModel.findById(idPedido);
  if (!p) throw new ApiError.NotFound("Pedido no encontrado");
  if (esAdmin) {
    /* ok */
  } else if (p.idusuario === idUsuario) {
    /* cliente dueño del pedido */
  } else if (idTiendaVendedor != null) {
    const detalles = await pedidoModel.listDetalle(idPedido);
    const pertenece = detalles.some((d) => d.idtienda === idTiendaVendedor);
    if (!pertenece) throw new ApiError.Forbidden("No puedes ver este pedido");
  } else {
    throw new ApiError.Forbidden("No puedes ver este pedido");
  }
  const detalles = await pedidoModel.listDetalle(idPedido);
  return {
    pedido: mapPedido(p),
    detalles: detalles.map(mapDetallePedido)
  };
}

export async function listForTienda(idTienda) {
  const rows = await pedidoModel.listByTiendaVendedor(idTienda);
  return rows.map(mapPedido);
}

export async function updateEstadoAdmin(idPedido, estado) {
  const row = await pedidoModel.updateEstado(idPedido, estado);
  if (!row) throw new ApiError.NotFound("Pedido no encontrado");
  return mapPedido(row);
}
