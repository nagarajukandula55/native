"use client"

import { useState, useEffect } from "react"
import { HSNList } from "@/app/api/admin/products/route"

export default function AdminProducts() {
  const emptyForm = {
    name: "",
    description: "",
    price: "",
    mrp: "",
    costPrice: "",
    hsn: "",
    gst: 0,
    weight: "",
    length: "",
    breadth: "",
    height: "",
    stock: "",
    reorderLevel: "",
    featured: false,
    status: "ACTIVE",
    image: ""
  }

  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadProducts()
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    let updatedForm = { ...form, [name]: type === "checkbox" ? checked : value }

    // Auto-fill GST on HSN selection
    if (name === "hsn") {
      const selected = HSNList.find(h => h.hsn === value)
      if (selected) updatedForm.gst = selected.gst
    }

    setForm(updatedForm)
  }

  async function loadProducts() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/products")
      const data = await res.json()
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch (err) {
      console.error(err)
      setProducts([])
    }
    setLoading(false)
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const fd = new FormData()
    fd.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()

    setForm(prev => ({ ...prev, image: data.url }))
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.price) {
      alert("Name & Price required")
      return
    }

    setSaving(true)
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })

    setMessage("✅ Product Added Successfully")
    setForm(emptyForm)
    await loadProducts()
    setSaving(false)
    setTimeout(() => setMessage(""), 2000)
  }

  async function deleteProduct(slug) {
    if (!confirm("Delete this product?")) return
    await fetch("/api/admin/products/" + slug, { method: "DELETE" })
    loadProducts()
  }

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 30 }}>
      <h1 style={{ fontSize: 30, fontWeight: "bold" }}>🛍 Admin Product Manager</h1>
      {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 25,
          padding: 20,
          border: "1px solid #eee",
          borderRadius: 10,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10
        }}
      >
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ gridColumn: "span 2" }} />

        <select name="hsn" value={form.hsn} onChange={handleChange} required>
          <option value="">Select HSN</option>
          {HSNList.map(h => (
            <option key={h.hsn} value={h.hsn}>
              {h.hsn} - {h.description}
            </option>
          ))}
        </select>

        <input name="gst" type="number" placeholder="GST %" value={form.gst} readOnly />

        <input name="price" type="number" placeholder="Selling Price" value={form.price} onChange={handleChange} required />
        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
        <input name="stock" type="number" placeholder="Opening Stock" value={form.stock} onChange={handleChange} />
        <input name="reorderLevel" type="number" placeholder="Reorder Level" value={form.reorderLevel} onChange={handleChange} />

        <input name="weight" type="number" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} />
        <input name="length" type="number" placeholder="Length (cm)" value={form.length} onChange={handleChange} />
        <input name="breadth" type="number" placeholder="Breadth (cm)" value={form.breadth} onChange={handleChange} />
        <input name="height" type="number" placeholder="Height (cm)" value={form.height} onChange={handleChange} />

        <input type="file" onChange={handleImageUpload} style={{ gridColumn: "span 2" }} />
        {uploading && <p>Uploading image...</p>}
        {form.image && <img src={form.image} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 6 }} />}

        <label style={{ gridColumn: "span 2" }}>
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured Product
        </label>

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button disabled={saving} style={{ padding: 12, background: "black", color: "#fff", borderRadius: 6, cursor: "pointer", gridColumn: "span 2" }}>
          {saving ? "Saving..." : "Add Product"}
        </button>
      </form>

      {loading ? (
        <h3 style={{ marginTop: 40 }}>Loading products...</h3>
      ) : (
        <div style={{ marginTop: 40 }}>
          <h2>All Products ({products.length})</h2>
          <table style={{ width: "100%", marginTop: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th>SKU</th>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>MRP</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.map(p => (
                <tr key={p._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{p.sku}</td>
                  <td>{p.image && <img src={p.image} style={{ width: 60, height: 60, objectFit: "cover" }} />}</td>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>₹{p.mrp}</td>
                  <td>{p.stock}</td>
                  <td>{p.status}</td>
                  <td>
                    <button onClick={() => deleteProduct(p.slug)} style={{ background: "red", color: "#fff", padding: "6px 12px", borderRadius: "4px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
