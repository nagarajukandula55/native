"use client";

import { useEffect, useState } from "react";

export default function InventoryDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch("/api/admin/inventory-dashboard");

        if (!res.ok) {
          throw new Error("API failed");
        }

        const result = await res.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Failed to load data");
        }

      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* ================= STATES ================= */

  if (loading) return <p className="p-4">Loading Dashboard...</p>;

  if (error)
    return <p className="p-4 text-red-600">{error}</p>;

  if (!data)
    return <p className="p-4">No Data Available</p>;

  return (
    <div className="p-4 space-y-6">

      <h1 className="text-2xl font-bold">Inventory Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="p-4 bg-white shadow rounded">
          <p>Total Products</p>
          <h2 className="text-xl font-bold">{data.totalProducts || 0}</h2>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p>Total Warehouses</p>
          <h2 className="text-xl font-bold">{data.totalWarehouses || 0}</h2>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p>Total Stock</p>
          <h2 className="text-xl font-bold">{data.totalStock || 0}</h2>
        </div>

        <div className="p-4 bg-red-100 shadow rounded">
          <p>Low Stock</p>
          <h2 className="text-xl font-bold">{data.lowStock || 0}</h2>
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
            {(data.recentMoves || []).length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-3">
                  No Movement Found
                </td>
              </tr>
            )}

            {(data.recentMoves || []).map((m, i) => (
              <tr key={i}>
                <td className="border p-2">
                  {m.productName || m.productId || "-"}
                </td>

                <td className="border p-2">{m.type || "-"}</td>

                <td className="border p-2">{m.quantity || 0}</td>

                <td className="border p-2">
                  {m.createdAt
                    ? new Date(m.createdAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}
