import { httpClient } from "../httpClient";

export async function getEstadisticas() {
  const { data } = await httpClient.get("/admin/estadisticas");
  return data.data;
}

export async function getUsuarios(params = {}) {
  const { data } = await httpClient.get("/usuarios", { params });
  return data.data;
}

export async function getTiendasAdmin(params = {}) {
  const { data } = await httpClient.get("/admin/tiendas", { params });
  return data.data;
}

export async function getProductosAdmin(params = {}) {
  const { data } = await httpClient.get("/admin/productos", { params });
  return data.data;
}
