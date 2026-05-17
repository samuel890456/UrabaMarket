import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const PRODUCTOS_DIR = path.join(UPLOAD_ROOT, "productos");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

ensureDir(PRODUCTOS_DIR);

function safeExt(originalname) {
  const ext = path.extname(originalname || "").toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : "";
}

export const productoImageUpload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, PRODUCTOS_DIR);
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

export function publicProductoImageUrl(filename) {
  return `/uploads/productos/${filename}`;
}

