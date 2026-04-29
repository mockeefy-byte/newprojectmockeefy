import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function UserShell() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

