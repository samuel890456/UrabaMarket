import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("Administrador"));

adminRouter.get("/estadisticas", asyncHandler(adminController.estadisticas));
adminRouter.get("/tiendas", asyncHandler(adminController.listTiendas));
adminRouter.get("/productos", asyncHandler(adminController.listProductos));
