import { z } from "zod";

const itemSchema = z.object({
  idProductoMayorista: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().positive()
});

export const compraProveedorCreateSchema = z.object({
  items: z.array(itemSchema).min(1)
});

export const compraEstadoSchema = z.object({
  estado: z.enum(["Aceptado", "Rechazado", "Enviado", "Recibido", "Cancelado"])
});

export const idCompraParamsSchema = z.object({
  idCompra: z.coerce.number().int().positive()
});
