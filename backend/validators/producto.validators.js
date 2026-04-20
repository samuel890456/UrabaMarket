import { z } from "zod";

export const productoCreateSchema = z.object({
  idCategoria: z.coerce.number().int().positive().optional().nullable(),
  nombre: z.string().min(1).max(150),
  descripcion: z.string().optional().nullable(),
  precio: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative().optional().default(0),
  imagenPrincipal: z.string().max(255).optional().nullable(),
  activo: z.boolean().optional().default(true)
});

export const productoUpdateSchema = productoCreateSchema.partial();

export const productoSearchQuerySchema = z.object({
  q: z.string().optional(),
  idCategoria: z.coerce.number().int().positive().optional(),
  page: z.coerce.string().optional(),
  limit: z.coerce.string().optional()
});

export const idProductoParamsSchema = z.object({
  idProducto: z.coerce.number().int().positive()
});
