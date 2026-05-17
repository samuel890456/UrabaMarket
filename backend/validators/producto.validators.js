import { z } from "zod";

export const productoCreateSchema = z.object({
  idCategoria: z.coerce.number().int().positive().optional().nullable(),
  nombre: z.string().min(1).max(150),
  descripcion: z.string().optional().nullable(),
  precio: z.coerce.number().nonnegative(),
  precioCosto: z.coerce.number().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().nonnegative().optional().default(0),
  imagenPrincipal: z.string().max(255).optional().nullable(),
  marca: z.string().max(100).optional().nullable(),
  iva: z.coerce.number().min(0).max(100).optional().nullable(),
  fechaVencimiento: z.string().optional().nullable(),
  idProveedor: z.coerce.number().int().positive().optional().nullable(),
  idProductoMayorista: z.coerce.number().int().positive().optional().nullable(),
  stockMinimo: z.coerce.number().int().nonnegative().optional().default(0),
  promociones: z.string().max(255).optional().nullable(),
  descuento: z.coerce.number().min(0).max(100).optional().nullable(),
  activo: z.boolean().optional().default(true)
});

export const productoUpdateSchema = productoCreateSchema.partial();

export const productoSearchQuerySchema = z.object({
  q: z.string().optional(),
  idCategoria: z.coerce.number().int().positive().optional(),
  marca: z.string().optional(),
  minPrecio: z.coerce.number().nonnegative().optional(),
  maxPrecio: z.coerce.number().nonnegative().optional(),
  sortBy: z.enum(['idProducto', 'precio', 'popularidad', 'vendidos', 'masRecientes', 'createdAt']).optional().default('idProducto'),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  page: z.coerce.string().optional(),
  limit: z.coerce.string().optional()
});

export const idProductoParamsSchema = z.object({
  idProducto: z.coerce.number().int().positive()
});
