"use client";

import Link from "next/link";

export default function AdminSidebar() {
  return (
    <div
      style={{
        width: 240,
        height: "100vh",
        background: "#111",
        color: "#fff",
        padding: 20,
      }}
    >
      <h2>Admin</h2>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/inventory">Inventory</Link>
        <Link href="/admin/orders">Orders</Link>
      </div>
    </div>
  );
}
