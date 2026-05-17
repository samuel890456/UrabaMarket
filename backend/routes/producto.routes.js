import { Router } from "express";
import * as productoController from "../controllers/producto.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { z } from "zod";
import {
  idProductoParamsSchema,
  productoCreateSchema,
  productoSearchQuerySchema,
  productoUpdateSchema
} from "../validators/producto.validators.js";

const idTiendaParamsSchema = z.object({
  idTienda: z.coerce.number().int().positive()
});

const daysQuerySchema = z.object({
  days: z.coerce.number().int().positive().optional()
});

export const productoRouter = Router();

productoRouter.get(
  "/",
  validate({ query: productoSearchQuerySchema }),
  asyncHandler(productoController.search)
);

productoRouter.get(
  "/tienda/:idTienda",
  validate({ params: idTiendaParamsSchema }),
  asyncHandler(productoController.listByTienda)
);

productoRouter.get(
  "/mios",
  authenticate,
  authorize("Vendedor"),
  asyncHandler(productoController.listMine)
);

productoRouter.get(
  "/low-stock",
  authenticate,
  authorize("Vendedor"),
  asyncHandler(productoController.listLowStock)
);

productoRouter.get(
  "/expired",
  authenticate,
  authorize("Vendedor"),
  asyncHandler(productoController.listExpired)
);

productoRouter.get(
  "/soon-to-expire",
  authenticate,
  authorize("Vendedor"),
  validate({ query: daysQuerySchema }),
  asyncHandler(productoController.listSoonToExpire)
);


productoRouter.get(
  "/:idProducto",
  validate({ params: idProductoParamsSchema }),
  asyncHandler(productoController.getById)
);

productoRouter.post(
  "/",
  authenticate,
  authorize("Vendedor"),
  validate({ body: productoCreateSchema }),
  asyncHandler(productoController.create)
);

productoRouter.patch(
  "/:idProducto",
  authenticate,
  authorize("Vendedor"),
  validate({ params: idProductoParamsSchema, body: productoUpdateSchema }),
  asyncHandler(productoController.update)
);

productoRouter.delete(
  "/:idProducto",
  authenticate,
  authorize("Vendedor"),
  validate({ params: idProductoParamsSchema }),
  asyncHandler(productoController.remove)
);