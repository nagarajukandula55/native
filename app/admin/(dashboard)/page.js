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
    // 🔹 Fetch initial dashboard stats
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Dashboard</h1>

      {/* QUICK STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} />
        <StatCard title="Delivered Orders" value={stats.deliveredOrders} />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} />
        <StatCard title="Total Products" value={stats.totalProducts} />
        <StatCard title="Total Warehouses" value={stats.totalWarehouses} />
        <StatCard title="Total Stock" value={stats.totalStock} />
      </div>

      {/* QUICK ACTIONS */}
      <h2 style={{ marginTop: 40, marginBottom: 10 }}>Quick Actions</h2>
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

function StatCard({ title, value }) {
  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ActionButton({ title, href }) {
  return (
    <a href={href} style={{
      background: "#1e40af",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 10,
      textDecoration: "none",
      fontWeight: 500,
      transition: "all 0.2s"
    }}>
      {title}
    </a>
  );
}
