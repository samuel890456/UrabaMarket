import { Router } from "express";
import * as proveedorController from "../controllers/proveedor.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const proveedorRouter = Router();

proveedorRouter.get("/", authenticate, authorize("Vendedor", "Administrador"), asyncHandler(proveedorController.listProveedores));
proveedorRouter.get(
  "/catalogo-mayorista",
  authenticate,
  authorize("Vendedor", "Administrador"),
  asyncHandler(proveedorController.getCatalogoMayorista)
);

// Routes for Suppliers (Proveedor role)
proveedorRouter.use(authenticate, authorize("Proveedor"));

// ProductMayorista management (Supplier's wholesale catalog)
proveedorRouter.get("/productos-mayoristas/mis-productos", asyncHandler(proveedorController.getMisProductosMayoristas));
proveedorRouter.post("/productos-mayoristas", asyncHandler(proveedorController.postProductoMayorista));
proveedorRouter.get("/productos-mayoristas/:idProductoMayorista", asyncHandler(proveedorController.getProductoMayorista));
proveedorRouter.patch("/productos-mayoristas/:idProductoMayorista", asyncHandler(proveedorController.patchProductoMayorista));
proveedorRouter.delete("/productos-mayoristas/:idProductoMayorista", asyncHandler(proveedorController.deleteProductoMayorista));
proveedorRouter.patch("/productos-mayoristas/:idProductoMayorista/stock", asyncHandler(proveedorController.patchProductoMayoristaStock));

// CompraProveedor management (Supplier's view of orders from stores)
proveedorRouter.get("/compras-tienda", asyncHandler(proveedorController.getSupplierOrders));
proveedorRouter.get("/compras-tienda/:idCompra", asyncHandler(proveedorController.getSupplierOrder));
proveedorRouter.patch("/compras-tienda/:idCompra/estado", asyncHandler(proveedorController.patchSupplierOrderStatus));
