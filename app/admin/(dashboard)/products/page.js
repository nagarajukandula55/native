
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

    <div style={{maxWidth:"1100px", margin:"auto", padding:"20px"}}>

      <h1 style={{fontSize:"28px", fontWeight:"bold", marginBottom:"20px"}}>
        Product Manager
      </h1>

      <form onSubmit={handleSubmit} style={{display:"grid", gap:"10px", marginBottom:"30px"}}>

        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required/>

        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange}/>

        <input name="category" placeholder="Category" value={form.category} onChange={handleChange}/>

        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange}/>

        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange}/>

        <input type="file" onChange={handleImageUpload}/>

        {uploading && <p>Uploading...</p>}

        {form.image && (
          <img
            src={form.image}
            alt="preview"
            style={{
              width:"100px",
              height:"100px",
              objectFit:"cover",
              borderRadius:"6px"
            }}
          />
        )}

        <label>

          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange}/>

          Featured Product

        </label>

        <button style={{padding:"10px", background:"black", color:"white"}}>
          Add Product
        </button>

      </form>

      <table style={{width:"100%", borderCollapse:"collapse"}}>

        <thead>

          <tr style={{background:"#eee"}}>

            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {products.map(product => (

            <tr key={product._id}>

              <td>

                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width:"60px",
                    height:"60px",
                    objectFit:"cover"
                  }}
                />

              </td>

              <td>{product.name}</td>

              <td>₹{product.price}</td>

              <td>{product.stock}</td>

              <td>{product.category}</td>

              <td>

                <button onClick={()=>deleteProduct(product.slug)}>
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
