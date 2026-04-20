import { Router } from "express";
import * as carritoController from "../controllers/carrito.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  carritoAddItemSchema,
  carritoItemParamsSchema,
  carritoUpdateItemSchema
} from "../validators/carrito.validators.js";

export const carritoRouter = Router();

carritoRouter.use(authenticate);

carritoRouter.get("/", asyncHandler(carritoController.get));
carritoRouter.post(
  "/items",
  validate({ body: carritoAddItemSchema }),
  asyncHandler(carritoController.addItem)
);
carritoRouter.patch(
  "/items/:idProducto",
  validate({ params: carritoItemParamsSchema, body: carritoUpdateItemSchema }),
  asyncHandler(carritoController.updateItem)
);
carritoRouter.delete(
  "/items/:idProducto",
  validate({ params: carritoItemParamsSchema }),
  asyncHandler(carritoController.removeItem)
);
