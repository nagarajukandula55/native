import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientSidebar from "./ClientSidebar";

export default function AdminLayout({ children }) {
  const token = cookies().get("adminToken")?.value;

  /* If not logged in, go to main login page */
  if (!token) {
    redirect("/login");
  }

  return <ClientSidebar>{children}</ClientSidebar>;
}
