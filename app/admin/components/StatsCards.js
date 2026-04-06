"use client";

export default function StatsCards({ products }) {
  const total = products.length;
  const active = products.filter(p => p.status === "active").length;
  const out = products.filter(p => p.status === "out_of_stock").length;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl shadow">Total: {total}</div>
      <div className="bg-white p-4 rounded-xl shadow">Active: {active}</div>
      <div className="bg-white p-4 rounded-xl shadow">Out of Stock: {out}</div>
    </div>
  );
}
