import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { ClienteLayout } from "../layouts/ClienteLayout";
import { VendedorLayout } from "../layouts/VendedorLayout";
import { ProveedorLayout } from "../layouts/ProveedorLayout";
import { AdminLayout } from "../layouts/AdminLayout";

import { HomePage } from "../pages/public/HomePage";
import { TiendasPage } from "../pages/public/TiendasPage";
import { TiendaCatalogoPage } from "../pages/public/TiendaCatalogoPage";
import { ProductosPage } from "../pages/public/ProductosPage";
import { ProductoDetallePage } from "../pages/public/ProductoDetallePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

import { DashboardClientePage } from "../pages/cliente/DashboardClientePage";
import { PerfilClientePage } from "../pages/cliente/PerfilClientePage";
import { DireccionesClientePage } from "../pages/cliente/DireccionesClientePage";
import { CarritoClientePage } from "../pages/cliente/CarritoClientePage";
import { CheckoutClientePage } from "../pages/cliente/CheckoutClientePage";
import { PedidosClientePage } from "../pages/cliente/PedidosClientePage";
import { PedidoDetalleClientePage } from "../pages/cliente/PedidoDetalleClientePage";

import { DashboardVendedorPage } from "../pages/vendedor/DashboardVendedorPage";
import { TiendaVendedorPage } from "../pages/vendedor/TiendaVendedorPage";
import { ProductosVendedorPage } from "../pages/vendedor/ProductosVendedorPage";
import { VentasVendedorPage } from "../pages/vendedor/VentasVendedorPage";

import { DashboardProveedorPage } from "../pages/proveedor/DashboardProveedorPage";
import { ComprasB2BPage } from "../pages/proveedor/ComprasB2BPage";

import { DashboardAdminPage } from "../pages/admin/DashboardAdminPage";
import { UsuariosAdminPage } from "../pages/admin/UsuariosAdminPage";
import { TiendasAdminPage } from "../pages/admin/TiendasAdminPage";
import { ProductosAdminPage } from "../pages/admin/ProductosAdminPage";
import { ReportesAdminPage } from "../pages/admin/ReportesAdminPage";
import { ConfigAdminPage } from "../pages/admin/ConfigAdminPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tiendas" element={<TiendasPage />} />
        <Route path="/tiendas/:idTienda/catalogo" element={<TiendaCatalogoPage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/productos/:idProducto" element={<ProductoDetallePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
      </Route>

      <Route path="/cliente" element={<ClienteLayout />}>
        <Route index element={<DashboardClientePage />} />
        <Route path="perfil" element={<PerfilClientePage />} />
        <Route path="direcciones" element={<DireccionesClientePage />} />
        <Route path="carrito" element={<CarritoClientePage />} />
        <Route path="checkout" element={<CheckoutClientePage />} />
        <Route path="pedidos" element={<PedidosClientePage />} />
        <Route path="pedidos/:idPedido" element={<PedidoDetalleClientePage />} />
      </Route>

      <Route path="/vendedor" element={<VendedorLayout />}>
        <Route index element={<DashboardVendedorPage />} />
        <Route path="tienda" element={<TiendaVendedorPage />} />
        <Route path="productos" element={<ProductosVendedorPage />} />
        <Route path="ventas" element={<VentasVendedorPage />} />
      </Route>

      <Route path="/proveedor" element={<ProveedorLayout />}>
        <Route index element={<DashboardProveedorPage />} />
        <Route path="compras-b2b" element={<ComprasB2BPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardAdminPage />} />
        <Route path="usuarios" element={<UsuariosAdminPage />} />
        <Route path="tiendas" element={<TiendasAdminPage />} />
        <Route path="productos" element={<ProductosAdminPage />} />
        <Route path="reportes" element={<ReportesAdminPage />} />
        <Route path="config" element={<ConfigAdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
