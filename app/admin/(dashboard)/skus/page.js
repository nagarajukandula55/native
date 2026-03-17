"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function SKUsPage() {

  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/admin/sku/list")
      .then(res => res.json())
      .then(res => setData(res.data))
  }, [])

  return (
    <div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <h1>SKUs</h1>

        <Link href="/admin/skus/create">
          <button style={btn}>+ Create SKU</button>
        </Link>
      </div>

      <table style={table}>
        <thead>
          <tr>
            <th>SKU Code</th>
            <th>Product</th>
            <th>Selling Price</th>
            <th>Cost</th>
          </tr>
        </thead>

        <tbody>
          {data.map(s => (
            <tr key={s._id}>
              <td>{s.skuCode}</td>
              <td>{s.productId?.productName}</td>
              <td>{s.sellingPrice}</td>
              <td>{s.costPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}

const btn = {
  padding: "8px 15px",
  background: "#111",
  color: "#fff",
  border: "none"
}

const table = {
  width: "100%",
  background: "#fff",
  borderCollapse: "collapse"
}
