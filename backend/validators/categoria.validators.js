import { z } from "zod";

export const categoriaCreateSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().optional().nullable(),
  activo: z.boolean().optional().default(true)
});

export const categoriaUpdateSchema = categoriaCreateSchema.partial();
