import { Router } from "express";
import * as tiendaController from "../controllers/tienda.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { z } from "zod";
import { listTiendasQuerySchema, tiendaCreateSchema, tiendaUpdateSchema } from "../validators/tienda.validators.js";

const idTiendaParamsSchema = z.object({
  idTienda: z.coerce.number().int().positive()
});

export const tiendaRouter = Router();

tiendaRouter.get("/", validate({ query: listTiendasQuerySchema }), asyncHandler(tiendaController.listPublic));

tiendaRouter.get(
  "/mine",
  authenticate,
  authorize("Vendedor"),
  asyncHandler(tiendaController.getMine)
);

tiendaRouter.post(
  "/",
  authenticate,
  authorize("Vendedor"),
  validate({ body: tiendaCreateSchema }),
  asyncHandler(tiendaController.create)
);

tiendaRouter.patch(
  "/:idTienda/admin",
  authenticate,
  authorize("Administrador"),
  validate({ params: idTiendaParamsSchema, body: tiendaUpdateSchema }),
  asyncHandler(tiendaController.updateAdmin)
);

tiendaRouter.get(
  "/:idTienda",
  validate({ params: idTiendaParamsSchema }),
  asyncHandler(tiendaController.getById)
);

tiendaRouter.patch(
  "/:idTienda",
  authenticate,
  authorize("Vendedor"),
  validate({ params: idTiendaParamsSchema, body: tiendaUpdateSchema }),
  asyncHandler(tiendaController.updateOwn)
);
