"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "", description: "", costPrice: "", sellingPrice: "", mrp: "",
    images: [], variants: [], gstCategory: "Food", websiteCategory: ""
  });

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/admin/products");
      setProducts(data.products);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/admin/products", form);
      alert("Product added: " + data.product.name);
      setForm({ name: "", description: "", costPrice: "", sellingPrice: "", mrp: "", images: [], variants: [], gstCategory: "Food", websiteCategory: "" });
      fetchProducts();
    } catch (err) { console.error(err); alert(err.response?.data?.message || "Error"); }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Admin Products</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Cost Price" type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} required />
        <input placeholder="Selling Price" type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} required />
        <input placeholder="MRP" type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} required />

        <select value={form.gstCategory} onChange={e => setForm({ ...form, gstCategory: e.target.value })}>
          <option value="Food">Food</option>
          <option value="Electronics">Electronics</option>
        </select>

        <input placeholder="Website Category" value={form.websiteCategory} onChange={e => setForm({ ...form, websiteCategory: e.target.value })} required />

        <button type="submit">Add Product</button>
      </form>

      <div>
        {loading ? "Loading..." :
          products.map(p => (
            <div key={p._id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
              <h4>{p.name} ({p.sku})</h4>
              <p>{p.description}</p>
              <p>MRP: {p.mrp} | Selling: {p.sellingPrice} | Cost: {p.costPrice} | GST: {p.gstPercent}%</p>
            </div>
          ))}
      </div>
    </div>
  );
}
