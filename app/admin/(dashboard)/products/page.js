"use client"

import { useState, useEffect } from "react"

export default function AdminProducts() {
  const hsnOptions = [
    { hsn: "1905", gst: 5, description: "Idly / Dosa Mix" },
    { hsn: "2103", gst: 12, description: "Spice Mix" },
    { hsn: "2106", gst: 18, description: "Snacks / Savories" },
    { hsn: "1905", gst: 5, description: "Instant Mix" },
    // add more HSN options here
  ]

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    mrp: "",
    costPrice: "",
    hsn: "",
    gst: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
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

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/products")
        const data = await res.json()
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error("Failed to load products:", err)
        setProducts([])
      }
      setLoading(false)
    }

    loadProducts()
  }, [])

  // Handle input changes
  function handleChange(e) {
    const { name, value, type, checked } = e.target
    let updatedForm = { ...form, [name]: type === "checkbox" ? checked : value }

    // Auto-fill GST if HSN changes
    if (name === "hsn") {
      const option = hsnOptions.find(o => o.hsn === value)
      if (option) updatedForm.gst = option.gst
    }

    setForm(updatedForm)
  }

  // Image upload
  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) {
        setForm(prev => ({ ...prev, image: data.url }))
      }
    } catch (err) {
      console.error("Upload failed:", err)
    }

    setUploading(false)
  }

  // Submit product
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.price) {
      alert("Name & Price required")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, alt: form.name })
      })
      const data = await res.json()
      if (data.success) {
        setMessage("✅ Product Added Successfully")
        setForm(emptyForm)
        // reload products
        const reload = await fetch("/api/admin/products")
        const reloadData = await reload.json()
        if (reloadData.success && Array.isArray(reloadData.products)) {
          setProducts(reloadData.products)
        }
      } else {
        alert(data.error || "Failed to add product")
      }
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
    setTimeout(() => setMessage(""), 2000)
  }

  // Delete product
  async function deleteProduct(slug) {
    if (!confirm("Delete this product?")) return
    try {
      await fetch("/api/admin/products/" + slug, { method: "DELETE" })
      setProducts(prev => prev.filter(p => p.slug !== slug))
    } catch (err) {
      console.error(err)
    }
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
        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
        <input name="price" type="number" placeholder="Selling Price" value={form.price} onChange={handleChange} required />
        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <input name="reorderLevel" type="number" placeholder="Reorder Level" value={form.reorderLevel} onChange={handleChange} />

        {/* HSN Dropdown */}
        <select name="hsn" value={form.hsn} onChange={handleChange} required>
          <option value="">Select HSN</option>
          {hsnOptions.map(opt => (
            <option key={opt.hsn} value={opt.hsn}>
              {opt.hsn} - {opt.description}
            </option>
          ))}
        </select>

        <input name="gst" type="number" placeholder="GST %" value={form.gst} onChange={handleChange} />

        <input name="weight" type="number" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} />
        <input name="length" type="number" placeholder="Length (cm)" value={form.length} onChange={handleChange} />
        <input name="breadth" type="number" placeholder="Breadth (cm)" value={form.breadth} onChange={handleChange} />
        <input name="height" type="number" placeholder="Height (cm)" value={form.height} onChange={handleChange} />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <input type="file" onChange={handleImageUpload} style={{ gridColumn: "span 2" }} />
        {uploading && <p>Uploading image...</p>}
        {form.image && <img src={form.image} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 6 }} />}

        <label style={{ gridColumn: "span 2" }}>
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured Product
        </label>

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
                <th>Name</th>
                <th>Brand</th>
                <th>Price</th>
                <th>MRP</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td>₹{p.price}</td>
                  <td>₹{p.mrp}</td>
                  <td>{p.stock}</td>
                  <td>{p.status}</td>
                  <td>
                    <button onClick={() => deleteProduct(p.slug)} style={{ background: "red", color: "#fff", padding: "6px 12px", borderRadius: 4 }}>
                      Delete
                    </button>
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
