import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../router/ProtectedRoute";
import { RoleRoute } from "../router/RoleRoute";
import { navAdmin } from "../config/nav";

export function AdminLayout() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={["Administrador"]}>
        <AppShell navItems={navAdmin} title="Administración" />
      </RoleRoute>
    </ProtectedRoute>
  );
}
