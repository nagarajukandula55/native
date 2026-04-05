"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/categories");
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error("FETCH CATEGORIES ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ADD / UPDATE CATEGORY ================= */
  const handleSubmit = async () => {
    if (!newCategory.trim()) return;

    try {
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory._id}`, {
          name: newCategory,
        });
      } else {
        await axios.post("/api/admin/categories", { name: newCategory });
      }
      setNewCategory("");
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("CATEGORY SUBMIT ERROR:", err);
    }
  };

  /* ================= EDIT CATEGORY ================= */
  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setNewCategory(cat.name);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Categories Management</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Category Name"
          style={{ padding: 8, marginRight: 10 }}
        />
        <button onClick={handleSubmit}>
          {editingCategory ? "Update Category" : "Add Category"}
        </button>
      </div>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{cat.name}</td>
                <td>
                  <button onClick={() => handleEdit(cat)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
