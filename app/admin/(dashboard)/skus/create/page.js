"use client"

import { useEffect, useState } from "react"

export default function CreateSKU() {

  const [products, setProducts] = useState([])
  const [form, setForm] = useState({})

  useEffect(() => {
    fetch("/api/admin/products")
      .then(res => res.json())
      .then(res => {
        if (Array.isArray(res)) setProducts(res)
        else setProducts([])
      })
  }, [])

  const save = async () => {

    if (!form.productId)
      return alert("Select Product")

    if (!form.skuCode)
      return alert("Enter SKU Code")

    if (!form.partCode)
      return alert("Enter Part Code")

    const res = await fetch("/api/admin/sku/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if (data.success)
      alert("SKU Created")
    else
      alert(data.message)
  }

  return (
    <div>

      <h1>Create SKU</h1>

      <select
        onChange={e =>
          setForm({ ...form, productId: e.target.value })
        }
      >
        <option value="">Select Product</option>

        {products.map(p => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        placeholder="SKU Code"
        onChange={e =>
          setForm({ ...form, skuCode: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="Part Code"
        onChange={e =>
          setForm({ ...form, partCode: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="Price"
        type="number"
        onChange={e =>
          setForm({ ...form, price: e.target.value })
        }
      />

      <br /><br />

      <button onClick={save}>Save SKU</button>

    </div>
  )
}
