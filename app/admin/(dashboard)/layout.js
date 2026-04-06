"use client";

import AdminSidebar from "@/components/AdminSidebar";

/* ================= TOP BAR ================= */
function TopBar() {
  return (
    <div
      style={{
        height: 60,
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <div style={{ fontWeight: 600 }}>Admin Dashboard</div>

      <div style={{ display: "flex", gap: 20, fontSize: 14 }}>
        <span style={{ cursor: "pointer" }}>Products</span>
        <span style={{ cursor: "pointer" }}>Orders</span>
        <span style={{ cursor: "pointer" }}>Users</span>
      </div>
    </div>
  );
}

/* ================= LAYOUT ================= */

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOP MENU BAR */}
        <TopBar />

        {/* CONTENT */}
        <main
          style={{
            flex: 1,
            padding: 20,
            background: "#f3f4f6",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
