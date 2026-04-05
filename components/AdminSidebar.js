"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const linkStyle = (path) => ({
    padding: "10px 12px",
    borderRadius: 6,
    background: pathname === path ? "#1e40af" : "transparent",
    color: "#fff",
    textDecoration: "none",
  });

  return (
    <aside
      style={{
        width: 240,
        background: "#111827",
        color: "#fff",
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Admin Panel</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link href="/admin" style={linkStyle("/admin")}>
          Dashboard
        </Link>

        <Link href="/admin/products" style={linkStyle("/admin/products")}>
          Products
        </Link>

        <Link href="/admin/inventory" style={linkStyle("/admin/inventory")}>
          Inventory
        </Link>

        <Link href="/admin/orders" style={linkStyle("/admin/orders")}>
          Orders
        </Link>
      </nav>
    </aside>
  );
}
