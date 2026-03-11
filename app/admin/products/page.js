"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function AdminProducts() {

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    featured: false,
    image: ""
  }

  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {

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

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    setForm({
      ...form,
      image: data.url
    })

    setUploading(false)

  }

  async function handleSubmit(e) {

    e.preventDefault()

    await fetch("/api/admin/products", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        ...form,
        alt: form.name
      })

    })

    setForm(emptyForm)

    loadProducts()

  }

  async function deleteProduct(slug) {

    if (!window.confirm("Delete this product?")) return

    await fetch("/api/admin/products/" + slug, {
      method: "DELETE"
    })

    loadProducts()

  }

  return (

    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">
        Product Manager
      </h1>

      {/* FORM */}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mb-10">

        <input
          name="name"
          placeholder="Product Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          className="border p-2 rounded"
          value={form.price}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          className="border p-2 rounded"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          className="border p-2 rounded"
          value={form.stock}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="border p-2 rounded md:col-span-2"
          value={form.description}
          onChange={handleChange}
        />

        <div>
          <input type="file" onChange={handleImageUpload} />
          {uploading && <p>Uploading...</p>}
        </div>

        {form.image && (

          <div className="relative w-[100px] h-[100px] border rounded">

            <Image
              src={form.image}
              alt="preview"
              fill
              sizes="100px"
              className="object-cover rounded"
            />

          </div>

        )}

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
          Add Product
        </button>

      </form>

      {/* PRODUCTS TABLE */}

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-2">Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {products.map(product => (

            <tr key={product._id} className="border-t">

              <td className="p-2">

                {product.image && (

                  <div className="relative w-[60px] h-[60px]">

                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="60px"
                      className="object-cover rounded"
                    />

                  </div>

                )}

              </td>

              <td>{product.name}</td>

              <td>₹{product.price}</td>

              <td>{product.stock}</td>

              <td>{product.category}</td>

              <td>

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

