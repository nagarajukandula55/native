"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gstCategories] = useState(["FOOD", "ELECTRONICS", "BEVERAGES", "OTHERS"]);

  const [form, setForm] = useState({
    name: "",
    gstCategory: "",
    productCategory: "",
    description: "",
    mrp: "",
    price: "",
    costPrice: "",
    images: [],
  });

  const [newCategory, setNewCategory] = useState({ name: "", gstCategory: "" });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    const res = await axios.get("/api/admin/products");
    if (res.data.success) setProducts(res.data.products);
  }

  async function fetchCategories() {
    const res = await axios.get("/api/admin/categories");
    if (res.data.success) setCategories(res.data.categories);
  }

  // Form change handler
  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm((prev) => ({ ...prev, images: files }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  // Add product
  async function handleAddProduct(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.mrp || !form.costPrice || !form.gstCategory || !form.productCategory) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    // Upload images to Cloudinary
    let imageUrls = [];
    if (form.images.length > 0) {
      const data = new FormData();
      Array.from(form.images).forEach((file) => data.append("file", file));
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: data,
      });
      const imgData = await res.json();
      imageUrls.push(imgData.secure_url);
    }

    const payload = {
      ...form,
      images: imageUrls,
      price: Number(form.price),
      mrp: Number(form.mrp),
      costPrice: Number(form.costPrice),
    };

    const res = await axios.post("/api/admin/products", payload);
    if (res.data.success) {
      alert("Product added!");
      setForm({ name: "", gstCategory: "", productCategory: "", description: "", mrp: "", price: "", costPrice: "", images: [] });
      fetchProducts();
    } else {
      alert(res.data.message || "Failed to add product");
    }

    setLoading(false);
  }

  // Add new product category
  async function handleAddCategory() {
    if (!newCategory.name || !newCategory.gstCategory) return alert("Please fill all fields");
    const res = await axios.post("/api/admin/categories/add", newCategory);
    if (res.data.success) {
      alert("Category added!");
      setShowCategoryModal(false);
      setNewCategory({ name: "", gstCategory: "" });
      fetchCategories();
    } else {
      alert(res.data.message || "Failed to add category");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Products</h2>

      {/* ===== ADD PRODUCT FORM ===== */}
      <form onSubmit={handleAddProduct} style={{ marginTop: 20, border: "1px solid #ddd", padding: 20, borderRadius: 10 }}>
        <h3>Add Product</h3>

        <input placeholder="Product Name" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />

        <select name="gstCategory" value={form.gstCategory} onChange={handleChange} required style={inputStyle}>
          <option value="">Select GST Category</option>
          {gstCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <select name="productCategory" value={form.productCategory} onChange={handleChange} required style={{ ...inputStyle, flex: 1 }}>
            <option value="">Select Product Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button type="button" onClick={() => setShowCategoryModal(true)} style={{ padding: 10 }}>+ Add Category</button>
        </div>

        <textarea placeholder="Description" name="description" value={form.description} onChange={handleChange} style={inputStyle}></textarea>
        <input placeholder="MRP" name="mrp" value={form.mrp} onChange={handleChange} type="number" required style={inputStyle} />
        <input placeholder="Selling Price" name="price" value={form.price} onChange={handleChange} type="number" required style={inputStyle} />
        <input placeholder="Cost Price" name="costPrice" value={form.costPrice} onChange={handleChange} type="number" required style={inputStyle} />
        <input type="file" multiple name="images" onChange={handleChange} style={inputStyle} />

        <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Adding..." : "Add Product"}</button>
      </form>

      {/* ===== PRODUCTS LIST ===== */}
      <div style={{ marginTop: 40 }}>
        <h3>All Products</h3>
        {products.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10, display: "flex", alignItems: "center" }}>
            {p.thumbnail && <Image src={p.thumbnail} width={60} height={60} alt={p.name} />}
            <div style={{ marginLeft: 10 }}>
              <strong>{p.name}</strong> - ₹{p.price} | MRP: ₹{p.mrp} | Cost: ₹{p.costPrice}
              <div>GST: {p.gst}% | HSN: {p.hsn}</div>
              <div>Category: {p.productCategory?.name} | GST Category: {p.gstCategory}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== ADD CATEGORY MODAL ===== */}
      {showCategoryModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 10, width: 400 }}>
            <h3>Add New Product Category</h3>
            <input placeholder="Category Name" name="name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} style={inputStyle} />
            <select name="gstCategory" value={newCategory.gstCategory} onChange={(e) => setNewCategory({ ...newCategory, gstCategory: e.target.value })} style={inputStyle}>
              <option value="">Select GST Category</option>
              {gstCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={handleAddCategory} style={buttonStyle}>Add</button>
              <button onClick={() => setShowCategoryModal(false)} style={buttonStyle}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== STYLES ===== */
const inputStyle = { display: "block", width: "100%", padding: 10, margin: "10px 0", borderRadius: 6, border: "1px solid #ccc" };
const buttonStyle = { padding: 10, borderRadius: 6, border: "none", background: "#111", color: "#fff", cursor: "pointer" };
