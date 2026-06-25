import { z } from "zod";

const roleSchema = z.enum(["Cliente", "Vendedor", "Proveedor", "Administrador"]);

export const usuarioUpdateMeSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(255).optional(),
  telefono: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().max(255).optional().nullable()
});

export const usuarioAdminUpdateSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(255).optional(),
  telefono: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().max(255).optional().nullable(),
  rol: roleSchema.optional(),
  roles: z.array(roleSchema).optional(),
  activo: z.boolean().optional()
});

export const listUsuariosQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  rol: roleSchema.optional(),
  page: z.coerce.string().optional(),
  limit: z.coerce.string().optional()
});

export const idUsuarioParamsSchema = z.object({
  idUsuario: z.coerce.number().int().positive()
});
