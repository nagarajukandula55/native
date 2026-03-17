"use client";

import { useState, useEffect } from "react";

export default function CreateSKU() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    code: "",
    partCode: "",
    product: "",
    warehouse: "",
    price: 0,
    stock: 0,
    isActive: true,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function fetchWarehouses() {
    const res = await fetch("/api/admin/warehouse/list");
    const data = await res.json();
    setWarehouses(data.warehouses || []);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/sku", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.success ? "SKU created!" : data.error);
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 30 }}>
      <h1>Create SKU</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input name="code" placeholder="SKU Code" value={form.code} onChange={handleChange} required />
        <input name="partCode" placeholder="Part Code" value={form.partCode} onChange={handleChange} required />
        <select name="product" value={form.product} onChange={handleChange} required>
          <option value="">Select Product</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select name="warehouse" value={form.warehouse} onChange={handleChange} required>
          <option value="">Select Warehouse</option>
          {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <label>
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
        </label>
        <button type="submit">Create SKU</button>
      </form>
    </div>
  );
}
