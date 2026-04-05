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

  /* ================= GST AUTO-FILL ================= */
  function handleGstChange(e) {
    const selected = gstCategories.find((c) => c.name === e.target.value);

    setForm((prev) => ({
      ...prev,
      gstCategory: selected?.name || "",
      hsnCode: selected?.hsn || "",
      gstPercent: selected?.gst || 0,
    }));
  }

  /* ================= FORM CHANGE ================= */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    setForm((prev) => ({ ...prev, images: e.target.files }));
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key === "images") {
        for (let file of form.images) {
          formData.append("images", file);
        }
      } else if (form[key] !== null) {
        formData.append(key, form[key]);
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

  /* ================= EDIT ================= */
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

  /* ================= ADD CATEGORY ================= */
  async function addWebsiteCategory() {
    if (!newWebsiteCategory) return;

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWebsiteCategory, type: "website" }),
    });

    const data = await res.json();
    if (data.success) {
      fetchCategories();
      setNewWebsiteCategory("");
    }
  }

  async function addGstCategory() {
    const { name, hsn, gst } = newGstCategory;
    if (!name || !hsn || !gst) return;

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type: "gst", hsn, gst }),
    });

    const data = await res.json();
    if (data.success) {
      fetchCategories();
      setNewGstCategory({ name: "", hsn: "", gst: "" });
    }
  }

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: "auto" }}>
      <h1>Products</h1>

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />

        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

        {/* WEBSITE CATEGORY */}
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Website Category</option>
          {websiteCategories.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* GST CATEGORY */}
        <select name="gstCategory" value={form.gstCategory} onChange={handleGstChange}>
          <option value="">GST Category</option>
          {gstCategories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name} (HSN: {c.hsn}, GST: {c.gst}%)
            </option>
          ))}
        </select>

        <input value={form.hsnCode} readOnly placeholder="HSN" />
        <input value={form.gstPercent} readOnly placeholder="GST %" />

        <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="sellingPrice" type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <input type="file" multiple onChange={handleFileChange} />

        <button type="submit">{loading ? "Saving..." : editing ? "Update" : "Create"}</button>
      </form>

      {/* ===== TABLE ===== */}
      <table width="100%">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>GST</th>
            <th>Price</th>
            <th>Status</th>
            <th>Edit</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                {p.images?.[0] && (
                  <Image src={p.images[0]} width={60} height={60} alt={p.name} />
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.gstCategory}</td>
              <td>₹{p.sellingPrice}</td>
              <td>{p.status}</td>
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
