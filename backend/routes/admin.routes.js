import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("Administrador"));

adminRouter.get("/estadisticas", asyncHandler(adminController.estadisticas));
adminRouter.get("/tiendas", asyncHandler(adminController.listTiendas));
adminRouter.get("/productos", asyncHandler(adminController.listProductos));
adminRouter.get("/pedidos", asyncHandler(adminController.listPedidos));
adminRouter.get("/pedidos/:idPedido", asyncHandler(adminController.getOrderDetailsAdmin));
adminRouter.get("/compras-proveedor", asyncHandler(adminController.listComprasProveedor));
adminRouter.get("/compras-proveedor/:idCompra", asyncHandler(adminController.getSupplierPurchaseDetailsAdmin)); // New route

adminRouter.get("/users/:idUsuario", asyncHandler(adminController.getUserDetailsAdmin));
adminRouter.patch("/users/:idUsuario", asyncHandler(adminController.patchUserAdmin));
