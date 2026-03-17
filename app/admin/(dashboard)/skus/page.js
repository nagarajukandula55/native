"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function SkusPage() {
  const [skus, setSkus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkus()
  }, [])

  async function loadSkus() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/sku/list")
      const data = await res.json()
      if (data.success) {
        setSkus(data.skus)
      } else {
        alert("Failed to load SKUs: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      alert("Error fetching SKUs: " + err.message)
    }
    setLoading(false)
  }

  async function toggleStatus(id, current) {
    try {
      await fetch("/api/admin/sku/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, value: !current }),
      })
      loadSkus()
    } catch {
      alert("Failed to toggle status")
    }
  }

  if (loading) return <h2>Loading SKUs...</h2>

  return (
    <div style={{ maxWidth: 1300, margin: "auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>📦 SKU Management</h1>

      <div style={{ margin: "20px 0" }}>
        <Link href="/admin/skus/create">
          <button
            style={{
              padding: "8px 16px",
              background: "black",
              color: "#fff",
              borderRadius: 6,
            }}
          >
            ➕ Create New SKU
          </button>
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th>SKU Code</th>
            <th>Part Code</th>
            <th>Product</th>
            <th>Warehouse</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {skus.map((s) => (
            <tr key={s._id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{s.code}</td>
              <td>{s.partCode}</td>
              <td>{s.product?.name || "N/A"}</td>
              <td>{s.warehouse?.name || "N/A"}</td>
              <td>₹{s.price}</td>
              <td>{s.stock}</td>
              <td>
                <button
                  onClick={() => toggleStatus(s._id, s.isActive)}
                  style={{
                    background: s.isActive ? "green" : "red",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: 4,
                  }}
                >
                  {s.isActive ? "Active" : "Disabled"}
                </button>
              </td>
              <td>
                <Link href={`/admin/skus/edit/${s._id}`}>
                  <button
                    style={{
                      padding: "4px 10px",
                      background: "#0a7cff",
                      color: "#fff",
                      borderRadius: 4,
                    }}
                  >
                    Edit
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
