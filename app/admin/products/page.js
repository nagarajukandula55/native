"use client";

import { useState, useEffect } from "react";

// Simple Toast Component for notifications
function Toast({ message, type = "success", onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: type === "error" ? "#b02a37" : "#2e7d32",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        zIndex: 9999,
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      }}
      onClick={onClose}
    >
      {message}
    </div>
  );
}

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
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

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
      showToast("Failed to load products", "error");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ------------------------
  // Toast notifications
  // ------------------------
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ------------------------
  // Handle form changes
  // ------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // ------------------------
  // Handle image selection & preview
  // ------------------------
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ------------------------
  // Upload image to API
  // ------------------------
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.url) throw new Error("Image upload failed");
    return data.url;
  };

  // ------------------------
  // Add or update product
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return showToast("Name and Price are required", "error");

    setLoading(true);
    try {
      let imageUrl = form.image || "";
      if (form.imageFile) imageUrl = await uploadImage(form.imageFile);

      const payload = { ...form, price: Number(form.price), image: imageUrl };

      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...payload, id: editingId } : payload;

      await fetch("/api/admin/products", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      showToast(editingId ? "Product updated successfully" : "Product added successfully");

      // Reset form
      setForm({ name: "", price: "", description: "", stock: 100, category: "General", featured: false, image: "", imageFile: null });
      setPreview(null);
      setEditingId(null);

      await loadProducts();
    } catch (err) {
      console.error("Save product error:", err);
      showToast("Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Edit product
  // ------------------------
  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      stock: product.stock || 100,
      category: product.category || "General",
      featured: product.featured || false,
      image: product.image || "",
      imageFile: null,
    });
    setPreview(product.image || null);
  };

  // ------------------------
  // Delete product
  // ------------------------
  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      showToast("Product deleted successfully");
      await loadProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      showToast("Failed to delete product", "error");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Filtered products
  // ------------------------
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  // ------------------------
  // Render
  // ------------------------
  return (
    <div style={{ padding: "40px", fontFamily: "'Georgia', serif", maxWidth: "900px", margin: "0 auto" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <input name="category" type="text" placeholder="Category" value={form.category} onChange={handleChange} />
        <label>
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured
        </label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {preview && <img src={preview} width="150" style={{ borderRadius: "10px" }} />}
        <button type="submit" disabled={loading} style={{ padding: "10px", cursor: "pointer" }}>
          {loading ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <input
        placeholder="Search Products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px", padding: "8px", width: "100%" }}
      />

      <h2>Products List ({filteredProducts.length})</h2>
      {filteredProducts.length === 0 && <p>No products found</p>}

      {filteredProducts.map((p) => (
        <div key={p.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "15px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "15px" }}>
          {p.image && <img src={p.image} width="100" style={{ borderRadius: "8px" }} />}
          <div style={{ flex: 1 }}>
            <h4>{p.name}</h4>
            <p>₹{p.price}</p>
            <p>{p.description}</p>
            <p>Stock: {p.stock}</p>
            <p>Category: {p.category}</p>
            <p>Featured: {p.featured ? "Yes" : "No"}</p>
          </div>
          <div>
            <button onClick={() => startEdit(p)} style={{ marginRight: "10px" }}>Edit</button>
            <button onClick={() => deleteProduct(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
