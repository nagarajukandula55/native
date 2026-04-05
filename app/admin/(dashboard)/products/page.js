"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [websiteCategories, setWebsiteCategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    shortDescription: "",
    websiteCategory: "",
    gstCategory: "",
    costPrice: "",
    mrp: "",
    sellingPrice: "",
    discount: "",
    active: true,
    images: [],
  });
  const [newWebsiteCategory, setNewWebsiteCategory] = useState("");
  const [newGstCategory, setNewGstCategory] = useState({ name: "", hsn: "", gst: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchProducts();
    fetchWebsiteCategories();
    fetchGstCategories();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  };

  const fetchWebsiteCategories = async () => {
    const res = await fetch("/api/admin/website-categories");
    const data = await res.json();
    if (data.success) setWebsiteCategories(data.categories);
  };

  const fetchGstCategories = async () => {
    const res = await fetch("/api/admin/gst-categories");
    const data = await res.json();
    if (data.success) setGstCategories(data.categories);
  };

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, images: e.target.files });
  };

  /* ================= ADD / EDIT PRODUCT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    for (const key in form) {
      if (key === "images") {
        for (let i = 0; i < form.images.length; i++) {
          formData.append("images", form.images[i]);
        }
      } else {
        formData.append(key, form[key]);
      }
    }

    const url = editing ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      alert("Product saved successfully!");
      setForm({
        id: null,
        name: "",
        description: "",
        shortDescription: "",
        websiteCategory: "",
        gstCategory: "",
        costPrice: "",
        mrp: "",
        sellingPrice: "",
        discount: "",
        active: true,
        images: [],
      });
      setEditing(false);
      fetchProducts();
    } else {
      alert(data.message || "Error saving product");
    }
    setLoading(false);
  };

  /* ================= EDIT EXISTING PRODUCT ================= */
  const handleEdit = (product) => {
    setForm({
      id: product._id,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      websiteCategory: product.websiteCategory,
      gstCategory: product.gstCategory,
      costPrice: product.costPrice,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      discount: product.discount,
      active: product.active,
      images: [], // new upload only, existing images shown in table
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= ADD WEBSITE CATEGORY ================= */
  const addWebsiteCategory = async () => {
    if (!newWebsiteCategory) return;
    const res = await fetch("/api/admin/website-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWebsiteCategory }),
    });
    const data = await res.json();
    if (data.success) {
      setWebsiteCategories([...websiteCategories, data.category]);
      setNewWebsiteCategory("");
    } else alert(data.message || "Failed to add category");
  };

  /* ================= ADD GST CATEGORY ================= */
  const addGstCategory = async () => {
    const { name, hsn, gst } = newGstCategory;
    if (!name || !hsn || !gst) return;
    const res = await fetch("/api/admin/gst-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hsn, gst }),
    });
    const data = await res.json();
    if (data.success) {
      setGstCategories([...gstCategories, data.category]);
      setNewGstCategory({ name: "", hsn: "", gst: "" });
    } else alert(data.message || "Failed to add GST category");
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "auto" }}>
      <h1 style={{ marginBottom: 20 }}>Admin Products</h1>

      {/* ================= PRODUCT FORM ================= */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          marginBottom: 40,
        }}
      >
        <h2>{editing ? "Edit Product" : "Add Product"}</h2>

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <textarea
          name="description"
          placeholder="Full Description"
          value={form.description}
          onChange={handleChange}
          style={{ ...inputStyle, height: 80 }}
        />
        <textarea
          name="shortDescription"
          placeholder="Short Description"
          value={form.shortDescription}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Website Category */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <select
            name="websiteCategory"
            value={form.websiteCategory}
            onChange={handleChange}
            style={{ flex: 1, padding: 8 }}
          >
            <option value="">Select Website Category</option>
            {websiteCategories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Add Website Category"
            value={newWebsiteCategory}
            onChange={(e) => setNewWebsiteCategory(e.target.value)}
          />
          <button type="button" onClick={addWebsiteCategory}>
            Add
          </button>
        </div>

        {/* GST Category */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <select
            name="gstCategory"
            value={form.gstCategory}
            onChange={handleChange}
            style={{ flex: 1, padding: 8 }}
          >
            <option value="">Select GST Category</option>
            {gstCategories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name} (HSN: {c.hsn}, GST: {c.gst}%)
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="GST Name"
            value={newGstCategory.name}
            onChange={(e) => setNewGstCategory({ ...newGstCategory, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="HSN"
            value={newGstCategory.hsn}
            onChange={(e) => setNewGstCategory({ ...newGstCategory, hsn: e.target.value })}
          />
          <input
            type="number"
            placeholder="GST %"
            value={newGstCategory.gst}
            onChange={(e) => setNewGstCategory({ ...newGstCategory, gst: e.target.value })}
          />
          <button type="button" onClick={addGstCategory}>
            Add
          </button>
        </div>

        {/* Prices */}
        <input
          type="number"
          name="costPrice"
          placeholder="Cost Price"
          value={form.costPrice}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="number"
          name="mrp"
          placeholder="MRP"
          value={form.mrp}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="number"
          name="sellingPrice"
          placeholder="Selling Price"
          value={form.sellingPrice}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="number"
          name="discount"
          placeholder="Discount %"
          value={form.discount}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Active */}
        <label style={{ display: "block", marginTop: 10 }}>
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />{" "}
          Active
        </label>

        {/* Images */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginTop: 10 }}
        />

        <button type="submit" disabled={loading} style={submitButton}>
          {loading ? "Saving..." : editing ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* ================= PRODUCTS TABLE ================= */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Website Category</th>
            <th>GST Category</th>
            <th>Cost</th>
            <th>MRP</th>
            <th>Selling</th>
            <th>Discount</th>
            <th>Active</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>
                {p.images && p.images.length > 0 && (
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    width={60}
                    height={60}
                    style={{ objectFit: "cover" }}
                  />
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.websiteCategory}</td>
              <td>{p.gstCategory}</td>
              <td>{p.costPrice}</td>
              <td>{p.mrp}</td>
              <td>{p.sellingPrice}</td>
              <td>{p.discount}</td>
              <td>{p.active ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== STYLES ===== */
const inputStyle = {
  display: "block",
  width: "100%",
  padding: 8,
  marginTop: 10,
  borderRadius: 5,
  border: "1px solid #ccc",
};

const submitButton = {
  marginTop: 15,
  padding: 12,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
