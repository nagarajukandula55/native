"use client"

import { useState } from "react"

export default function AdminProducts() {

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    featured: false,
    image: ""
  })

  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const uploadImage = async (file) => {
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    setForm((prev) => ({
      ...prev,
      image: data.url
    }))

    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      alert("Product added successfully")

      setForm({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        featured: false,
        image: ""
      })
    } else {
      alert("Error saving product")
    }
  }

  return (
    <div style={{ padding: 40 }}>

      <h1>Add Product</h1>

      <form onSubmit={handleSubmit}>

        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />

        <label>
          Featured
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
          />
        </label>

        <br /><br />

        <input
          type="file"
          onChange={(e) => uploadImage(e.target.files[0])}
        />

        {uploading && <p>Uploading...</p>}

        {form.image && (
          <img
            src={form.image}
            width={120}
            alt="preview"
          />
        )}

        <br /><br />

        <button type="submit">
          Save Product
        </button>

      </form>

    </div>
  )
}
