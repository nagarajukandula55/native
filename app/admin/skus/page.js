"use client";

import { useEffect, useState } from "react";

export default function SKUs() {
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSKUs();
  }, []);

  async function loadSKUs() {
    const res = await fetch("/api/admin/sku/list");
    const data = await res.json();
    setSkus(data.skus || []);
    setLoading(false);
  }

  async function toggleStatus(id, current) {
    await fetch("/api/admin/sku/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, value: !current }),
    });
    loadSKUs();
  }

  if (loading) return <h2>Loading SKUs...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 30 }}>
      <h1>SKUs List</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th>Code</th>
            <th>Part Code</th>
            <th>Product</th>
            <th>Warehouse</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {skus.map(s => (
            <tr key={s._id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{s.code}</td>
              <td>{s.partCode}</td>
              <td>{s.product?.name}</td>
              <td>{s.warehouse?.name}</td>
              <td>{s.price}</td>
              <td>{s.stock}</td>
              <td>
                <button
                  onClick={() => toggleStatus(s._id, s.isActive)}
                  style={{ background: s.isActive ? "green" : "red", color: "#fff", padding: "5px 12px" }}
                >
                  {s.isActive ? "Active" : "Disabled"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
