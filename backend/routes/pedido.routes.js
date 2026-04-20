import { Router } from "express";
import * as pedidoController from "../controllers/pedido.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkoutSchema, idPedidoParamsSchema, pedidoEstadoSchema } from "../validators/pedido.validators.js";

export const pedidoRouter = Router();

pedidoRouter.post(
  "/checkout",
  authenticate,
  authorize("Cliente"),
  validate({ body: checkoutSchema }),
  asyncHandler(pedidoController.checkout)
);

pedidoRouter.get("/", authenticate, authorize("Cliente"), asyncHandler(pedidoController.listMine));

pedidoRouter.get(
  "/tienda",
  authenticate,
  authorize("Vendedor"),
  asyncHandler(pedidoController.listTienda)
);

pedidoRouter.get(
  "/:idPedido",
  authenticate,
  validate({ params: idPedidoParamsSchema }),
  asyncHandler(pedidoController.getById)
);

pedidoRouter.patch(
  "/:idPedido/estado",
  authenticate,
  authorize("Administrador"),
  validate({ params: idPedidoParamsSchema, body: pedidoEstadoSchema }),
  asyncHandler(pedidoController.updateEstado)
);
