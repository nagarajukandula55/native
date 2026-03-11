"use client"

import { useState } from "react"

export default function AdminProducts() {

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
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

    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    if (data.url) {

      setForm((prev) => ({
        ...prev,
        image: data.url
      }))

    } else {

      alert("Image upload failed")

    }

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
        description: "",
        price: "",
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

    <div style={{ padding: "40px" }}>

      <h1>Add Product</h1>

      <form onSubmit={handleSubmit}>

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <br /><br />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />

        <br /><br />

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

        {uploading && <p>Uploading image...</p>}

        {form.image && (
          <div>
            <p>Image Preview</p>
            <img
              src={form.image}
              width="150"
              alt="preview"
            />
          </div>
        )}

        <br /><br />

        <button type="submit">
          Add Product
        </button>

      </form>

    </div>
  )
}
