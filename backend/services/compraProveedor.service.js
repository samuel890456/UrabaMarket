import { pool } from "../config/database.js";
import { compraProveedorModel } from "../models/compraProveedor.model.js";
import { productoMayoristaModel } from "../models/productoMayorista.model.js";
import { productoModel } from "../models/producto.model.js";
import { proveedorModel } from "../models/proveedor.model.js";
import { tiendaModel } from "../models/tienda.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  mapCompraProveedor,
  mapDetalleCompraProveedor,
  mapProducto
} from "../utils/mappers.js";

function assertTransition(actual, siguiente) {
  const transitions = {
    Pendiente: ["Aceptado", "Rechazado", "Cancelado"],
    Aceptado: ["Enviado", "Cancelado"],
    Enviado: ["Recibido"],
    Rechazado: [],
    Recibido: [],
    Cancelado: []
  };
  if (!transitions[actual]?.includes(siguiente)) {
    throw new ApiError.BadRequest(`No se puede cambiar una compra ${actual} a ${siguiente}`);
  }
}

async function ensureCompraAccess(compra, idUsuario, rol) {
  if (!compra) throw new ApiError.NotFound("Compra a proveedor no encontrada");

  if (rol === "Administrador") return;
  if (rol === "Proveedor" && compra.idusuarioproveedor === idUsuario) return;

  if (rol === "Vendedor") {
    const tienda = await tiendaModel.findByUsuario(idUsuario);
    if (tienda && compra.idtienda === tienda.idtienda) return;
  }

  throw new ApiError.Forbidden("No tienes permiso para esta compra B2B");
}

async function stockToTienda(compra, db) {
  const tienda = await tiendaModel.findById(compra.idtienda, db);
  const detalles = await compraProveedorModel.listDetalle(compra.idcompra, db);

  for (const detalle of detalles) {
    const mayorista = await productoMayoristaModel.findById(detalle.idproductomayorista, db);
    if (!mayorista || !mayorista.activo) {
      throw new ApiError.BadRequest(`El producto mayorista ${detalle.idproductomayorista} ya no esta disponible`);
    }
    if (mayorista.stockmayorista < detalle.cantidad) {
      throw new ApiError.BadRequest(`Stock insuficiente para ${mayorista.nombre}`);
    }
  }

  const productos = [];
  for (const detalle of detalles) {
    const mayorista = await productoMayoristaModel.findById(detalle.idproductomayorista, db);
    const stockMayorista = await productoMayoristaModel.adjustStockMayorista(
      detalle.idproductomayorista,
      -detalle.cantidad,
      db
    );
    if (!stockMayorista) throw new ApiError.BadRequest(`Stock insuficiente para ${mayorista.nombre}`);

    const existente = await productoModel.findByWholesaleProductAndTienda(
      detalle.idproductomayorista,
      tienda.idtienda,
      db
    );

    if (existente) {
      const updated = await productoModel.adjustStock(existente.idproducto, detalle.cantidad, db);
      productos.push(mapProducto(updated));
      continue;
    }

    const precioCosto = Number(detalle.preciomayoreo);
    const precioVenta = Math.round(precioCosto * 1.35);
    const creado = await productoModel.create(
      {
        idTienda: tienda.idtienda,
        idCategoria: mayorista.idcategoria,
        idProveedor: mayorista.idproveedor,
        idProductoMayorista: mayorista.idproductomayorista,
        nombre: mayorista.nombre,
        descripcion: mayorista.descripcion,
        precio: precioVenta,
        precioCosto,
        stock: detalle.cantidad,
        imagenPrincipal: mayorista.imagenprincipal,
        marca: mayorista.marca,
        iva: mayorista.ivamayorista,
        fechaVencimiento: mayorista.fechavencimiento,
        activo: true
      },
      db
    );
    productos.push(mapProducto(creado));
  }

  return productos;
}

