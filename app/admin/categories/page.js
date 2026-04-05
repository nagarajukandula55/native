"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "website", // website or gst
    hsn: "",
    gst: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        await axios.put(`/api/admin/categories/${editing._id}`, form);
      } else {
        await axios.post("/api/admin/categories", form);
      }

      setForm({ name: "", type: "website", hsn: "", gst: "" });
      setEditing(null);
      fetchCategories();
    } catch (err) {
      console.error("Save category error:", err);
    }

    setLoading(false);
  };

  const handleEdit = (category) => {
    setForm(category);
    setEditing(category);
  };

  return (
    <div style={container}>
      <h1>Admin Categories</h1>

      {/* Add/Edit Category Form */}
      <form style={formCard} onSubmit={handleSubmit}>
        <h2>{editing ? "Edit Category" : "Add Category"}</h2>

        <input
          name="name"
          placeholder="Category Name"
          value={form.name}
          onChange={handleChange}
          required
          style={input}
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          required
          style={input}
        >
          <option value="website">Website Category</option>
          <option value="gst">GST Category</option>
        </select>

        {form.type === "gst" && (
          <>
            <input
              name="hsn"
              placeholder="HSN Code"
              value={form.hsn}
              onChange={handleChange}
              required
              style={input}
            />
            <input
              name="gst"
              placeholder="GST %"
              type="number"
              value={form.gst}
              onChange={handleChange}
              required
              style={input}
            />
          </>
        )}

        <button type="submit" disabled={loading} style={button}>
          {loading ? "Saving..." : editing ? "Update Category" : "Add Category"}
        </button>
      </form>

      {/* Categories Table */}
      <table style={table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>HSN</th>
            <th>GST %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.type}</td>
              <td>{c.hsn || "-"}</td>
              <td>{c.gst || "-"}</td>
              <td>
                <button onClick={() => handleEdit(c)} style={buttonSmall}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== STYLES ===== */
const container = { padding: 20 };
const formCard = {
  padding: 20,
  marginBottom: 40,
  borderRadius: 10,
  background: "#fff",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};
const input = { width: "100%", padding: 10, marginBottom: 10, borderRadius: 5 };
const button = { padding: 10, background: "#111", color: "#fff", border: "none" };
const buttonSmall = { padding: 5, background: "#333", color: "#fff", border: "none" };
const table = { width: "100%", borderCollapse: "collapse", marginTop: 20 };
