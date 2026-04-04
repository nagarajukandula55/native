"use client"

import { useState, useEffect } from "react"
import { HSN_LIST } from "@/lib/hsn"
import { CATEGORIES } from "@/lib/category"

export default function AdminProducts() {
  const emptyForm = {
    name: "",
    description: "",
    price: "",
    mrp: "",
    costPrice: "",
    category: "",
    brand: "",
    hsn: "",
    gst: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    featured: false,
    status: "ACTIVE",
    image: "",
    sku: "",
  }

  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [editing, setEditing] = useState(false)
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, search, sortField, sortOrder])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    const updatedForm = { ...form, [name]: type === "checkbox" ? checked : value }

    if (name === "hsn") {
      const selected = HSN_LIST.find(h => h.hsn === value)
      if (selected) updatedForm.gst = selected.gst
    }

    setForm(updatedForm)
  }

  async function loadProducts() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/products")
      const data = await res.json()
      setProducts(data?.data || [])
    } catch {
      alert("Failed to load products")
    }
    setLoading(false)
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      })

      const data = await res.json()
      if (data.url) {
        setForm(prev => ({ ...prev, image: data.url }))
      }
    } catch {
      alert("Image upload failed")
    }

    setUploading(false)
  }

  function buildPayload() {
    return {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      mrp: Number(form.mrp),
      costPrice: Number(form.costPrice),
      category: form.category,
      brand: form.brand,
      hsn: form.hsn,
      gst: Number(form.gst),
      weight: Number(form.weight),
      dimensions: {
        length: Number(form.length),
        breadth: Number(form.breadth),
        height: Number(form.height),
      },
      image: form.image,
      featured: form.featured,
      status: form.status,
      sku: form.sku,
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.name || !form.price || !form.sku) {
      return alert("Name, Price & SKU are required")
    }

    setSaving(true)

    try {
      const payload = buildPayload()

      if (editing) {
        await fetch(`/api/admin/products/${form.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        setMessage("✅ Product Updated")
      } else {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        setMessage("✅ Product Created")
      }

      setForm(emptyForm)
      setEditing(false)
      await loadProducts()
    } catch (err) {
      console.error(err)
      alert("Failed to save product")
    }

    setSaving(false)
    setTimeout(() => setMessage(""), 2000)
  }

  function editProduct(p) {
    setForm({
      ...p,
      length: p.dimensions?.length || "",
      breadth: p.dimensions?.breadth || "",
      height: p.dimensions?.height || "",
    })
    setEditing(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function deleteProduct(slug) {
    if (!confirm("Delete this product?")) return
    await fetch("/api/admin/products/" + slug, { method: "DELETE" })
    loadProducts()
  }

  function applyFilters() {
    let temp = [...products]

    if (search) {
      const s = search.toLowerCase()
      temp = temp.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s)
      )
    }

    if (sortField) {
      temp.sort((a, b) => {
        const aValue = a[sortField] ?? ""
        const bValue = b[sortField] ?? ""

        if (typeof aValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }

        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      })
    }

    setFilteredProducts(temp)
  }

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 30 }}>
      <h1 style={{ fontSize: 30, fontWeight: "bold" }}>
        🛍 Admin Product Manager
      </h1>

      {message && <p style={{ color: "green" }}>{message}</p>}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid #eee",
          borderRadius: 10,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input name="sku" placeholder="SKU (Unique)" value={form.sku} onChange={handleChange} required />

        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {CATEGORIES.map(cat => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />

        <input name="price" type="number" placeholder="Selling Price" value={form.price} onChange={handleChange} required />
        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />

        <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />

        <select name="hsn" value={form.hsn} onChange={handleChange} required>
          <option value="">Select HSN</option>
          {HSN_LIST.map(h => (
            <option key={h.hsn} value={h.hsn}>
              {h.hsn} - GST {h.gst}%
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

        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ gridColumn: "span 2" }} />

        <input type="file" onChange={handleImageUpload} style={{ gridColumn: "span 2" }} />
        {uploading && <p>Uploading...</p>}
        {form.image && <img src={form.image} style={{ width: 80 }} />}

        <label style={{ gridColumn: "span 2" }}>
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured
        </label>

        <button disabled={saving} style={{ gridColumn: "span 2" }}>
          {saving ? "Saving..." : editing ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", marginTop: 30 }}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p._id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{p.status}</td>
                <td>
                  <button onClick={() => editProduct(p)}>Edit</button>
                  <button onClick={() => deleteProduct(p.slug)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
