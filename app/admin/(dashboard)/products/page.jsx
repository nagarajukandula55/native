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
    images: [],
    sku: "",
  }

  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, search])

  function generateSKU(name) {
    return name.substring(0, 3).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000)
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price) return 0
    return Math.round(((mrp - price) / mrp) * 100)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    let updated = { ...form, [name]: type === "checkbox" ? checked : value }

    if (name === "hsn") {
      const selected = HSN_LIST.find(h => h.hsn === value)
      if (selected) updated.gst = selected.gst
    }

    setForm(updated)
  }

  async function loadProducts() {
    const res = await fetch("/api/admin/products")
    const data = await res.json()
    setProducts(data.data || [])
    setLoading(false)
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    setUploading(true)

    const uploaded = []

    for (let file of files) {
      const fd = new FormData()
      fd.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      })

      const data = await res.json()
      if (data.url) uploaded.push(data.url)
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded],
    }))

    setUploading(false)
  }

  function buildPayload() {
    return {
      ...form,
      price: Number(form.price),
      mrp: Number(form.mrp),
      costPrice: Number(form.costPrice),
      gst: Number(form.gst),
      weight: Number(form.weight),
      dimensions: {
        length: Number(form.length),
        breadth: Number(form.breadth),
        height: Number(form.height),
      },
      image: form.images[0],
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.sku) {
      form.sku = generateSKU(form.name)
    }

    setSaving(true)

    const payload = buildPayload()

    const url = editing
      ? `/api/admin/products/${form.slug}`
      : "/api/admin/products"

    const method = editing ? "PUT" : "POST"

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setForm(emptyForm)
    setEditing(false)
    loadProducts()
    setSaving(false)
  }

  function editProduct(p) {
    setForm({
      ...p,
      images: p.images || [],
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
        p.sku?.toLowerCase().includes(s)
      )
    }

    setFilteredProducts(temp)
  }

  return (
    <div style={{ maxWidth: 1300, margin: "auto", padding: 30 }}>
      <h1>🛍 Products Admin</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={formGrid}>
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input name="sku" placeholder="SKU (Auto if empty)" value={form.sku} onChange={handleChange} />

        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Category</option>
          {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
        </select>

        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />

        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="price" type="number" placeholder="Selling Price" value={form.price} onChange={handleChange} />

        <p style={{ gridColumn: "span 2", color: "green" }}>
          Discount: {calculateDiscount(form.mrp, form.price)}%
        </p>

        <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />

        <select name="hsn" value={form.hsn} onChange={handleChange}>
          <option>HSN</option>
          {HSN_LIST.map(h => (
            <option key={h.hsn} value={h.hsn}>{h.hsn} - {h.gst}%</option>
          ))}
        </select>

        <input name="gst" value={form.gst} readOnly />

        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ gridColumn: "span 2" }} />

        <input type="file" multiple onChange={handleImageUpload} style={{ gridColumn: "span 2" }} />

        <div style={{ display: "flex", gap: 10 }}>
          {form.images.map((img, i) => (
            <img key={i} src={img} style={{ width: 60 }} />
          ))}
        </div>

        <button disabled={saving} style={{ gridColumn: "span 2" }}>
          {saving ? "Saving..." : editing ? "Update" : "Add Product"}
        </button>
      </form>

      {/* LIST */}
      {loading ? <p>Loading...</p> : (
        <table style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Discount</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p._id}>
                <td><img src={p.image} width={50} /></td>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{calculateDiscount(p.mrp, p.price)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 20,
}
