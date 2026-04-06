"use client";

import AdminSidebar from "@/components/AdminSidebar";

/* ================= TOP BAR (CONTEXT ONLY) ================= */
function TopBar() {
  return (
    <div
      style={{
        height: 60,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      {/* LEFT: PAGE TITLE */}
      <div style={{ fontWeight: 600 }}>Products</div>

      {/* RIGHT: ACTIONS */}
      <div style={{ display: "flex", gap: 10 }}>
        <button style={btn}>Export</button>
        <button style={primaryBtn}>+ Add Product</button>
      </div>
    </div>
  );
}

const btn = {
  padding: "6px 12px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const primaryBtn = {
  ...btn,
  background: "#000",
  color: "#fff",
};

/* ================= LAYOUT ================= */

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />

        <main
          style={{
            flex: 1,
            padding: 24,
            background: "#f3f4f6",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
