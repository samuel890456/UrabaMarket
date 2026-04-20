import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  idUsuarioParamsSchema,
  listUsuariosQuerySchema,
  usuarioAdminUpdateSchema,
  usuarioUpdateMeSchema
} from "../validators/usuario.validators.js";

export const usuarioRouter = Router();

usuarioRouter.get("/me", authenticate, asyncHandler(usuarioController.getMe));
usuarioRouter.patch(
  "/me",
  authenticate,
  validate({ body: usuarioUpdateMeSchema }),
  asyncHandler(usuarioController.updateMe)
);

usuarioRouter.get(
  "/",
  authenticate,
  authorize("Administrador"),
  validate({ query: listUsuariosQuerySchema }),
  asyncHandler(usuarioController.list)
);
usuarioRouter.get(
  "/:idUsuario",
  authenticate,
  authorize("Administrador"),
  validate({ params: idUsuarioParamsSchema }),
  asyncHandler(usuarioController.getById)
);
usuarioRouter.patch(
  "/:idUsuario",
  authenticate,
  authorize("Administrador"),
  validate({ params: idUsuarioParamsSchema, body: usuarioAdminUpdateSchema }),
  asyncHandler(usuarioController.updateAdmin)
);
