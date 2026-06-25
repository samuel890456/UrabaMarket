import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { hasAnyRole, homeForUser } from "../utils/rbac";

export function RoleRoute({ roles, children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyRole(user, roles)) {
    const fallback = homeForUser(user);
    return <Navigate to={fallback} replace />;
  }

  return children;
}