export async function crearDesdeTienda(idUsuarioVendedor, data) {
  const tienda = await tiendaModel.findByUsuario(idUsuarioVendedor);
  if (!tienda) throw new ApiError.BadRequest("El vendedor debe tener una tienda para comprar a proveedores");

  const items = data.items ?? [];
  if (!items.length) throw new ApiError.BadRequest("La compra debe tener productos");

  const productosMayoristas = [];
  for (const item of items) {
    const producto = await productoMayoristaModel.findById(item.idProductoMayorista);
    if (!producto || !producto.activo) {
      throw new ApiError.NotFound(`Producto mayorista ${item.idProductoMayorista} no disponible`);
    }
    if (producto.stockmayorista < item.cantidad) {
      throw new ApiError.BadRequest(`Stock insuficiente para ${producto.nombre}`);
    }
    productosMayoristas.push({ producto, cantidad: item.cantidad });
  }

  const proveedores = new Set(productosMayoristas.map(({ producto }) => producto.idproveedor));
  if (proveedores.size !== 1) {
    throw new ApiError.BadRequest("Cada compra B2B debe pertenecer a un solo proveedor");
  }

  const proveedor = await proveedorModel.findById(productosMayoristas[0].producto.idproveedor);
  if (!proveedor) throw new ApiError.BadRequest("Proveedor no encontrado para el catalogo mayorista");

  const total = productosMayoristas.reduce(
    (sum, { producto, cantidad }) => sum + Number(producto.preciomayorista) * cantidad,
    0
  );

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const compra = await compraProveedorModel.create(
      {
        idTienda: tienda.idtienda,
        idUsuarioProveedor: proveedor.idusuario,
        total,
        estado: "Pendiente"
      },
      client
    );

    for (const { producto, cantidad } of productosMayoristas) {
      await compraProveedorModel.addDetalle(
        {
          idCompra: compra.idcompra,
          idProductoMayorista: producto.idproductomayorista,
          cantidad,
          precioMayoreo: producto.preciomayorista
        },
        client
      );
    }
    await client.query("COMMIT");
    return getById(compra.idcompra, idUsuarioVendedor, { rol: "Vendedor" });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listForTienda(idUsuarioVendedor) {
  const tienda = await tiendaModel.findByUsuario(idUsuarioVendedor);
  if (!tienda) return [];
  const rows = await compraProveedorModel.listByTienda(tienda.idtienda);
  return rows.map((row) => ({
    ...mapCompraProveedor(row),
    nombreProveedor: row.nombre_proveedor,
    emailProveedor: row.email_proveedor
  }));
}

export async function listForProveedor(idUsuarioProveedor) {
  const { rows } = await compraProveedorModel.listByProveedor(idUsuarioProveedor, {
    limit: 100,
    offset: 0
  });
  return rows.map((row) => ({
    ...mapCompraProveedor(row),
    nombreTienda: row.nombre_tienda,
    nombreComprador: row.nombre_comprador,
    emailComprador: row.email_comprador
  }));
}

export async function getById(idCompra, idUsuario, { rol }) {
  const compra = await compraProveedorModel.findById(idCompra);
  await ensureCompraAccess(compra, idUsuario, rol);
  const detalle = await compraProveedorModel.listDetalle(idCompra);
  return {
    compra: mapCompraProveedor(compra),
    detalles: detalle.map(mapDetalleCompraProveedor)
  };
}

export async function updateEstado(idCompra, estado, idUsuario, { rol }) {
  const compra = await compraProveedorModel.findById(idCompra);
  await ensureCompraAccess(compra, idUsuario, rol);

  if (rol === "Vendedor" && !["Cancelado", "Recibido"].includes(estado)) {
    throw new ApiError.Forbidden("El vendedor solo puede cancelar o marcar recibido");
  }
  if (rol === "Proveedor" && !["Aceptado", "Rechazado", "Enviado", "Cancelado"].includes(estado)) {
    throw new ApiError.Forbidden("Estado no permitido para proveedor");
  }

  assertTransition(compra.estado, estado);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let productosTienda = [];
    if (estado === "Recibido") {
      productosTienda = await stockToTienda(compra, client);
    }
    const updated = await compraProveedorModel.updateEstado(idCompra, estado, client);
    await client.query("COMMIT");
    return {
      compra: mapCompraProveedor(updated),
      productosTienda
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
