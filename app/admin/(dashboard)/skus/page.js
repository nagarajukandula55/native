"use client"

import { useEffect, useState } from "react"

export default function SKUList() {

  const [skus, setSkus] = useState([])

  useEffect(() => {
    fetch("/api/admin/sku/list")
      .then(res => res.json())
      .then(setSkus)
  }, [])

  return (
    <div>

      <h1>SKU List</h1>

      {skus.map(s => (
        <div key={s._id} style={{
          padding: 10,
          marginBottom: 10,
          background: "#fff"
        }}>
          {s.skuCode} — {s.productId?.name}
        </div>
      ))}

    </div>
  )
}
