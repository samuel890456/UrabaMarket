import { Router } from "express";
import * as resenaController from "../controllers/resena.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { resenaCreateSchema, resenaListQuerySchema } from "../validators/resena.validators.js";

export const resenaRouter = Router();

resenaRouter.get(
  "/",
  validate({ query: resenaListQuerySchema }),
  asyncHandler(resenaController.listByProducto)
);

resenaRouter.post(
  "/",
  authenticate,
  validate({ body: resenaCreateSchema }),
  asyncHandler(resenaController.create)
);
