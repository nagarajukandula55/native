"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [websiteCategories, setWebsiteCategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);

  const [form, setForm] = useState({
    _id: null,
    name: "",
    description: "",
    category: "",
    gstCategory: "",
    hsnCode: "",
    gstPercent: 0,
    costPrice: "",
    mrp: "",
    sellingPrice: "",
    status: "active",
    images: [],
  });

  const [newWebsiteCategory, setNewWebsiteCategory] = useState("");
  const [newGstCategory, setNewGstCategory] = useState({ name: "", hsn: "", gst: "" });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  }

  async function fetchCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();

    if (data.success) {
      const all = data.categories;
      setWebsiteCategories(all.filter((c) => c.type === "website"));
      setGstCategories(all.filter((c) => c.type === "gst"));
    }
  }

  /* ================= GST AUTO FILL ================= */
  function handleGstChange(e) {
    const selected = gstCategories.find((c) => c.name === e.target.value);

    setForm((prev) => ({
      ...prev,
      gstCategory: selected?.name || "",
      hsnCode: selected?.hsn || "",
      gstPercent: selected?.gst || 0,
    }));
  }

  /* ================= HANDLERS ================= */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, images: files }));
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, value);
      }
    });

    const res = await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      resetForm();
      fetchProducts();
    } else {
      alert(data.message);
    }

    setLoading(false);
  }

  function resetForm() {
    setForm({
      _id: null,
      name: "",
      description: "",
      category: "",
      gstCategory: "",
      hsnCode: "",
      gstPercent: 0,
      costPrice: "",
      mrp: "",
      sellingPrice: "",
      status: "active",
      images: [],
    });
    setEditing(false);
  }

  function handleEdit(p) {
    setForm({
      _id: p._id,
      name: p.name,
      description: p.description,
      category: p.category,
      gstCategory: p.gstCategory,
      hsnCode: p.hsnCode,
      gstPercent: p.gstPercent,
      costPrice: p.costPrice,
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      status: p.status,
      images: [],
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ================= CATEGORY ADD ================= */
  async function addWebsiteCategory() {
    if (!newWebsiteCategory) return;

    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWebsiteCategory, type: "website" }),
    });

    setNewWebsiteCategory("");
    fetchCategories();
  }

  async function addGstCategory() {
    const { name, hsn, gst } = newGstCategory;
    if (!name || !hsn || !gst) return;

    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type: "gst", hsn, gst }),
    });

    setNewGstCategory({ name: "", hsn: "", gst: "" });
    fetchCategories();
  }

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: "auto" }}>
      <h1 style={{ marginBottom: 20 }}>Product Management</h1>

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit} style={card}>
        <h2>{editing ? "Edit Product" : "Add Product"}</h2>

        <div style={grid}>
          <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />

          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Website Category</option>
            {websiteCategories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* ADD WEBSITE CATEGORY */}
          <div style={inline}>
            <input
              placeholder="New Category"
              value={newWebsiteCategory}
              onChange={(e) => setNewWebsiteCategory(e.target.value)}
            />
            <button type="button" onClick={addWebsiteCategory}>+ Add</button>
          </div>

          <select value={form.gstCategory} onChange={handleGstChange}>
            <option value="">GST Category</option>
            {gstCategories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name} ({c.gst}%)
              </option>
            ))}
          </select>

          {/* ADD GST CATEGORY */}
          <div style={inline}>
            <input placeholder="GST Name" value={newGstCategory.name} onChange={(e) => setNewGstCategory({ ...newGstCategory, name: e.target.value })} />
            <input placeholder="HSN" value={newGstCategory.hsn} onChange={(e) => setNewGstCategory({ ...newGstCategory, hsn: e.target.value })} />
            <input placeholder="GST %" value={newGstCategory.gst} onChange={(e) => setNewGstCategory({ ...newGstCategory, gst: e.target.value })} />
            <button type="button" onClick={addGstCategory}>+ Add</button>
          </div>

          <input value={form.hsnCode} readOnly placeholder="HSN Code" />
          <input value={form.gstPercent} readOnly placeholder="GST %" />

          <input name="costPrice" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
          <input name="mrp" placeholder="MRP" value={form.mrp} onChange={handleChange} />
          <input name="sellingPrice" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} />
        </div>

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ marginTop: 10 }}
        />

        {/* IMAGE PREVIEW */}
        <input type="file" multiple onChange={handleFileChange} />
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {form.images.map((file, i) => (
            <img key={i} src={URL.createObjectURL(file)} width={60} />
          ))}
        </div>

        <button style={btn}>{loading ? "Saving..." : "Save Product"}</button>
      </form>

      {/* ================= TABLE ================= */}
      <div style={card}>
        <h2>Products</h2>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  {p.images?.[0] && <Image src={p.images[0]} width={50} height={50} alt="" />}
                </td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.sellingPrice}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  marginBottom: 30,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const inline = {
  display: "flex",
  gap: 5,
};

const btn = {
  marginTop: 15,
  padding: 10,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};
