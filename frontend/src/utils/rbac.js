import { ROLE_HOME } from "../config/nav";

export function rolesOf(user) {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles.filter(Boolean);
  if (user.rol) return [user.rol];
  if (user.primaryRole) return [user.primaryRole];
  return [];
}

export function hasRole(user, role) {
  return rolesOf(user).includes(role);
}

export function hasAnyRole(user, roles = []) {
  return roles.some((role) => hasRole(user, role));
}

export function primaryRoleOf(user) {
  return user?.primaryRole || rolesOf(user)[0] || null;
}

export function homeForUser(user) {
  const preferredOrder = ["Administrador", "Vendedor", "Proveedor", "Cliente"];
  const roles = rolesOf(user);
  const role = preferredOrder.find((item) => roles.includes(item)) || roles[0];
  return ROLE_HOME[role] || "/";
}
