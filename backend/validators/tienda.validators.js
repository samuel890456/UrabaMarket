import { z } from "zod";

export const tiendaCreateSchema = z.object({
  idCategoria: z.coerce.number().int().positive().optional().nullable(),
  nombre: z.string().min(1).max(150),
  descripcion: z.string().optional().nullable(),
  direccion: z.string().max(255).optional().nullable(),
  logoUrl: z.string().max(255).optional().nullable(),
  bannerUrl: z.string().max(255).optional().nullable(),
  activo: z.boolean().optional().default(true)
});

export const tiendaUpdateSchema = z.object({
  idCategoria: z.coerce.number().int().positive().optional().nullable(),
  nombre: z.string().min(1).max(150).optional(),
  descripcion: z.string().optional().nullable(),
  direccion: z.string().max(255).optional().nullable(),
  logoUrl: z.string().max(255).optional().nullable(),
  bannerUrl: z.string().max(255).optional().nullable(),
  activo: z.boolean().optional()
});

export const listTiendasQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  idCategoria: z.coerce.number().int().positive().optional(),
  page: z.coerce.string().optional(),
  limit: z.coerce.string().optional()
});
