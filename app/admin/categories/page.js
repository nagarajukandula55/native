"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("website"); // website / gst
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data } = await axios.get("/api/admin/categories");
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name required");

    setLoading(true);
    try {
      let res;
      if (editId) {
        res = await axios.put(`/api/admin/categories/${editId}`, { name, type });
        toast.success("Category updated");
      } else {
        res = await axios.post("/api/admin/categories", { name, type });
        toast.success("Category added");
      }

      setName("");
      setType("website");
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving category");
    }
    setLoading(false);
  }

  function handleEdit(cat) {
    setName(cat.name);
    setType(cat.type);
    setEditId(cat._id);
  }

  async function toggleStatus(cat) {
    try {
      await axios.put(`/api/admin/categories/${cat._id}/status`, {
        active: !cat.active,
      });
      fetchCategories();
      toast.success("Status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  }

  return (
    <div style={container}>
      <h1 style={title}>Manage Categories</h1>

      {/* ADD / EDIT FORM */}
      <form onSubmit={handleSubmit} style={form}>
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
          <option value="website">Website Category</option>
          <option value="gst">GST / Food Category</option>
        </select>

        <button type="submit" style={button} disabled={loading}>
          {loading ? "Saving..." : editId ? "Update Category" : "Add Category"}
        </button>
      </form>

      {/* CATEGORY TABLE */}
      <table style={table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td>{cat.name}</td>
              <td>{cat.type}</td>
              <td>
                <button
                  onClick={() => toggleStatus(cat)}
                  style={{
                    ...statusBtn,
                    background: cat.active ? "#16a34a" : "#dc2626",
                  }}
                >
                  {cat.active ? "Active" : "Inactive"}
                </button>
              </td>
              <td>
                <button onClick={() => handleEdit(cat)} style={editBtn}>
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
const container = {
  padding: 20,
  maxWidth: 900,
  margin: "0 auto",
};

const title = {
  fontSize: 28,
  fontWeight: 600,
  marginBottom: 20,
};

const form = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
  flexWrap: "wrap",
};

const input = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
  flex: "1 1 200px",
};

const button = {
  padding: "10px 20px",
  borderRadius: 6,
  background: "#111",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const statusBtn = {
  padding: "5px 10px",
  borderRadius: 6,
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const editBtn = {
  padding: "5px 10px",
  borderRadius: 6,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};
