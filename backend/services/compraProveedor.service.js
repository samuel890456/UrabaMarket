import { pool } from "../config/database.js";
import { compraProveedorModel } from "../models/compraProveedor.model.js";
import { productoMayoristaModel } from "../models/productoMayorista.model.js";
import { productoModel } from "../models/producto.model.js";
import { proveedorModel } from "../models/proveedor.model.js";
import { tiendaModel } from "../models/tienda.model.js";
import { inventarioModel } from "../models/inventario.model.js";
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

async function ensureCompraAccess(compra, idUsuario, roles = []) {
  if (!compra) throw new ApiError.NotFound("Compra a proveedor no encontrada");

  if (roles.includes("Administrador")) return;
  if (roles.includes("Proveedor") && compra.idusuarioproveedor === idUsuario) return;

  if (roles.includes("Vendedor")) {
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
      await inventarioModel.addMovimiento({
        idProducto: updated.idproducto,
        idTienda: tienda.idtienda,
        tipo: "ENTRADA_B2B",
        cantidad: detalle.cantidad,
        stockAnterior: Number(updated.stock_anterior ?? updated.stock - detalle.cantidad),
        stockNuevo: Number(updated.stock),
        referenciaTipo: "CompraProveedor",
        referenciaId: compra.idcompra,
        costoUnitario: detalle.preciomayoreo,
        nota: "Recepcion de compra B2B"
      }, db);
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
    await inventarioModel.addMovimiento({
      idProducto: creado.idproducto,
      idTienda: tienda.idtienda,
      tipo: "ENTRADA_B2B",
      cantidad: detalle.cantidad,
      stockAnterior: 0,
      stockNuevo: Number(creado.stock),
      referenciaTipo: "CompraProveedor",
      referenciaId: compra.idcompra,
      costoUnitario: detalle.preciomayoreo,
      nota: "Creacion de producto desde compra B2B"
    }, db);
    productos.push(mapProducto(creado));
  }

  return productos;
}

export async function crearDesdeTienda(idUsuarioVendedor, data) {
  const tienda = await tiendaModel.findByUsuario(idUsuarioVendedor);
  if (!tienda) throw new ApiError.BadRequest("El vendedor debe tener una tienda para comprar a proveedores");

  const items = data.items ?? [];
  if (!items.length) throw new ApiError.BadRequest("La compra debe tener productos");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`SELECT pg_advisory_xact_lock($1)`, [tienda.idtienda]);

    const productosMayoristas = [];
    for (const item of items) {
      const producto = await productoMayoristaModel.findByIdForUpdate(item.idProductoMayorista, client);
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

    const proveedor = await proveedorModel.findById(productosMayoristas[0].producto.idproveedor, client);
    if (!proveedor) throw new ApiError.BadRequest("Proveedor no encontrado para el catalogo mayorista");

    const abierta = await compraProveedorModel.findOpenByTiendaAndProveedor(tienda.idtienda, proveedor.idusuario, client);
    if (abierta) {
      throw new ApiError.Conflict(`Ya existe una solicitud abierta con este proveedor: compra #${abierta.idcompra}`);
    }

    const total = productosMayoristas.reduce(
      (sum, { producto, cantidad }) => sum + Number(producto.preciomayorista) * cantidad,
      0
    );

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
    return getById(compra.idcompra, idUsuarioVendedor, { roles: ["Vendedor"] });
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
    idProveedor: row.idproveedor,
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

export async function getById(idCompra, idUsuario, { roles }) {
  const compra = await compraProveedorModel.findById(idCompra);
  await ensureCompraAccess(compra, idUsuario, roles);
  const detalle = await compraProveedorModel.listDetalle(idCompra);
  return {
    compra: mapCompraProveedor(compra),
    detalles: detalle.map(mapDetalleCompraProveedor)
  };
}

export async function updateEstado(idCompra, estado, idUsuario, { roles }) {
  const compra = await compraProveedorModel.findById(idCompra);
  await ensureCompraAccess(compra, idUsuario, roles);

  if (!roles.includes("Administrador")) {
    const allowed = new Set();
    if (roles.includes("Vendedor")) {
      ["Cancelado", "Recibido"].forEach((item) => allowed.add(item));
    }
    if (roles.includes("Proveedor")) {
      ["Aceptado", "Rechazado", "Enviado", "Cancelado"].forEach((item) => allowed.add(item));
    }
    if (!allowed.has(estado)) {
      throw new ApiError.Forbidden("Estado no permitido para tus roles");
    }
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
