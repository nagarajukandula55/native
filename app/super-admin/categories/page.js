"use client";

import { useEffect, useState } from "react";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "website",
    parent: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({ name: "", type: "website", parent: "" });
    loadCategories();
  }

  const websiteCats = categories.filter(c => c.type === "website");
  const subCats = categories.filter(c => c.type === "sub");
  const gstCats = categories.filter(c => c.type === "gst");

  return (
    <div style={{ padding: 30 }}>
      <h2>📂 Category Manager</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Category Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="website">Website</option>
          <option value="sub">Sub Category</option>
          <option value="gst">GST</option>
        </select>

        {form.type === "sub" && (
          <select
            value={form.parent}
            onChange={(e) => setForm({ ...form, parent: e.target.value })}
          >
            <option value="">Select Parent</option>
            {websiteCats.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        )}

        <button>Add</button>
      </form>

      <div style={{ marginTop: 30 }}>
        <h3>Website Categories</h3>
        {websiteCats.map(c => <p key={c._id}>{c.name}</p>)}

        <h3>Sub Categories</h3>
        {subCats.map(c => (
          <p key={c._id}>
            {c.name} → {websiteCats.find(p => p._id === c.parent)?.name}
          </p>
        ))}

        <h3>GST Categories</h3>
        {gstCats.map(c => <p key={c._id}>{c.name}</p>)}
      </div>
    </div>
  );
}
