import { httpClient } from "../httpClient";

export async function getCategorias() {
  const { data } = await httpClient.get("/categorias");
  return data.data;
}

export async function getTiendas(params = {}) {
  const { data } = await httpClient.get("/tiendas", { params });
  return data.data;
}

export async function getTienda(idTienda) {
  const { data } = await httpClient.get(`/tiendas/${idTienda}`);
  return data.data;
}

export async function getProductos(params = {}) {
  const { data } = await httpClient.get("/productos", { params });
  return data.data;
}

export async function getProducto(id, params = {}) {
  const { data } = await httpClient.get(`/productos/${id}`, { params });
  return data.data;
}

export async function getProductosByTienda(idTienda) {
  const { data } = await httpClient.get(`/productos/tienda/${idTienda}`);
  return data.data;
}
