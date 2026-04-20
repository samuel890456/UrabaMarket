import * as usuarioService from "../services/usuario.service.js";

export async function getMe(req, res) {
  const data = await usuarioService.getMe(req.user.idUsuario);
  res.json({ ok: true, data });
}

export async function updateMe(req, res) {
  const data = await usuarioService.updateMe(req.user.idUsuario, req.body);
  res.json({ ok: true, data });
}

export async function list(req, res) {
  const data = await usuarioService.listUsuarios(req.query);
  res.json({ ok: true, data });
}

export async function getById(req, res) {
  const data = await usuarioService.getUsuarioById(req.params.idUsuario);
  res.json({ ok: true, data });
}

export async function updateAdmin(req, res) {
  const data = await usuarioService.updateUsuarioAdmin(req.params.idUsuario, req.body);
  res.json({ ok: true, data });
}
