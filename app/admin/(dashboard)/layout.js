import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import ClientSidebar from "./ClientSidebar";

export default function AdminLayout({ children }) {
  const token = cookies().get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      redirect("/login");
    }

  } catch (err) {
    redirect("/login");
  }

  return <ClientSidebar>{children}</ClientSidebar>;
}
