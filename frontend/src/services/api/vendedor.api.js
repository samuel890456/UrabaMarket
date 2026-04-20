import { httpClient } from "../httpClient";

export async function getMiTienda() {
  const { data } = await httpClient.get("/tiendas/mine");
  return data.data;
}

export async function postTienda(body) {
  const { data } = await httpClient.post("/tiendas", body);
  return data.data;
}

export async function patchTienda(idTienda, body) {
  const { data } = await httpClient.patch(`/tiendas/${idTienda}`, body);
  return data.data;
}

export async function postProducto(body) {
  const { data } = await httpClient.post("/productos", body);
  return data.data;
}

export async function patchProducto(id, body) {
  const { data } = await httpClient.patch(`/productos/${id}`, body);
  return data.data;
}

export async function getPedidosTienda() {
  const { data } = await httpClient.get("/pedidos/tienda");
  return data.data;
}

export async function getMisProductos() {
  const { data } = await httpClient.get("/productos/mios");
  return data.data;
}
