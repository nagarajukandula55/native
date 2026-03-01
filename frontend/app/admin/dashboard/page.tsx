"use client";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl mb-6">Admin Dashboard</h1>

      <div className="flex gap-4">
        <Link href="/admin/products" className="underline">
          Manage Products
        </Link>

        <Link href="/admin/blogs" className="underline">
          Manage Blogs
        </Link>

        <Link href="/admin/orders" className="underline">
          Manage Orders
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 text-white px-4 py-2"
      >
        Logout
      </button>
    </div>
  );
}
