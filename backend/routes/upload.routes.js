import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { avatarImageUpload, productoImageUpload, tiendaImageUpload } from "../utils/upload.js";
import { uploadAvatarImagen, uploadProductoImagen, uploadTiendaImagen } from "../controllers/upload.controller.js";

export const uploadRouter = Router();

// Subida de imágenes de productos minoristas y mayoristas
uploadRouter.post(
  "/productos",
  authenticate,
  authorize("Vendedor", "Proveedor"),
  productoImageUpload.single("file"),
  asyncHandler(uploadProductoImagen)
);

uploadRouter.post(
  "/avatar",
  authenticate,
  avatarImageUpload.single("file"),
  asyncHandler(uploadAvatarImagen)
);

uploadRouter.post(
  "/tiendas",
  authenticate,
  authorize("Vendedor"),
  tiendaImageUpload.single("file"),
  asyncHandler(uploadTiendaImagen)
);
