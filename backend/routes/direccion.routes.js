import { Router } from "express";
import * as direccionController from "../controllers/direccion.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { z } from "zod";
import { direccionCreateSchema, direccionUpdateSchema } from "../validators/direccion.validators.js";

const idDireccionParamsSchema = z.object({
  idDireccion: z.coerce.number().int().positive()
});

export const direccionRouter = Router();

direccionRouter.use(authenticate);

direccionRouter.get("/", asyncHandler(direccionController.list));
direccionRouter.post(
  "/",
  validate({ body: direccionCreateSchema }),
  asyncHandler(direccionController.create)
);
direccionRouter.patch(
  "/:idDireccion",
  validate({ params: idDireccionParamsSchema, body: direccionUpdateSchema }),
  asyncHandler(direccionController.update)
);
direccionRouter.delete(
  "/:idDireccion",
  validate({ params: idDireccionParamsSchema }),
  asyncHandler(direccionController.remove)
);
