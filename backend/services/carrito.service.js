import { carritoModel } from "../models/carrito.model.js";
import { productoModel } from "../models/producto.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapCarrito, mapItemCarrito, mapProducto } from "../utils/mappers.js";

async function obtenerOCrearActivo(idUsuario) {
  let carrito = await carritoModel.findActivoByUsuario(idUsuario);
  if (!carrito) {
    carrito = await carritoModel.createActivo(idUsuario);
  }
  return carrito;
}

export async function getCarritoCompleto(idUsuario) {
  const carrito = await obtenerOCrearActivo(idUsuario);
  const itemsRaw = await carritoModel.listItems(carrito.idcarrito);
  const items = [];
  for (const it of itemsRaw) {
    const prod = await productoModel.findById(it.idproducto);
    items.push({
      ...mapItemCarrito(it),
      producto: prod ? mapProducto(prod) : null
    });
  }
  const subtotal = itemsRaw.reduce(
    (acc, it) => acc + Number(it.preciofijado) * it.cantidad,
    0
  );
  return {
    carrito: mapCarrito(carrito),
    items,
    subtotal
  };
}

export async function addItem(idUsuario, { idProducto, cantidad, sumarCantidad }) {
  const carrito = await obtenerOCrearActivo(idUsuario);
  const prod = await productoModel.findById(idProducto);
  if (!prod || !prod.activo) {
    throw new ApiError.NotFound("Producto no disponible");
  }
  if (prod.stock < cantidad) {
    throw new ApiError.BadRequest("Stock insuficiente");
  }
  const precioFijado = Number(prod.precio);
  await carritoModel.upsertItem(
    {
      idCarrito: carrito.idcarrito,
      idProducto,
      cantidad,
      precioFijado,
      sumarCantidad
    }
  );
  return getCarritoCompleto(idUsuario);
}

export async function updateItemCantidad(idUsuario, idProducto, cantidad) {
  const carrito = await carritoModel.findActivoByUsuario(idUsuario);
  if (!carrito) throw new ApiError.NotFound("Carrito no encontrado");
  const prod = await productoModel.findById(idProducto);
  if (!prod) throw new ApiError.NotFound("Producto no encontrado");
  if (cantidad === 0) {
    await carritoModel.deleteItem(carrito.idcarrito, idProducto);
    return getCarritoCompleto(idUsuario);
  }
  if (prod.stock < cantidad) {
    throw new ApiError.BadRequest("Stock insuficiente");
  }
  await carritoModel.upsertItem({
    idCarrito: carrito.idcarrito,
    idProducto,
    cantidad,
    precioFijado: Number(prod.precio),
    sumarCantidad: false
  });
  return getCarritoCompleto(idUsuario);
}

export async function removeItem(idUsuario, idProducto) {
  const carrito = await carritoModel.findActivoByUsuario(idUsuario);
  if (!carrito) throw new ApiError.NotFound("Carrito no encontrado");
  await carritoModel.deleteItem(carrito.idcarrito, idProducto);
  return getCarritoCompleto(idUsuario);
}
