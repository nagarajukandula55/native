"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateSKU() {

  const router = useRouter()

  const [products, setProducts] = useState([])

  const [form, setForm] = useState({
    productId: "",
    skuCode: "",
    partCode: "",
    sellingPrice: "",
    costPrice: "",
    mrp: "",
    color: "",
    size: ""
  })

  useEffect(() => {
    fetch("/api/admin/products/list")
      .then(res => res.json())
      .then(res => setProducts(res.data))
  }, [])

  const save = async () => {

    await fetch("/api/admin/sku/create", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        attributes: {
          color: form.color,
          size: form.size
        }
      })
    })

    router.push("/admin/skus")
  }

  return (
    <div style={{ maxWidth: 500 }}>

      <h1>Create SKU</h1>

      <select style={input}
        onChange={e => setForm({ ...form, productId: e.target.value })}
      >
        <option>Select Product</option>
        {products.map(p => (
          <option key={p._id} value={p._id}>
            {p.productName}
          </option>
        ))}
      </select>

      <input style={input} placeholder="SKU Code"
        onChange={e => setForm({ ...form, skuCode: e.target.value })}
      />

      <input style={input} placeholder="Part Code"
        onChange={e => setForm({ ...form, partCode: e.target.value })}
      />

      <input style={input} placeholder="MRP"
        onChange={e => setForm({ ...form, mrp: e.target.value })}
      />

      <input style={input} placeholder="Selling Price"
        onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
      />

      <input style={input} placeholder="Cost Price"
        onChange={e => setForm({ ...form, costPrice: e.target.value })}
      />

      <input style={input} placeholder="Color"
        onChange={e => setForm({ ...form, color: e.target.value })}
      />

      <input style={input} placeholder="Size"
        onChange={e => setForm({ ...form, size: e.target.value })}
      />

      <button style={btn} onClick={save}>
        Save SKU
      </button>

    </div>
  )
}

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10
}

const btn = {
  padding: "10px 20px",
  background: "#111",
  color: "#fff",
  border: "none"
}
