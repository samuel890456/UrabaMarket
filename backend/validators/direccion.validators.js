import { z } from "zod";

export const direccionCreateSchema = z.object({
  direccion: z.string().min(1).max(255),
  ciudad: z.string().max(100).optional().default("Apartadó"),
  esPrincipal: z.boolean().optional().default(false)
});

export const direccionUpdateSchema = direccionCreateSchema.partial();
