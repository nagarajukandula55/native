"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    subCategory: "",
    price: 0,
    mrp: 0,
    costPrice: 0,
    discount: 0,
    images: [],
    description: "",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("website");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    try {
      const { data } = await axios.get("/api/admin/products");
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await axios.get("/api/admin/categories");
      setCategories(data.categories.filter(c => c.active));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.category) return toast.error("Name and category required");

    setLoading(true);
    try {
      if (editId) {
        await axios.put(`/api/admin/products/${editId}`, form);
        toast.success("Product updated");
      } else {
        await axios.post("/api/admin/products", form);
        toast.success("Product added");
      }
      setForm({
        name: "",
        category: "",
        subCategory: "",
        price: 0,
        mrp: 0,
        costPrice: 0,
        discount: 0,
        images: [],
        description: "",
        active: true,
      });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save product");
    }
    setLoading(false);
  }

  function handleEdit(product) {
    setForm(product);
    setEditId(product._id);
  }

  async function addCategory() {
    if (!newCatName.trim()) return toast.error("Category name required");
    try {
      await axios.post("/api/admin/categories", { name: newCatName, type: newCatType });
      toast.success("Category added");
      setNewCatName("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Products Admin</h1>

      {/* ADD CATEGORY INLINE */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          placeholder="New Category Name"
          value={newCatName}
          onChange={e => setNewCatName(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", flex: "1 1 200px" }}
        />
        <select value={newCatType} onChange={e => setNewCatType(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}>
          <option value="website">Website Category</option>
          <option value="gst">GST / Food Category</option>
        </select>
        <button onClick={addCategory} style={{ padding: "10px 20px", borderRadius: 6, background: "#111", color: "#fff", border: "none" }}>Add Category</button>
      </div>

      {/* PRODUCT FORM */}
      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 10, marginBottom: 30 }}>
        <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input placeholder="Subcategory (optional)" value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
        <input type="number" placeholder="MRP" value={form.mrp} onChange={e => setForm({...form, mrp: Number(e.target.value)})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
        <input type="number" placeholder="Selling Price" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
        <input type="number" placeholder="Cost Price" value={form.costPrice} onChange={e => setForm({...form, costPrice: Number(e.target.value)})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
        <input type="number" placeholder="Discount %" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
        <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", gridColumn: "1/-1" }} />
        <input placeholder="Image URLs (comma separated)" value={form.images.join(",")} onChange={e => setForm({...form, images: e.target.value.split(",")})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", gridColumn: "1/-1" }} />
        <div style={{ gridColumn: "1/-1" }}>
          <button type="submit" style={{ padding: "10px 20px", borderRadius: 6, background: "#111", color: "#fff", border: "none" }}>{editId ? "Update Product" : "Add Product"}</button>
        </div>
      </form>

      {/* PRODUCTS TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>MRP</th>
            <th>Cost</th>
            <th>Discount %</th>
            <th>Status</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{categories.find(c => c._id === p.category)?.name || "-"}</td>
              <td>{p.price}</td>
              <td>{p.mrp}</td>
              <td>{p.costPrice}</td>
              <td>{p.discount}</td>
              <td>{p.active ? "Active" : "Inactive"}</td>
              <td>
                {p.images[0] && <img src={p.images[0]} alt={p.name} style={{ width: 50, height: 50, objectFit: "cover" }} />}
              </td>
              <td>
                <button onClick={() => handleEdit(p)} style={{ padding: "5px 10px", borderRadius: 6, background: "#2563eb", color: "#fff", border: "none" }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
