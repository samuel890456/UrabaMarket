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

export async function getAdminStoreById(idTienda) {
  const { data } = await httpClient.get(`/admin/tiendas/${idTienda}`);
  return data.data;
}

export async function getProductosAdmin(params = {}) {
  const { data } = await httpClient.get("/admin/productos", { params });
  return data.data;
}

export async function getProveedoresAdmin() {
  const { data } = await httpClient.get("/proveedores");
  return data.data;
}

export async function getAdminOrders(params = {}) {
  const { data } = await httpClient.get("/admin/pedidos", { params });
  return data.data;
}

export async function getAdminSupplierPurchases(params = {}) {
  const { data } = await httpClient.get("/admin/compras-proveedor", { params });
  return data.data;
}

// New function to get a single user by ID for admin
export async function getAdminUserById(idUsuario) {
  const { data } = await httpClient.get(`/admin/users/${idUsuario}`);
  return data.data;
}

// New function for admin to patch a user
export async function patchAdminUser(idUsuario, body) {
  const { data } = await httpClient.patch(`/admin/users/${idUsuario}`, body);
  return data.data;
}

// New function to get a single order by ID for admin
export async function getAdminOrderById(idPedido) {
  const { data } = await httpClient.get(`/admin/pedidos/${idPedido}`);
  return data.data;
}

// New function for admin to update order status
export async function updateAdminOrderStatus(idPedido, estado) {
  const { data } = await httpClient.patch(`/pedidos/${idPedido}/estado`, { estado }); // Reusing existing backend endpoint, but with admin access
  return data.data;
}

// New function to get a single supplier purchase by ID for admin
export async function getAdminSupplierPurchaseById(idCompra) {
  const { data } = await httpClient.get(`/admin/compras-proveedor/${idCompra}`);
  return data.data;
}

// New function for admin to update supplier purchase status
export async function updateAdminSupplierPurchaseStatus(idCompra, estado) {
  const { data } = await httpClient.patch(`/compras-proveedor/${idCompra}/estado`, { estado }); // Assuming a shared endpoint, might need a specific admin one
  return data.data;
}

// New function for admin to update a store
export async function updateAdminStore(idTienda, body) {
  const { data } = await httpClient.patch(`/tiendas/${idTienda}/admin`, body);
  return data.data;
}
