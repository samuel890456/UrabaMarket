import { z } from "zod";

const itemSchema = z.object({
  idProductoVinculado: z.coerce.number().int().positive().optional().nullable(),
  nombreItem: z.string().max(150).optional().nullable(),
  cantidad: z.coerce.number().int().positive(),
  precioMayoreo: z.coerce.number().nonnegative()
});

export const compraProveedorCreateSchema = z.object({
  idUsuarioProveedor: z.coerce.number().int().positive(),
  items: z.array(itemSchema).min(1)
});

export const compraEstadoSchema = z.object({
  estado: z.enum(["Pendiente", "Recibido", "Cancelado"])
});

export const idCompraParamsSchema = z.object({
  idCompra: z.coerce.number().int().positive()
});
