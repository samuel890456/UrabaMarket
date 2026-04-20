import { Router } from "express";
import * as compraProveedorController from "../controllers/compraProveedor.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  compraEstadoSchema,
  compraProveedorCreateSchema,
  idCompraParamsSchema
} from "../validators/compraProveedor.validators.js";

export const compraProveedorRouter = Router();

compraProveedorRouter.post(
  "/",
  authenticate,
  authorize("Vendedor"),
  validate({ body: compraProveedorCreateSchema }),
  asyncHandler(compraProveedorController.create)
);

compraProveedorRouter.get(
  "/mi-tienda",
  authenticate,
  authorize("Vendedor"),
  asyncHandler(compraProveedorController.listMineTienda)
);

compraProveedorRouter.get(
  "/mi-proveedor",
  authenticate,
  authorize("Proveedor"),
  asyncHandler(compraProveedorController.listMineProveedor)
);

compraProveedorRouter.get(
  "/:idCompra",
  authenticate,
  validate({ params: idCompraParamsSchema }),
  asyncHandler(compraProveedorController.getById)
);

compraProveedorRouter.patch(
  "/:idCompra/estado",
  authenticate,
  validate({ params: idCompraParamsSchema, body: compraEstadoSchema }),
  asyncHandler(compraProveedorController.updateEstado)
);
