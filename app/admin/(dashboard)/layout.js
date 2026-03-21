import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientSidebar from "./ClientSidebar";

export default function AdminLayout({ children }) {
  const token = cookies().get("adminToken")?.value;

  // Get current path
  const path = typeof window === "undefined" ? "" : window.location.pathname;

  // ⚠️ Allow store routes WITHOUT admin login
  if (
    path?.startsWith("/admin/store/login") ||
    path?.startsWith("/admin/store/create")
  ) {
    return <>{children}</>;
  }

  // Protect only admin dashboard
  if (!token) redirect("/admin/login");

  return <ClientSidebar>{children}</ClientSidebar>;
}
