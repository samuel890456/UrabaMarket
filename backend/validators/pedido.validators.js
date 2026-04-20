import { z } from "zod";

export const checkoutSchema = z.object({
  idDireccionEnvio: z.coerce.number().int().positive()
});

export const pedidoEstadoSchema = z.object({
  estado: z.enum(["Pendiente", "Pagado", "En Proceso", "Completado", "Cancelado"])
});

export const idPedidoParamsSchema = z.object({
  idPedido: z.coerce.number().int().positive()
});
