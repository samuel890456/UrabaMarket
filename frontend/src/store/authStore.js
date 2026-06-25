import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user: normalizeUser(user) }),
      logout: () => set({ token: null, user: null }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? normalizeUser({ ...state.user, ...partial }) : null
        }))
    }),
    { name: "urabamarket-auth" }
  )
);

function normalizeUser(user) {
  if (!user) return user;
  const roles = Array.isArray(user.roles) ? user.roles : user.rol ? [user.rol] : user.primaryRole ? [user.primaryRole] : [];
  return {
    ...user,
    roles,
    primaryRole: user.primaryRole || roles[0] || null
  };
}
