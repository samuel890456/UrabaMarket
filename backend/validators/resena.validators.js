import { z } from "zod";

export const resenaCreateSchema = z.object({
  idProducto: z.coerce.number().int().positive(),
  puntuacion: z.coerce.number().int().min(1).max(5),
  comentario: z.string().optional().nullable()
});

export const resenaListQuerySchema = z.object({
  idProducto: z.coerce.number().int().positive()
});
