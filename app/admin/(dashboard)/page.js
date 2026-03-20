"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalWarehouses: 0,
    totalStock: 0,
  });

  useEffect(() => {
    // 🔹 Fetch dashboard stats from API
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 25, fontWeight: 600 }}>Dashboard</h1>

      {/* QUICK STATS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 20,
      }}>
        <StatCard title="Total Orders" value={stats.totalOrders} color="#1e40af" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} color="#facc15" />
        <StatCard title="Delivered Orders" value={stats.deliveredOrders} color="#16a34a" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} color="#0ea5e9" />
        <StatCard title="Total Products" value={stats.totalProducts} color="#7c3aed" />
        <StatCard title="Total Warehouses" value={stats.totalWarehouses} color="#f97316" />
        <StatCard title="Total Stock" value={stats.totalStock} color="#f43f5e" />
      </div>

      {/* QUICK ACTIONS */}
      <h2 style={{ marginTop: 40, marginBottom: 15, fontSize: 18, fontWeight: 600 }}>Quick Actions</h2>
      <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
        <ActionButton title="Create Order" href="/admin/orders/create" />
        <ActionButton title="Add Product" href="/admin/products/create" />
        <ActionButton title="Add Warehouse" href="/admin/warehouses/create" />
        <ActionButton title="Update Inventory" href="/admin/inventory" />
        <ActionButton title="View Reports" href="/admin/reports/sales" />
      </div>
    </div>
  );
}

/* ==================== STAT CARD ==================== */
function StatCard({ title, value, color }) {
  return (
    <div style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 100,
      borderLeft: `5px solid ${color || "#1e40af"}`
    }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "#111" }}>{value}</div>
    </div>
  );
}

/* ==================== ACTION BUTTON ==================== */
function ActionButton({ title, href }) {
  return (
    <a href={href} style={{
      background: "#1e40af",
      color: "#fff",
      padding: "12px 22px",
      borderRadius: 10,
      textDecoration: "none",
      fontWeight: 500,
      fontSize: 14,
      transition: "all 0.2s",
      display: "inline-block",
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
      onMouseLeave={(e) => e.currentTarget.style.background = "#1e40af"}
    >
      {title}
    </a>
  );
}
