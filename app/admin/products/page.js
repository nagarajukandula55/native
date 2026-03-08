"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: 100,
    category: "General",
    featured: false,
    image: "",
    imageFile: null,
  });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ------------------------
  // Load Products
  // ------------------------
  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to load products", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ------------------------
  // Handle form change
  // ------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ------------------------
  // Handle image selection
  // ------------------------
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ------------------------
  // Upload image to Cloudinary
  // ------------------------
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || "";
    } catch (err) {
      console.error("Image upload failed", err);
      return "";
    }
  };

  // ------------------------
  // Add or Update Product
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = form.image || "";

      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile);
      }

      const payload = { ...form, price: Number(form.price), image: imageUrl };

      if (editingId) {
        // Update
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
      } else {
        // Add
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // Reset
      setForm({
        name: "",
        price: "",
        description: "",
        stock: 100,
        category: "General",
        featured: false,
        image: "",
        imageFile: null,
      });
      setPreview(null);
      setEditingId(null);

      loadProducts();
    } catch (err) {
      console.error("Failed to save product", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Edit Product
  // ------------------------
  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description || "",
      stock: p.stock || 100,
      category: p.category || "General",
      featured: p.featured || false,
      image: p.image || "",
      imageFile: null,
    });
    setPreview(p.image || null);
  };

  // ------------------------
  // Delete Product
  // ------------------------
  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadProducts();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "'Georgia', serif" }}>
      <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "500px" }}
      >
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <input name="category" type="text" placeholder="Category" value={form.category} onChange={handleChange} />
        <label>
          <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} /> Featured
        </label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {preview && (
          <div style={{ position: "relative", width: "150px", height: "150px" }}>
            <Image src={preview} alt={form.name} fill style={{ objectFit: "cover", borderRadius: "10px" }} />
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <hr style={{ margin: "40px 0" }} />

      <h2>Products List</h2>
      {products.length === 0 && <p>No products found</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((p) => (
          <div key={p.id} style={{ width: "200px", border: "1px solid #ccc", borderRadius: "8px", padding: "10px" }}>
            <div style={{ width: "100%", height: "150px", position: "relative" }}>
              {p.image ? (
                <Image src={p.image} alt={p.alt || p.name} fill style={{ objectFit: "cover", borderRadius: "8px" }} />
              ) : (
                <div style={{ background: "#eee", width: "100%", height: "100%", borderRadius: "8px" }}>No Image</div>
              )}
            </div>
            <h4>{p.name}</h4>
            <p>₹{p.price}</p>
            <p>{p.description}</p>
            <p>Stock: {p.stock}</p>
            <p>Category: {p.category}</p>
            <p>Featured: {p.featured ? "Yes" : "No"}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button onClick={() => startEdit(p)} style={{ flex: 1 }}>
                Edit
              </button>
              <button onClick={() => deleteProduct(p.id)} style={{ flex: 1 }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
