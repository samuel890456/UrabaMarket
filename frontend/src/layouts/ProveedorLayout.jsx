import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../router/ProtectedRoute";
import { RoleRoute } from "../router/RoleRoute";
import { navProveedor } from "../config/nav";

export function ProveedorLayout() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={["Proveedor"]}>
        <AppShell navItems={navProveedor} title="Proveedor" />
      </RoleRoute>
    </ProtectedRoute>
  );
}
