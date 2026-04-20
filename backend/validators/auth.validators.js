import { z } from "zod";

const rolRegistro = z.enum(["Cliente", "Vendedor", "Proveedor"]);

export const registerSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(100),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Minimo 6 caracteres").max(255),
  telefono: z.string().max(20).optional().nullable(),
  rol: rolRegistro.optional().default("Cliente")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
