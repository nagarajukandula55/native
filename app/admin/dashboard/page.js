"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", image: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch products on mount
  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new product
  const addProduct = async () => {
    if (!form.name || !form.price) return alert("Name and price are required");
    setLoading(true);
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    });
    setForm({ name: "", price: "", image: "", description: "" });
    await fetchProducts();
    setLoading(false);
  };

  // Start editing a product
  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      image: product.image || "",
      description: product.description || "",
    });
  };

  // Update product
  const updateProduct = async () => {
    if (!editingId) return;
    setLoading(true);
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...form, price: Number(form.price) }),
    });
    setForm({ name: "", price: "", image: "", description: "" });
    setEditingId(null);
    await fetchProducts();
    setLoading(false);
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchProducts();
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "'Georgia', serif" }}>
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>Admin Dashboard</h1>

      {/* Add / Edit Product Form */}
      <div style={{ marginBottom: "30px", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          style={{ padding: "10px" }}
        />
        <input
          type="text"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          style={{ padding: "10px" }}
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
          style={{ padding: "10px" }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          style={{ padding: "10px" }}
        />
        {editingId ? (
          <button
            onClick={updateProduct}
            disabled={loading}
            style={{ padding: "10px", backgroundColor: "#2e7d32", color: "#fff", border: "none", cursor: "pointer" }}
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        ) : (
          <button
            onClick={addProduct}
            disabled={loading}
            style={{ padding: "10px", backgroundColor: "#c28b45", color: "#fff", border: "none", cursor: "pointer" }}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        )}
      </div>

      {/* Product List */}
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>Name</th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>Price</th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>Image</th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>Description</th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td style={{ padding: "10px" }}>{p.name}</td>
              <td style={{ padding: "10px" }}>₹{p.price}</td>
              <td style={{ padding: "10px" }}>
                {p.image && (
                  <img src={p.image} alt={p.name} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                )}
              </td>
              <td style={{ padding: "10px" }}>{p.description}</td>
              <td style={{ padding: "10px", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => startEdit(p)}
                  style={{ padding: "6px 12px", backgroundColor: "#1976d2", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p._id)}
                  style={{ padding: "6px 12px", backgroundColor: "#b02a37", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
