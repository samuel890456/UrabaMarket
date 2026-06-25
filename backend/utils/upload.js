import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const PRODUCTOS_DIR = path.join(UPLOAD_ROOT, "productos");
const AVATARES_DIR = path.join(UPLOAD_ROOT, "avatares");
const TIENDAS_DIR = path.join(UPLOAD_ROOT, "tiendas");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

ensureDir(PRODUCTOS_DIR);
ensureDir(AVATARES_DIR);
ensureDir(TIENDAS_DIR);

function safeExt(originalname) {
  const ext = path.extname(originalname || "").toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : "";
}

function imageUploadFor(destinationDir) {
  return multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, destinationDir);
    },
    filename(_req, file, cb) {
      const ext = safeExt(file.originalname) || ".jpg";
      const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
      cb(null, name);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter(_req, file, cb) {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Tipo de archivo no permitido"), ok);
  }
  });
}

export const productoImageUpload = imageUploadFor(PRODUCTOS_DIR);
export const avatarImageUpload = imageUploadFor(AVATARES_DIR);
export const tiendaImageUpload = imageUploadFor(TIENDAS_DIR);

export function publicProductoImageUrl(filename) {
  return `/uploads/productos/${filename}`;
}

export function publicAvatarImageUrl(filename) {
  return `/uploads/avatares/${filename}`;
}

export function publicTiendaImageUrl(filename) {
  return `/uploads/tiendas/${filename}`;
}
