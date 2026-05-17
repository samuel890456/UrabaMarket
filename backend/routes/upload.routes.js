import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { productoImageUpload } from "../utils/upload.js";
import { uploadProductoImagen } from "../controllers/upload.controller.js";

export const uploadRouter = Router();

// Subida de imágenes de productos minoristas y mayoristas
uploadRouter.post(
  "/productos",
  authenticate,
  authorize("Vendedor", "Proveedor"),
  productoImageUpload.single("file"),
  asyncHandler(uploadProductoImagen)
);
