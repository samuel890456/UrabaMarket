import { z } from "zod";

export const carritoAddItemSchema = z.object({
  idProducto: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().positive(),
  sumarCantidad: z.boolean().optional().default(true)
});

export const carritoUpdateItemSchema = z.object({
  cantidad: z.coerce.number().int().nonnegative()
});

export const carritoItemParamsSchema = z.object({
  idProducto: z.coerce.number().int().positive()
});
