"use client";

import { useState, useEffect } from "react";

export default function AdminProducts() {

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    mrp: "",
    costPrice: "",
    category: "",
    brand: "",
    images: [],
    featured: false,
    status: "ACTIVE",
  };

  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  /* ================= LOAD PRODUCTS ================= */
  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();

    if (data.success) {
      setProducts(data.products); // ✅ FIXED
    }
  }

  /* ================= LOAD CATEGORIES ================= */
  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();

    if (data.success) {
      setCategories(data.categories);
    }
  }

  /* ================= HANDLE CHANGE ================= */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  /* ================= IMAGE UPLOAD ================= */
  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data.url) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      }
    }
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      alert("Product added");
      setForm(emptyForm);
      loadProducts();
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Products</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit}>

        <input name="name" placeholder="Name" onChange={handleChange} />

        <select name="category" onChange={handleChange}>
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <input name="price" placeholder="Price" onChange={handleChange} />
        <input name="mrp" placeholder="MRP" onChange={handleChange} />
        <input name="costPrice" placeholder="Cost Price" onChange={handleChange} />

        <input type="file" multiple onChange={handleImageUpload} />

        <div style={{ display: "flex", gap: 10 }}>
          {form.images.map((img, i) => (
            <img key={i} src={img} width={60} />
          ))}
        </div>

        <button>Add Product</button>
      </form>

      {/* LIST */}
      <div style={{ marginTop: 30 }}>
        {products.map((p) => (
          <div key={p._id} style={{ borderBottom: "1px solid #ccc", padding: 10 }}>
            <img src={p.images?.[0]} width={60} />
            <p>{p.name}</p>
            <p>₹ {p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
