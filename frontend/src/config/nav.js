import {
  BarChart3,
  Home,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users
} from "lucide-react";

export const ROLE_HOME = {
  Cliente: "/cliente",
  Vendedor: "/vendedor",
  Proveedor: "/proveedor",
  Administrador: "/admin"
};

export const navCliente = [
  { to: "/cliente", label: "Inicio", icon: Home },
  { to: "/cliente/perfil", label: "Perfil", icon: Users },
  { to: "/cliente/direcciones", label: "Direcciones", icon: MapPin },
  { to: "/cliente/carrito", label: "Carrito", icon: ShoppingCart },
  { to: "/cliente/pedidos", label: "Mis pedidos", icon: Package }
];

export const navVendedor = [
  { to: "/vendedor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendedor/tienda", label: "Mi tienda", icon: Store },
  { to: "/vendedor/productos", label: "Productos", icon: ShoppingBag },
  { to: "/vendedor/ventas", label: "Ventas", icon: BarChart3 }
];

export const navProveedor = [
  { to: "/proveedor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/proveedor/compras-b2b", label: "Solicitudes B2B", icon: Truck }
];

export const navAdmin = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { to: "/admin/tiendas", label: "Tiendas", icon: Store },
  { to: "/admin/productos", label: "Productos", icon: ShoppingBag },
  { to: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/admin/config", label: "Configuración", icon: Settings }
];
