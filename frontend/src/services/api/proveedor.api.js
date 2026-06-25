import { httpClient } from "../httpClient";

export async function getComprasMiProveedor() {
  const { data } = await httpClient.get("/compras-proveedor/mi-proveedor");
  return data.data;
}

export async function patchCompraEstado(idCompra, body) {
  const { data } = await httpClient.patch(`/compras-proveedor/${idCompra}/estado`, body);
  return data.data;
}

export async function getCompraProveedor(idCompra) {
  const { data } = await httpClient.get(`/compras-proveedor/${idCompra}`);
  return data.data;
}

export async function getMisProductosMayoristas(params = {}) {
  const { data } = await httpClient.get("/proveedores/productos-mayoristas/mis-productos", { params });
  return data.data;
}

export async function postProductoMayorista(body) {
  const { data } = await httpClient.post("/proveedores/productos-mayoristas", body);
  return data.data;
}

export async function patchProductoMayorista(idProductoMayorista, body) {
  const { data } = await httpClient.patch(`/proveedores/productos-mayoristas/${idProductoMayorista}`, body);
  return data.data;
}

export async function deleteProductoMayorista(idProductoMayorista) {
  const { data } = await httpClient.delete(`/proveedores/productos-mayoristas/${idProductoMayorista}`);
  return data.data;
}

export async function patchProductoMayoristaStock(idProductoMayorista, delta) {
  const { data } = await httpClient.patch(`/proveedores/productos-mayoristas/${idProductoMayorista}/stock`, { delta });
  return data.data;
}

export async function uploadProductoMayoristaImagen(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await httpClient.post("/uploads/productos", form);
  return data.data;
}
