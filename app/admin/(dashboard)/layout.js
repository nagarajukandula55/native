import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientSidebar from "./ClientSidebar";

export default function AdminLayout({ children }) {
  const cookieStore = cookies();

  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("role")?.value;

  /* ================= AUTH CHECK ================= */
  if (!token) {
    redirect("/login");
  }

  /* ================= ROLE CHECK ================= */
  if (role !== "admin") {
    redirect("/login");
  }

  return <ClientSidebar>{children}</ClientSidebar>;
}
