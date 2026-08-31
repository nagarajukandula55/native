"use client";

import ListTab from "@/components/admin/products/ListTab";

/** Kept as a standalone route for existing bookmarks/links; the primary
 * entry point is the "Live Products" tab on /admin/products. */
export default function AdminProductsListPage() {
  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 20px", color: "#111827" }}>
        📦 Product Management
      </h1>
      <ListTab />
    </div>
  );
}
