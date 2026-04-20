import * as authService from "../services/auth.service.js";

export async function register(req, res) {
  const data = await authService.register(req.body);
  res.status(201).json({ ok: true, data });
}

export async function login(req, res) {
  const data = await authService.login(req.body);
  res.json({ ok: true, data });
}
