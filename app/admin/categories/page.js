"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await axios.get("/api/admin/categories");
    if (data.success) setCategories(data.categories);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name) return;
    const { data } = await axios.post("/api/admin/categories", { name });
    if (data.success) {
      setName("");
      fetchCategories();
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Categories</h1>
      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
        <input placeholder="Add new category" value={name} onChange={e => setName(e.target.value)} required />
        <button type="submit">Add</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={2}>Loading...</td></tr>
          ) : categories.length === 0 ? (
            <tr><td colSpan={2}>No categories</td></tr>
          ) : categories.map(cat => (
            <tr key={cat._id}>
              <td>{cat.name}</td>
              <td>{cat.slug}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
