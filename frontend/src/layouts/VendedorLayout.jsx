import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../router/ProtectedRoute";
import { RoleRoute } from "../router/RoleRoute";
import { navVendedor } from "../config/nav";

export function VendedorLayout() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={["Vendedor"]}>
        <AppShell navItems={navVendedor} title="Vendedor" />
      </RoleRoute>
    </ProtectedRoute>
  );
}
