```javascript
"use client"

import { useState, useEffect } from "react"

export default function AdminProducts() {

  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
    featured: false,
    slug: ""
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {

    const res = await fetch("/api/admin/products")
    const data = await res.json()

    setProducts(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })

    setForm({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      stock: "",
      featured: false,
      slug: ""
    })

    fetchProducts()
  }

  async function deleteProduct(slug) {

    if (!confirm("Delete this product?")) return

    await fetch(`/api/admin/products/${slug}`, {
      method: "DELETE"
    })

    fetchProducts()
  }

  return (

    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Admin Products
      </h1>

      {/* ADD PRODUCT FORM */}

      <form onSubmit={handleSubmit} className="space-y-3 mb-10">

        <input
          placeholder="Name"
          className="border p-2 w-full"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
        />

        <input
          placeholder="Slug"
          className="border p-2 w-full"
          value={form.slug}
          onChange={e => setForm({...form, slug: e.target.value})}
        />

        <input
          placeholder="Price"
          className="border p-2 w-full"
          value={form.price}
          onChange={e => setForm({...form, price: e.target.value})}
        />

        <input
          placeholder="Category"
          className="border p-2 w-full"
          value={form.category}
          onChange={e => setForm({...form, category: e.target.value})}
        />

        <input
          placeholder="Stock"
          className="border p-2 w-full"
          value={form.stock}
          onChange={e => setForm({...form, stock: e.target.value})}
        />

        <button className="bg-black text-white px-6 py-2">
          Add Product
        </button>

      </form>

      {/* PRODUCT LIST */}

      <h2 className="text-xl font-semibold mb-4">
        Existing Products
      </h2>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {products.map(product => (

            <tr key={product._id} className="border-t">

              <td className="p-2">{product.name}</td>

              <td>₹{product.price}</td>

              <td>{product.stock}</td>

              <td className="space-x-3">

                <button
                  className="text-red-600"
                  onClick={() => deleteProduct(product.slug)}
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
```
