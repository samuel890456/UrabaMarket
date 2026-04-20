import { httpClient } from "../httpClient";

export async function getMe() {
  const { data } = await httpClient.get("/usuarios/me");
  return data.data;
}

export async function patchMe(body) {
  const { data } = await httpClient.patch("/usuarios/me", body);
  return data.data;
}

export async function getDirecciones() {
  const { data } = await httpClient.get("/direcciones");
  return data.data;
}

export async function postDireccion(body) {
  const { data } = await httpClient.post("/direcciones", body);
  return data.data;
}

export async function getCarrito() {
  const { data } = await httpClient.get("/carrito");
  return data.data;
}

export async function postCarritoItem(body) {
  const { data } = await httpClient.post("/carrito/items", body);
  return data.data;
}

export async function patchCarritoItem(idProducto, body) {
  const { data } = await httpClient.patch(`/carrito/items/${idProducto}`, body);
  return data.data;
}

export async function deleteCarritoItem(idProducto) {
  const { data } = await httpClient.delete(`/carrito/items/${idProducto}`);
  return data.data;
}

export async function postCheckout(body) {
  const { data } = await httpClient.post("/pedidos/checkout", body);
  return data.data;
}

export async function getPedidos() {
  const { data } = await httpClient.get("/pedidos");
  return data.data;
}

export async function getPedido(id) {
  const { data } = await httpClient.get(`/pedidos/${id}`);
  return data.data;
}
