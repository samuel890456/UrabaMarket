import { z } from "zod";

const rolRegistro = z.enum(["Cliente", "Vendedor", "Proveedor"]);

export const registerSchema = z.discriminatedUnion("rol", [
  z.object({
    nombre: z.string().min(1, "Nombre requerido").max(100),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres").max(255),
    telefono: z.string().max(20).optional().nullable(),
    rol: z.literal("Cliente"),
    direccion: z.string().min(1).max(255).optional(),
    ciudad: z.string().max(100).optional(),
    esPrincipal: z.boolean().optional(),
  }),
  z.object({
    nombre: z.string().min(1, "Nombre del vendedor requerido").max(100),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres").max(255),
    telefono: z.string().max(20).optional().nullable(),
    rol: z.literal("Vendedor"),
    nombreTienda: z.string().min(1, "El nombre de la tienda es requerido").max(100),
    categoriaTienda: z.coerce.number().int().positive("La categoría de la tienda es requerida"),
    direccionTienda: z.string().min(1, "La dirección de la tienda es requerida").max(255),
  }),
  z.object({
    responsable: z.string().min(1, "Nombre del responsable requerido").max(100),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres").max(255),
    telefono: z.string().max(20).min(1, "El teléfono del proveedor es requerido").nullable(),
    rol: z.literal("Proveedor"),
    nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido").max(150),
    productosQueDistribuye: z.string().min(1, "Indica los productos que distribuyes").max(500),
  }),
]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
