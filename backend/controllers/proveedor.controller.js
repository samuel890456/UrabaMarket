import { z } from "zod";
import * as proveedorService from "../services/proveedor.service.js";
import { ApiError } from "../utils/ApiError.js";

// Zod schemas for validation
const createProductoMayoristaSchema = z.object({
  idCategoria: z.coerce.number().int().positive().optional().nullable(),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional().nullable(),
  precioMayorista: z.coerce.number().nonnegative("El precio mayorista no puede ser negativo"),
  stockMayorista: z.coerce.number().int().nonnegative("El stock mayorista no puede ser negativo o decimal"),
  marca: z.string().optional().nullable(),
  ivaMayorista: z.coerce.number().min(0).max(100).optional().nullable(),
  fechaVencimiento: z.string().optional().nullable(),
  imagenPrincipal: z.string().max(255).optional().nullable(),
  tipoProducto: z.enum(["General", "Alimento", "Medicamento", "Cosmetico", "Limpieza", "Perecedero", "Tecnologia", "Ropa", "Hogar"]).optional().default("General"),
  lote: z.string().max(80).optional().nullable(),
  fechaFabricacion: z.string().optional().nullable(),
  garantiaMeses: z.coerce.number().int().nonnegative().optional().nullable(),
  vidaUtilMeses: z.coerce.number().int().nonnegative().optional().nullable(),
  modelo: z.string().max(120).optional().nullable(),
  compatibilidad: z.string().max(255).optional().nullable(),
  numeroSerie: z.string().max(120).optional().nullable(),
  activo: z.boolean().optional().default(true),
});

const updateProductoMayoristaSchema = createProductoMayoristaSchema.partial(); // All fields are optional for update

const adjustStockSchema = z.object({
  delta: z.coerce.number().int().refine(val => val !== 0, "El cambio de stock no puede ser cero"),
});

const updateOrderStatusSchema = z.object({
  estado: z.enum(["Aceptado", "Rechazado", "Enviado", "Recibido", "Cancelado"], {
    message: "Estado de orden de compra inválido",
  }),
});


export async function listProveedores(req, res) {
  const data = await proveedorService.listAllProveedores();
  res.json({ ok: true, data });
}

export async function getCatalogoMayorista(req, res) {
  const data = await proveedorService.listCatalogoMayorista(req.query);
  res.json({ ok: true, data });
}

// ProductoMayorista Controllers
export async function postProductoMayorista(req, res) {
  const idProveedor = req.user.idUsuario; // Authenticated supplier ID
  const validatedData = createProductoMayoristaSchema.parse(req.body);
  const data = await proveedorService.createProductoMayorista(idProveedor, validatedData);
  res.status(201).json({ ok: true, data });
}

export async function patchProductoMayorista(req, res) {
  const idProveedor = req.user.idUsuario;
  const idProductoMayorista = Number(req.params.idProductoMayorista);
  const validatedData = updateProductoMayoristaSchema.parse(req.body);
  const data = await proveedorService.updateProductoMayorista(idProductoMayorista, validatedData, idProveedor);
  res.json({ ok: true, data });
}

export async function deleteProductoMayorista(req, res) {
  const idProveedor = req.user.idUsuario;
  const idProductoMayorista = Number(req.params.idProductoMayorista);
  const data = await proveedorService.removeProductoMayorista(idProductoMayorista, idProveedor);
  res.json({ ok: true, data });
}

export async function getProductoMayorista(req, res) {
  const idProductoMayorista = Number(req.params.idProductoMayorista);
  const data = await proveedorService.getProductoMayoristaById(idProductoMayorista);
  res.json({ ok: true, data });
}

export async function getMisProductosMayoristas(req, res) {
  const idProveedor = req.user.idUsuario;
  const data = await proveedorService.listMisProductosMayoristas(idProveedor, req.query);
  res.json({ ok: true, data });
}

export async function patchProductoMayoristaStock(req, res) {
  const idProveedor = req.user.idUsuario;
  const idProductoMayorista = Number(req.params.idProductoMayorista);
  const { delta } = adjustStockSchema.parse(req.body);
  const data = await proveedorService.adjustProductoMayoristaStock(idProductoMayorista, delta, idProveedor);
  res.json({ ok: true, data });
}

// CompraProveedor Controllers (Supplier's View)
export async function getSupplierOrders(req, res) {
  const idUsuarioProveedor = req.user.idUsuario;
  const data = await proveedorService.listSupplierOrders(idUsuarioProveedor, req.query);
  res.json({ ok: true, data });
}

export async function getSupplierOrder(req, res) {
  const idUsuarioProveedor = req.user.idUsuario;
  const idCompra = Number(req.params.idCompra);
  const data = await proveedorService.getSupplierOrderById(idCompra, idUsuarioProveedor);
  res.json({ ok: true, data });
}

export async function patchSupplierOrderStatus(req, res) {
  const idUsuarioProveedor = req.user.idUsuario;
  const idCompra = Number(req.params.idCompra);
  const { estado } = updateOrderStatusSchema.parse(req.body);
  const data = await proveedorService.updateSupplierOrderStatus(idCompra, estado, idUsuarioProveedor);
  res.json({ ok: true, data });
}
