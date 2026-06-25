import { pool } from "../config/database.js";
import { carritoModel } from "../models/carrito.model.js";
import { direccionModel } from "../models/direccion.model.js";
import { inventarioModel } from "../models/inventario.model.js";
import { pedidoModel } from "../models/pedido.model.js";
import { productoModel } from "../models/producto.model.js";
import { tiendaModel } from "../models/tienda.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapDetallePedido, mapDireccion, mapPedido } from "../utils/mappers.js";

function getProductoPrecio(producto) {
  return Number(producto?.precio ?? producto?.precioventa ?? 0);
}

function totalsForDetalles(detalles) {
  const total = detalles.reduce(
    (sum, item) => sum + Number(item.precioUnitario ?? 0) * Number(item.cantidad ?? 0),
    0
  );
  const subtotal = Math.round(total / 1.19);
  const iva = total - subtotal;
  return {
    subtotal,
    iva,
    total
  };
}

export async function checkout(idUsuario, idDireccionEnvio) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const carrito = await carritoModel.findActivoByUsuarioForUpdate(idUsuario, client);
    if (!carrito) {
      throw new ApiError.BadRequest("No hay carrito activo");
    }
    const items = await carritoModel.listItemsForUpdate(carrito.idcarrito, client);
    if (!items.length) {
      throw new ApiError.BadRequest("El carrito esta vacio");
    }
    const dir = await direccionModel.findById(idDireccionEnvio, client);
    if (!dir || dir.idusuario !== idUsuario) {
      throw new ApiError.BadRequest("Direccion de envio invalida");
    }
    const productosValidados = [];
    let total = 0;
    for (const it of items) {
      if (!Number.isInteger(Number(it.cantidad)) || Number(it.cantidad) <= 0) {
        throw new ApiError.BadRequest("Hay productos con cantidades invalidas en el carrito");
      }

      const prod = await productoModel.findByIdForUpdate(it.idproducto, client);
      if (!prod || !prod.activo) {
        throw new ApiError.BadRequest(`Producto ${it.idproducto} no disponible`);
      }
      if (prod.stock < it.cantidad) {
        throw new ApiError.BadRequest(`Stock insuficiente para ${prod.nombre}. Disponible: ${prod.stock}`);
      }
      const precioActual = getProductoPrecio(prod);
      if (precioActual < 0) {
        throw new ApiError.BadRequest(`Precio invalido para ${prod.nombre}`);
      }
      await carritoModel.updateItemPrice(carrito.idcarrito, it.idproducto, precioActual, client);
      total += precioActual * Number(it.cantidad);
      productosValidados.push({ item: it, producto: prod, precioActual });
    }
    if (total <= 0) {
      throw new ApiError.BadRequest("El total del pedido debe ser mayor a cero");
    }

    const pedidoRow = await pedidoModel.create(
      { idUsuario, idDireccionEnvio, total },
      client
    );
    const idPedido = pedidoRow.idpedido;
    for (const { item, producto, precioActual } of productosValidados) {
      await pedidoModel.addDetalle(
        {
          idPedido,
          idProducto: item.idproducto,
          idTienda: producto.idtienda,
          cantidad: item.cantidad,
          precioUnitario: precioActual
        },
        client
      );
      const updated = await productoModel.adjustStock(item.idproducto, -Number(item.cantidad), client);
      if (!updated) {
        throw new ApiError.BadRequest(`No se pudo descontar stock del producto ${producto.nombre}`);
      }
      await inventarioModel.addMovimiento({
        idProducto: item.idproducto,
        idTienda: producto.idtienda,
        tipo: "SALIDA_VENTA",
        cantidad: -Number(item.cantidad),
        stockAnterior: Number(updated.stock_anterior ?? updated.stock + Number(item.cantidad)),
        stockNuevo: Number(updated.stock),
        referenciaTipo: "Pedido",
        referenciaId: idPedido,
        costoUnitario: producto.preciocosto,
        nota: "Salida por venta"
      }, client);
    }
    await carritoModel.updateEstado(carrito.idcarrito, "Comprado", client);
    await client.query("COMMIT");
    const p = await pedidoModel.findById(idPedido, pool);
    const detallesRaw = await pedidoModel.listDetalle(idPedido, pool);
    const detalles = detallesRaw.map(mapDetallePedido);
    const direccion = p.iddireccionenvio ? await direccionModel.findById(p.iddireccionenvio) : null;
    return {
      pedido: mapPedido(p),
      detalles,
      direccion: mapDireccion(direccion),
      metodoPago: "Pago contra entrega",
      resumen: totalsForDetalles(detalles)
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
  const detallesRaw = await pedidoModel.listDetalle(idPedido);
  const detalles = detallesRaw.map(mapDetallePedido);
  const direccion = p.iddireccionenvio ? await direccionModel.findById(p.iddireccionenvio) : null;
  return {
    pedido: mapPedido(p),
    detalles,
    direccion: mapDireccion(direccion),
    metodoPago: "Pago contra entrega",
    resumen: totalsForDetalles(detalles)
  };
}

export async function listForTienda(idTienda) {
  const rows = await pedidoModel.listByTiendaVendedor(idTienda);
  return rows.map(mapPedido);
}

export async function updateEstado(idPedido, estado, idUsuario, roles = []) {
  const row = await pedidoModel.findById(idPedido);
  if (!row) throw new ApiError.NotFound("Pedido no encontrado");

  if (roles.includes("Vendedor") && !roles.includes("Administrador")) {
    const tienda = await tiendaModel.findByUsuario(idUsuario);
    if (!tienda) {
      throw new ApiError.Forbidden("No tienes una tienda asociada");
    }
    const detalles = await pedidoModel.listDetalle(idPedido);
    const pertenece = detalles.some((d) => d.idtienda === tienda.idtienda);
    if (!pertenece) {
      throw new ApiError.Forbidden("No puedes actualizar el estado de este pedido");
    }
  }

  const updatedRow = await pedidoModel.updateEstado(idPedido, estado);
  if (!updatedRow) throw new ApiError.NotFound("Pedido no encontrado");
  return mapPedido(updatedRow);
}
