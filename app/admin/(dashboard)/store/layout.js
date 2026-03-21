import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function StoreLayout({ children }) {
  const cookieStore = cookies();

  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("role")?.value;

  if (!token || role !== "store") {
    redirect("/login");
  }

  return <>{children}</>;
}
