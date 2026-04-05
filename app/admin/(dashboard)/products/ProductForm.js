"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function ProductForm({ product, setProduct, onSuccess }) {
  const [form, setForm] = useState({
    name: "", category: "", gstCategory: "", price: "", mrp: "", costPrice: "", discount: 0, description: "", images: [], gst: 0, active: true
  });

  useEffect(() => {
    if (product) setForm(product);
  }, [product]);

  async function handleSubmit(e) {
    e.preventDefault();
    const url = product ? "/api/admin/products" : "/api/admin/products";
    const method = product ? "put" : "post";

    const { data } = await axios({ method, url, data: form });
    if (data.success) {
      onSuccess();
      setProduct(null);
      setForm({ name: "", category: "", gstCategory: "", price: "", mrp: "", costPrice: "", discount: 0, description: "", images: [], gst: 0, active: true });
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 10, border: "1px solid #ccc" }}>
      <h3>{product ? "Edit Product" : "Add Product"}</h3>
      <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
      <input placeholder="GST Category" value={form.gstCategory} onChange={e => setForm({ ...form, gstCategory: e.target.value })} required />
      <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
      <input placeholder="MRP" type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} required />
      <input placeholder="Cost Price" type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} required />
      <input placeholder="Discount %" type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
      <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
      <input placeholder="Images (comma-separated URLs)" value={form.images.join(",")} onChange={e => setForm({ ...form, images: e.target.value.split(",") })} />
      <label>
        Active <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
      </label>
      <button type="submit">{product ? "Update" : "Add"}</button>
    </form>
  );
}
