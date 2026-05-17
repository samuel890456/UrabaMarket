import { pool } from "../config/database.js";
import { carritoModel } from "../models/carrito.model.js";
import { productoModel } from "../models/producto.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapCarrito, mapItemCarrito, mapProducto } from "../utils/mappers.js";

const IVA_RATE = 0.19;

function getProductoPrecio(producto) {
  return Number(producto?.precio ?? producto?.precioventa ?? 0);
}

function buildTotals(items) {
  const total = items
    .filter((item) => item.disponible)
    .reduce((acc, item) => acc + Number(item.precioActual ?? 0) * Number(item.cantidad ?? 0), 0);
  const subtotal = Math.round(total / (1 + IVA_RATE));
  const iva = total - subtotal;
  return { subtotal, iva, envio: 0, total };
}

function buildCartItem(itemRaw, productoRaw) {
  const base = mapItemCarrito(itemRaw);
  if (!productoRaw) {
    return {
      ...base,
      producto: null,
      disponible: false,
      agotado: true,
      eliminado: true,
      stockDisponible: 0,
      precioActual: 0,
      precioCambio: false,
      subtotalLinea: 0,
      mensaje: "Este producto ya no existe y debe retirarse del carrito."
    };
  }

  const producto = mapProducto(productoRaw);
  const precioActual = getProductoPrecio(productoRaw);
  const precioFijado = Number(itemRaw.preciofijado);
  const stockDisponible = Number(productoRaw.stock ?? 0);
  const activo = Boolean(productoRaw.activo);
  const cantidad = Number(itemRaw.cantidad ?? 0);
  const stockInsuficiente = stockDisponible < cantidad;
  const agotado = stockDisponible <= 0;
  const precioCambio = precioFijado !== precioActual;
  const disponible = activo && !agotado && !stockInsuficiente && cantidad > 0;

  return {
    ...base,
    precioFijado,
    producto,
    disponible,
    agotado,
    eliminado: false,
    stockDisponible,
    precioActual,
    precioCambio,
    subtotalLinea: disponible ? precioActual * cantidad : 0,
    mensaje: !activo
      ? "Este producto ya no está disponible."
      : agotado
        ? "Producto agotado."
        : stockInsuficiente
          ? `Solo quedan ${stockDisponible} unidades disponibles.`
          : precioCambio
            ? "El precio cambió y se actualizó para checkout."
            : null
  };
}

async function obtenerOCrearActivo(idUsuario, db = pool) {
  let carrito = await carritoModel.findActivoByUsuario(idUsuario, db);
  if (!carrito) {
    carrito = await carritoModel.createActivo(idUsuario, db);
  }
  return carrito;
}

export async function getCarritoCompleto(idUsuario) {
  const carrito = await obtenerOCrearActivo(idUsuario);
  const itemsRaw = await carritoModel.listItems(carrito.idcarrito);
  const items = [];

  for (const item of itemsRaw) {
    const producto = await productoModel.findById(item.idproducto);
    items.push(buildCartItem(item, producto));
  }

  const totals = buildTotals(items);
  return {
    carrito: mapCarrito(carrito),
    items,
    ...totals,
    tieneProblemas: items.some((item) => !item.disponible || item.precioCambio)
  };
}

export async function addItem(idUsuario, { idProducto, cantidad, sumarCantidad = true }) {
  const requestedQty = Number(cantidad);
  if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
    throw new ApiError.BadRequest("La cantidad debe ser mayor a cero");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const carrito = await obtenerOCrearActivo(idUsuario, client);
    const producto = await productoModel.findByIdForUpdate(idProducto, client);
    if (!producto || !producto.activo) {
      throw new ApiError.BadRequest("Producto no disponible");
    }
    if (Number(producto.stock ?? 0) <= 0) {
      throw new ApiError.BadRequest("Producto agotado");
    }

    const currentItem = await carritoModel.findItem(carrito.idcarrito, idProducto, client);
    const nextQty = sumarCantidad && currentItem
      ? Number(currentItem.cantidad) + requestedQty
      : requestedQty;

    if (Number(producto.stock ?? 0) < nextQty) {
      throw new ApiError.BadRequest(`Stock insuficiente. Solo quedan ${producto.stock} unidades de ${producto.nombre}`);
    }

    await carritoModel.upsertItem(
      {
        idCarrito: carrito.idcarrito,
        idProducto,
        cantidad: requestedQty,
        precioFijado: getProductoPrecio(producto),
        sumarCantidad
      },
      client
    );
    await client.query("COMMIT");
    return getCarritoCompleto(idUsuario);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateItemCantidad(idUsuario, idProducto, cantidad) {
  const nextQty = Number(cantidad);
  if (!Number.isInteger(nextQty) || nextQty < 0) {
    throw new ApiError.BadRequest("La cantidad no puede ser negativa");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const carrito = await carritoModel.findActivoByUsuarioForUpdate(idUsuario, client);
    if (!carrito) throw new ApiError.NotFound("Carrito no encontrado");

    if (nextQty === 0) {
      await carritoModel.deleteItem(carrito.idcarrito, idProducto, client);
      await client.query("COMMIT");
      return getCarritoCompleto(idUsuario);
    }

    const producto = await productoModel.findByIdForUpdate(idProducto, client);
    if (!producto || !producto.activo) {
      throw new ApiError.BadRequest("Producto no disponible");
    }
    if (Number(producto.stock ?? 0) < nextQty) {
      throw new ApiError.BadRequest(`Stock insuficiente. Solo quedan ${producto.stock} unidades de ${producto.nombre}`);
    }

    await carritoModel.upsertItem(
      {
        idCarrito: carrito.idcarrito,
        idProducto,
        cantidad: nextQty,
        precioFijado: getProductoPrecio(producto),
        sumarCantidad: false
      },
      client
    );
    await client.query("COMMIT");
    return getCarritoCompleto(idUsuario);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removeItem(idUsuario, idProducto) {
  const carrito = await carritoModel.findActivoByUsuario(idUsuario);
  if (!carrito) throw new ApiError.NotFound("Carrito no encontrado");
  await carritoModel.deleteItem(carrito.idcarrito, idProducto);
  return getCarritoCompleto(idUsuario);
}

export async function clearCart(idUsuario) {
  const carrito = await carritoModel.findActivoByUsuario(idUsuario);
  if (!carrito) {
    return getCarritoCompleto(idUsuario);
  }
  await carritoModel.clearItems(carrito.idcarrito);
  return getCarritoCompleto(idUsuario);
}
