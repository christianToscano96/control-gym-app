import React from "react";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import SuperAdminDashboard from "../screens/dashboard/SuperAdminDashboard";
import { useUserStore } from "@/stores/store";

const dashboardTab = () => {
  const user = useUserStore((s) => s.user);
  const isSuperAdmin = user?.role === "superadmin";

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  return <DashboardScreen />;
};

export default dashboardTab;
