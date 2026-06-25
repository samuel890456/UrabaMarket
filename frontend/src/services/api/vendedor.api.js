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

export async function deleteProducto(id) {
  const { data } = await httpClient.delete(`/productos/${id}`);
  return data.data;
}

export async function uploadProductoImagen(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await httpClient.post("/uploads/productos", form);
  return data.data; // { url, filename, ... }
}

export async function uploadTiendaImagen(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await httpClient.post("/uploads/tiendas", form);
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

export async function updatePedidoEstado(idPedido, estado) {
  const { data } = await httpClient.patch(`/pedidos/${idPedido}/estado`, { estado });
  return data.data;
}

export async function getPedidoTiendaById(idPedido) {
  const { data } = await httpClient.get(`/pedidos/${idPedido}`);
  return data.data;
}

// New functions for Seller Inventory Management
export async function getSellerLowStockProducts() {
  const { data } = await httpClient.get("/productos/low-stock");
  return data.data;
}

export async function getSellerExpiredProducts() {
  const { data } = await httpClient.get("/productos/expired");
  return data.data;
}

export async function getSellerSoonToExpireProducts(days) {
  const params = days !== undefined ? { days } : {};
  const { data } = await httpClient.get("/productos/soon-to-expire", { params });
  return data.data;
}

// New function for Seller Financial Summary
export async function getSellerFinancialSummary(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
  const { data } = await httpClient.get("/tiendas/mine/financial-summary", { params: cleanParams });
  return data.data;
}

// New function to get providers for seller to associate with products
export async function getSellerProviders() {
  const { data } = await httpClient.get("/proveedores");
  return data.data;
}

export async function getCatalogoMayorista(params = {}) {
  const { data } = await httpClient.get("/proveedores/catalogo-mayorista", { params });
  return data.data;
}

export async function postCompraProveedor(items) {
  const { data } = await httpClient.post("/compras-proveedor", { items });
  return data.data;
}

export async function getComprasMiTienda() {
  const { data } = await httpClient.get("/compras-proveedor/mi-tienda");
  return data.data;
}

export async function updateCompraProveedorEstado(idCompra, estado) {
  const { data } = await httpClient.patch(`/compras-proveedor/${idCompra}/estado`, { estado });
  return data.data;
}
