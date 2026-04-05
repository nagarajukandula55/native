"use client";

import { useState, useEffect } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ _id: "", name: "", type: "website" });
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (data.success) setCategories(data.categories);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setForm({ _id: "", name: "", type: "website" });
      setFormOpen(false);
      fetchCategories();
    }
    setLoading(false);
  };

  const handleEdit = (c) => { setForm(c); setFormOpen(true); };

  return (
    <div style={{ padding: 20 }}>
      <h1>Categories</h1>
      <button onClick={() => setFormOpen(true)}>Add Category</button>

      {formOpen && (
        <form onSubmit={handleSubmit} style={{ margin: "20px 0", border: "1px solid #ccc", padding: 20 }}>
          <input placeholder="Category Name" name="name" value={form.name} onChange={handleChange} required />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="website">Website (for products dropdown)</option>
            <option value="gst">GST Category (food/hsn mapping)</option>
          </select>
          <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          <button type="button" onClick={() => setFormOpen(false)}>Cancel</button>
        </form>
      )}

      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.type}</td>
              <td><button onClick={() => handleEdit(c)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
