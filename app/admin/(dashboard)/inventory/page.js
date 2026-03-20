"use client";

import { useEffect, useState } from "react";

export default function InventoryDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/inventory-dashboard")
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      });
  }, []);

  if (!data) return <p className="p-4">Loading Dashboard...</p>;

  return (
    <div className="p-4 space-y-6">

      <h1 className="text-2xl font-bold">Inventory Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="p-4 bg-white shadow rounded">
          <p>Total Products</p>
          <h2 className="text-xl font-bold">{data.totalProducts}</h2>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p>Total Warehouses</p>
          <h2 className="text-xl font-bold">{data.totalWarehouses}</h2>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p>Total Stock</p>
          <h2 className="text-xl font-bold">{data.totalStock}</h2>
        </div>

        <div className="p-4 bg-white shadow rounded bg-red-100">
          <p>Low Stock</p>
          <h2 className="text-xl font-bold">{data.lowStock}</h2>
        </div>

      </div>

      {/* RECENT MOVEMENTS */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-bold mb-3">Recent Stock Movement</h2>

        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>

          <tbody>
            {data.recentMoves.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-3">
                  No Movement Found
                </td>
              </tr>
            )}

            {data.recentMoves.map((m, i) => (
              <tr key={i}>
                <td className="border p-2">{m.productId}</td>
                <td className="border p-2">{m.type}</td>
                <td className="border p-2">{m.quantity}</td>
                <td className="border p-2">
                  {new Date(m.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}
