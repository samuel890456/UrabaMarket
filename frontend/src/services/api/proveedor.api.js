import { httpClient } from "../httpClient";

export async function getComprasMiProveedor() {
  const { data } = await httpClient.get("/compras-proveedor/mi-proveedor");
  return data.data;
}

export async function patchCompraEstado(idCompra, body) {
  const { data } = await httpClient.patch(`/compras-proveedor/${idCompra}/estado`, body);
  return data.data;
}
