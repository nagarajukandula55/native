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
      console.error("Failed to load products", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image selection
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Image upload failed");
    return data.url;
  };

  // Add / Update Product
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
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
      } else {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setForm({
        name: "",
        price: "",
        description: "",
        image: "",
        stock: 100,
        category: "General",
        featured: false,
        imageFile: null,
      });
      setPreview(null);
      setEditingId(null);
      await loadProducts();
      alert(editingId ? "Product updated!" : "Product added!");
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Error saving product. See console.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      image: product.image || "",
      stock: product.stock || 100,
      category: product.category || "General",
      featured: product.featured || false,
      imageFile: null,
    });
    setPreview(product.image || null);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await loadProducts();
      alert("Product deleted!");
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "'Arial', sans-serif" }}>
      <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}
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
        {preview && <img src={preview} width="150" style={{ borderRadius: "10px" }} />}
        <button type="submit" disabled={loading}>
          {loading ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <hr style={{ margin: "40px 0" }} />

      <h2>Products List</h2>
      {products.length === 0 && <p>No products found</p>}

      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: "25px", border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
          {p.image && <img src={p.image} width="120" style={{ borderRadius: "8px" }} alt={p.alt || p.name} />}
          <h4>{p.name}</h4>
          <p>₹{p.price}</p>
          <p>{p.description}</p>
          <p>Stock: {p.stock}</p>
          <p>Category: {p.category}</p>
          <p>Featured: {p.featured ? "Yes" : "No"}</p>
          <button onClick={() => startEdit(p)} style={{ marginRight: "10px" }}>Edit</button>
          <button onClick={() => deleteProduct(p.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
