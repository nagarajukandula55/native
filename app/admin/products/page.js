"use client"

import { useState, useEffect } from "react"

export default function AdminProducts() {

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    featured: false,
    slug: "",
    image: "",
    alt: ""
  }

  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [uploading, setUploading] = useState(false)
  const [editingSlug, setEditingSlug] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {

    const res = await fetch("/api/admin/products")

    const data = await res.json()

    setProducts(data)
  }

  function handleChange(e) {

    const { name, value, type, checked } = e.target

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    })
  }

  async function handleImageUpload(e) {

    const file = e.target.files[0]

    if (!file) return

    setUploading(true)

    const formData = new FormData()

    formData.append("file", file)

    try {

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      setForm({
        ...form,
        image: data.url
      })

    } catch (error) {

      console.error("Upload error:", error)

    }

    setUploading(false)
  }

  async function handleSubmit(e) {

    e.preventDefault()

    const method = editingSlug ? "PUT" : "POST"

    const url = editingSlug
      ? "/api/admin/products/" + editingSlug
      : "/api/admin/products"

    await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })

    setForm(emptyForm)
    setEditingSlug(null)

    fetchProducts()
  }

  function editProduct(product) {

    setForm(product)

    setEditingSlug(product.slug)

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function deleteProduct(slug) {

    const confirmDelete = window.confirm("Delete this product?")

    if (!confirmDelete) return

    await fetch("/api/admin/products/" + slug, {
      method: "DELETE"
    })

    fetchProducts()
  }

  return (

    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">
        Admin Product Manager
      </h1>

      {/* PRODUCT FORM */}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mb-10">

        <input
          name="name"
          placeholder="Product Name"
          className="border p-2"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="slug"
          placeholder="Slug"
          className="border p-2"
          value={form.slug}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          className="border p-2"
          value={form.price}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          className="border p-2"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          className="border p-2"
          value={form.stock}
          onChange={handleChange}
        />

        <input
          name="alt"
          placeholder="Image Alt Text"
          className="border p-2"
          value={form.alt}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="border p-2 md:col-span-2"
          value={form.description}
          onChange={handleChange}
        />

        {/* IMAGE UPLOAD */}

        <div>

          <input
            type="file"
            onChange={handleImageUpload}
          />

          {uploading && (
            <p className="text-sm text-gray-500">
              Uploading...
            </p>
          )}

        </div>

        {/* IMAGE PREVIEW */}

        {form.image && (

          <img
            src={form.image}
            className="h-32 object-cover rounded"
          />

        )}

        {/* FEATURED */}

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
          />

          Featured Product

        </label>

        <button className="bg-black text-white px-6 py-2 rounded">

          {editingSlug ? "Update Product" : "Add Product"}

        </button>

      </form>

      {/* PRODUCT TABLE */}

      <h2 className="text-2xl font-semibold mb-4">
        Existing Products
      </h2>

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-2">Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {products.map(product => (

            <tr key={product._id} className="border-t">

              <td className="p-2">

                {product.image && (

                  <img
                    src={product.image}
                    className="h-14 w-14 object-cover rounded"
                  />

                )}

              </td>

              <td>{product.name}</td>

              <td>₹{product.price}</td>

              <td>{product.stock}</td>

              <td>{product.category}</td>

              <td className="space-x-3">

                <button
                  onClick={() => editProduct(product)}
                  className="text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(product.slug)}
                  className="text-red-600"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}
