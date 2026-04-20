import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../router/ProtectedRoute";
import { RoleRoute } from "../router/RoleRoute";
import { navCliente } from "../config/nav";

export function ClienteLayout() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={["Cliente"]}>
        <AppShell navItems={navCliente} title="Cliente" />
      </RoleRoute>
    </ProtectedRoute>
  );
}
