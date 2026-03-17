"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function WarehousesPage() {

  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/admin/warehouse/list")
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
        <h1>Warehouses</h1>

        <Link href="/admin/warehouses/create">
          <button style={btn}>+ Create</button>
        </Link>
      </div>

      <table style={table}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>City</th>
            <th>State</th>
          </tr>
        </thead>

        <tbody>
          {data.map(w => (
            <tr key={w._id}>
              <td>{w.warehouseCode}</td>
              <td>{w.warehouseName}</td>
              <td>{w.city}</td>
              <td>{w.state}</td>
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
