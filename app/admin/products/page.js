"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    sellingPrice: "",
    mrp: "",
    costPrice: "",
    category: "",
    subCategory: "",
    gstCategory: "",
    description: "",
    shortDescription: "",
    image: "",
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      name: "",
      sku: "",
      sellingPrice: "",
      mrp: "",
      costPrice: "",
      category: "",
      subCategory: "",
      gstCategory: "",
      description: "",
      shortDescription: "",
      image: "",
    });

    loadProducts();
  }

  const websiteCats = categories.filter(c => c.type === "website");
  const subCats = categories.filter(c => c.type === "sub");
  const gstCats = categories.filter(c => c.type === "gst");

  return (
    <div style={{ padding: 30 }}>
      <h2>🛍 Products</h2>

      <form onSubmit={handleSubmit} style={grid}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />

        <input name="sellingPrice" placeholder="Selling Price" onChange={handleChange} />
        <input name="mrp" placeholder="MRP" onChange={handleChange} />
        <input name="costPrice" placeholder="Cost Price" onChange={handleChange} />

        <select name="category" onChange={handleChange}>
          <option>Select Category</option>
          {websiteCats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select name="subCategory" onChange={handleChange}>
          <option>Sub Category</option>
          {subCats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select name="gstCategory" onChange={handleChange}>
          <option>GST Category</option>
          {gstCats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <textarea name="description" placeholder="Description" onChange={handleChange} style={{ gridColumn: "span 2" }} />

        <button style={{ gridColumn: "span 2" }}>Add Product</button>
      </form>

      <hr />

      {products.map(p => (
        <div key={p._id} style={card}>
          <h4>{p.name}</h4>
          <p>₹{p.sellingPrice}</p>
        </div>
      ))}
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const card = {
  padding: 10,
  border: "1px solid #ddd",
  marginTop: 10,
};
