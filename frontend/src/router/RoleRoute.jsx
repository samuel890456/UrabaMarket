import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ROLE_HOME } from "../config/nav";

export function RoleRoute({ roles, children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.rol)) {
    const fallback = ROLE_HOME[user.rol] || "/";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
