"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);

  /* ================= FETCH CATEGORIES ================= */
  async function fetchCategories() {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/categories");
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ADD / EDIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      if (editCategory) {
        // Update existing category
        await axios.put("/api/admin/categories", {
          categoryId: editCategory._id,
          name: newCategory,
        });
      } else {
        // Add new category
        await axios.post("/api/admin/categories", { name: newCategory });
      }

      setNewCategory("");
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= EDIT HANDLER ================= */
  function editHandler(cat) {
    setEditCategory(cat);
    setNewCategory(cat.name);
  }

  /* ================= DELETE HANDLER ================= */
  async function deleteHandler(catId) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await axios.delete(`/api/admin/categories?categoryId=${catId}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Website Categories</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          required
        />
        <button type="submit">{editCategory ? "Update" : "Add"}</button>
        {editCategory && (
          <button type="button" onClick={() => { setEditCategory(null); setNewCategory(""); }}>Cancel</button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td>
                  <button onClick={() => editHandler(cat)}>Edit</button>
                  <button onClick={() => deleteHandler(cat._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
