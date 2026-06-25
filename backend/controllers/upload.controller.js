import { ApiError } from "../utils/ApiError.js";
import { publicAvatarImageUrl, publicProductoImageUrl, publicTiendaImageUrl } from "../utils/upload.js";

export async function uploadProductoImagen(req, res) {
  const file = req.file;
  if (!file) {
    throw new ApiError.BadRequest("Archivo requerido (imagen)");
  }

  const url = publicProductoImageUrl(file.filename);
  res.status(201).json({
    ok: true,
    data: {
      url,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }
  });
}

export async function uploadAvatarImagen(req, res) {
  const file = req.file;
  if (!file) {
    throw new ApiError.BadRequest("Archivo requerido (imagen)");
  }

  const url = publicAvatarImageUrl(file.filename);
  res.status(201).json({
    ok: true,
    data: {
      url,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }
  });
}

export async function uploadTiendaImagen(req, res) {
  const file = req.file;
  if (!file) {
    throw new ApiError.BadRequest("Archivo requerido (imagen)");
  }

  const url = publicTiendaImageUrl(file.filename);
  res.status(201).json({
    ok: true,
    data: {
      url,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }
  });
}
