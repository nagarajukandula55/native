"use client"

import { useState } from "react"

export default function CreateProduct() {

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    slug: "",
    image: "",
    alt: "",
    mrp: "",
    price: "",
    costPrice: "",
    stock: "",
    reorderLevel: "",
    hsn: "",
    gst: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    featured: false,
    status: "ACTIVE"
  })

  const change = (k, v) =>
    setForm({ ...form, [k]: v })

  const save = async () => {

    if (!form.name)
      return alert("Product name required")

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if (data.success)
      alert("Product Created")
    else
      alert(data.message)
  }

  return (
    <div style={{ maxWidth: 1000 }}>

      <h1>Create Product</h1>

      <div style={grid}>

        <input placeholder="Product Name"
          value={form.name}
          onChange={e => change("name", e.target.value)} />

        <input placeholder="Category"
          value={form.category}
          onChange={e => change("category", e.target.value)} />

        <input placeholder="Brand"
          value={form.brand}
          onChange={e => change("brand", e.target.value)} />

        <input placeholder="Slug"
          value={form.slug}
          onChange={e => change("slug", e.target.value)} />

        <input placeholder="Image URL"
          value={form.image}
          onChange={e => change("image", e.target.value)} />

        <input placeholder="Image Alt"
          value={form.alt}
          onChange={e => change("alt", e.target.value)} />

        <input type="number" placeholder="MRP"
          value={form.mrp}
          onChange={e => change("mrp", e.target.value)} />

        <input type="number" placeholder="Selling Price"
          value={form.price}
          onChange={e => change("price", e.target.value)} />

        <input type="number" placeholder="Cost Price"
          value={form.costPrice}
          onChange={e => change("costPrice", e.target.value)} />

        <input type="number" placeholder="Opening Stock"
          value={form.stock}
          onChange={e => change("stock", e.target.value)} />

        <input type="number" placeholder="Reorder Level"
          value={form.reorderLevel}
          onChange={e => change("reorderLevel", e.target.value)} />

        <input placeholder="HSN Code"
          value={form.hsn}
          onChange={e => change("hsn", e.target.value)} />

        <input type="number" placeholder="GST %"
          value={form.gst}
          onChange={e => change("gst", e.target.value)} />

        <input type="number" placeholder="Weight (kg)"
          value={form.weight}
          onChange={e => change("weight", e.target.value)} />

        <input type="number" placeholder="Length (cm)"
          value={form.length}
          onChange={e => change("length", e.target.value)} />

        <input type="number" placeholder="Breadth (cm)"
          value={form.breadth}
          onChange={e => change("breadth", e.target.value)} />

        <input type="number" placeholder="Height (cm)"
          value={form.height}
          onChange={e => change("height", e.target.value)} />

        <select
          value={form.status}
          onChange={e => change("status", e.target.value)}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={form.featured}
            onChange={e =>
              change("featured", e.target.checked)
            }
          />
          Featured Product
        </label>

      </div>

      <br />

      <textarea
        placeholder="Description"
        style={{ width: "100%", height: 120 }}
        value={form.description}
        onChange={e => change("description", e.target.value)}
      />

      <br /><br />

      <button style={btn} onClick={save}>
        Save Product
      </button>

    </div>
  )
}

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 15
}

const btn = {
  padding: "12px 25px",
  background: "black",
  color: "white",
  border: "none",
  cursor: "pointer"
}
