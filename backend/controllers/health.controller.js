import { getHealthStatus } from "../services/health.service.js";

export async function healthController(req, res) {
  const data = await getHealthStatus();
  return res.status(200).json({
    ok: true,
    data
  });
}
