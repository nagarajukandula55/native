"use client";

import { useState, useEffect } from "react";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: 100,
    category: "General",
    featured: false,
    imageFile: null,
  });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load products
  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };
  useEffect(() => { loadProducts(); }, []);

  // Form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Image selection
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload to Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url;
  };

  // Add / Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = form.image || "";
      if (form.imageFile) imageUrl = await uploadImage(form.imageFile);

      const payload = { ...form, price: Number(form.price), image: imageUrl };

      if (editingId) {
        await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, id: editingId }) });
      } else {
        await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }

      setForm({ name: "", price: "", description: "", image: "", stock: 100, category: "General", featured: false, imageFile: null });
      setPreview(null);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  // Edit product
  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ ...p, imageFile: null });
    setPreview(p.image || null);
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      await loadProducts();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 40, fontFamily: "Georgia, serif" }}>
      <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 500 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <label><input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} /> Featured</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {preview && <img src={preview} width={150} style={{ borderRadius: 10 }} />}
        <button type="submit" disabled={loading}>{loading ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update Product" : "Add Product"}</button>
      </form>

      <hr style={{ margin: "40px 0" }} />
      <h2>Products List</h2>
      {products.length === 0 && <p>No products found</p>}
      {products.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", padding: 10, borderRadius: 8, marginBottom: 20 }}>
          {p.image && <img src={p.image} width={120} style={{ borderRadius: 8 }} />}
          <h4>{p.name}</h4>
          <p>₹{p.price}</p>
          <p>{p.description}</p>
          <p>Stock: {p.stock}</p>
          <p>Category: {p.category}</p>
          <p>Featured: {p.featured ? "Yes" : "No"}</p>
          <button onClick={() => startEdit(p)} style={{ marginRight: 10 }}>Edit</button>
          <button onClick={() => deleteProduct(p.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
