"use client";

import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />

      <main
        style={{
          flex: 1,
          padding: 20,
          background: "#f9fafb",
        }}
      >
        {children}
      </main>
    </div>
  );
}
