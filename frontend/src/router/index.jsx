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
import { RegisterRolePage } from "../pages/auth/register/RegisterRolePage";
import { RegisterClientForm } from "../pages/auth/register/RegisterClientForm";
import { RegisterSellerForm } from "../pages/auth/register/RegisterSellerForm";
import { RegisterSupplierForm } from "../pages/auth/register/RegisterSupplierForm";

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
import { PedidoVentaDetallePage } from "../pages/vendedor/PedidoVentaDetallePage";
import { SellerInventoryPage } from "../pages/vendedor/SellerInventoryPage";
import { SellerFinancialSummaryPage } from "../pages/vendedor/SellerFinancialSummaryPage";
import { AbastecimientoB2BPage } from "../pages/vendedor/AbastecimientoB2BPage";

import { DashboardProveedorPage } from "../pages/proveedor/DashboardProveedorPage";
import { ComprasB2BPage } from "../pages/proveedor/ComprasB2BPage";
import { CompraB2BDetallePage } from "../pages/proveedor/CompraB2BDetallePage";
import { CatalogoProveedorPage } from "../pages/proveedor/CatalogoProveedorPage";

// Original Admin Pages
import { DashboardAdminPage } from "../pages/admin/DashboardAdminPage"; // Corrected to original DashboardAdminPage
import { UsuariosAdminPage } from "../pages/admin/UsuariosAdminPage";
import { TiendasAdminPage } from "../pages/admin/TiendasAdminPage";
import { ProductosAdminPage } from "../pages/admin/ProductosAdminPage";
import { ReportesAdminPage } from "../pages/admin/ReportesAdminPage";
import { ConfigAdminPage } from "../pages/admin/ConfigAdminPage";
// New import
import { ProductAdminDetailPage } from "../pages/admin/ProductAdminDetailPage";
// New imports for store details and products
import { StoreAdminDetailPage } from "../pages/admin/StoreAdminDetailPage";
import { StoreAdminProductsPage } from "../pages/admin/StoreAdminProductsPage";
// New import for user details
import { UserAdminDetailPage } from "../pages/admin/UserAdminDetailPage";
// New imports for order and supplier purchase details
import { PedidoAdminDetailPage } from "../pages/admin/PedidoAdminDetailPage";
import { CompraProveedorAdminDetailPage } from "../pages/admin/CompraProveedorAdminDetailPage";

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
        {/* Registro nuevo (UX por rol) */}
        <Route path="/register" element={<RegisterRolePage />} />
        <Route path="/register/cliente" element={<RegisterClientForm />} />
        <Route path="/register/vendedor" element={<RegisterSellerForm />} />
        <Route path="/register/proveedor" element={<RegisterSupplierForm />} />

        {/* Compatibilidad: rutas antiguas */}
        <Route path="/registro" element={<Navigate to="/register" replace />} />
        <Route path="/registro/cliente" element={<Navigate to="/register/cliente" replace />} />
        <Route path="/registro/vendedor" element={<Navigate to="/register/vendedor" replace />} />
        <Route path="/registro/proveedor" element={<Navigate to="/register/proveedor" replace />} />
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
        <Route path="ventas/:idPedido" element={<PedidoVentaDetallePage />} />
        <Route path="inventario" element={<SellerInventoryPage />} />
        <Route path="abastecimiento" element={<AbastecimientoB2BPage />} />
        <Route path="resumen-financiero" element={<SellerFinancialSummaryPage />} />
      </Route>

      <Route path="/proveedor" element={<ProveedorLayout />}>
        <Route index element={<DashboardProveedorPage />} />
        <Route path="catalogo" element={<CatalogoProveedorPage />} />
        <Route path="compras-b2b" element={<ComprasB2BPage />} />
        <Route path="compras-b2b/:idCompra" element={<CompraB2BDetallePage />} />
      </Route>

      {/* Original Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardAdminPage />} />
        <Route path="usuarios" element={<UsuariosAdminPage />} />
        <Route path="users/:idUsuario" element={<UserAdminDetailPage />} /> {/* New route for user detail */}
        <Route path="tiendas" element={<TiendasAdminPage />} />
        <Route path="stores/:idTienda" element={<StoreAdminDetailPage />} />
        <Route path="stores/:idTienda/products" element={<StoreAdminProductsPage />} />
        <Route path="productos" element={<ProductosAdminPage />} />
        <Route path="products/:idProducto" element={<ProductAdminDetailPage />} />
        <Route path="reportes" element={<ReportesAdminPage />} />
        <Route path="pedidos/:idPedido" element={<PedidoAdminDetailPage />} /> {/* New route for order detail */}
        <Route path="compras-proveedor/:idCompra" element={<CompraProveedorAdminDetailPage />} /> {/* New route for supplier purchase detail */}
        <Route path="config" element={<ConfigAdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
