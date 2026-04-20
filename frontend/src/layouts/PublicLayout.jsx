import { Outlet } from "react-router-dom";
import { PublicNavbar } from "../components/layout/PublicNavbar";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <PublicNavbar />
      <Outlet />
    </div>
  );
}
