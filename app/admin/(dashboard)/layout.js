import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientSidebar from "./ClientSidebar"; // import the client component

export default function AdminLayout({ children }) {
  const token = cookies().get("adminToken")?.value;
  if (!token) redirect("/admin/login");

  return <ClientSidebar>{children}</ClientSidebar>;
}
