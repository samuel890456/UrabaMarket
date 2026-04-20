import { Router } from "express";
import * as categoriaController from "../controllers/categoria.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { z } from "zod";
import { categoriaCreateSchema, categoriaUpdateSchema } from "../validators/categoria.validators.js";

const idCategoriaParamsSchema = z.object({
  idCategoria: z.coerce.number().int().positive()
});

export const categoriaRouter = Router();

categoriaRouter.get("/", asyncHandler(categoriaController.listPublic));
categoriaRouter.get(
  "/todas",
  authenticate,
  authorize("Administrador"),
  validate({ query: z.object({ page: z.coerce.string().optional(), limit: z.coerce.string().optional() }) }),
  asyncHandler(categoriaController.listAdmin)
);
categoriaRouter.get(
  "/:idCategoria",
  validate({ params: idCategoriaParamsSchema }),
  asyncHandler(categoriaController.getById)
);
categoriaRouter.post(
  "/",
  authenticate,
  authorize("Administrador"),
  validate({ body: categoriaCreateSchema }),
  asyncHandler(categoriaController.create)
);
categoriaRouter.patch(
  "/:idCategoria",
  authenticate,
  authorize("Administrador"),
  validate({ params: idCategoriaParamsSchema, body: categoriaUpdateSchema }),
  asyncHandler(categoriaController.update)
);
