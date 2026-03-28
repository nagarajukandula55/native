"use client";

import { useEffect, useState } from "react";

export default function Warehouses() {
  const emptyForm = {
    name: "",
    code: "",
    type: "",
    city: "",
    managerName: "",
    allowDispatch: true,
    allowPurchase: true,
    isActive: true,
  };

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadWarehouses();
  }, []);

  async function loadWarehouses() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/warehouses");
      const json = await res.json();
      if (json.success) setWarehouses(json.warehouses);
    } catch (err) {
      console.error(err);
      alert("Failed to load warehouses");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return alert("Warehouse name required");
    setSaving(true);

    try {
      const url = editingId ? `/api/admin/warehouses/${editingId}` : "/api/admin/warehouses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setMessage(editingId ? "✅ Warehouse updated" : "✅ Warehouse added");
      setForm(emptyForm);
      setEditingId(null);
      loadWarehouses();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save warehouse");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  function editWarehouse(w) {
    setForm({
      name: w.name,
      code: w.code,
      type: w.type || "",
      city: w.city || "",
      managerName: w.managerName || "",
      allowDispatch: w.allowDispatch,
      allowPurchase: w.allowPurchase,
      isActive: w.isActive,
    });
    setEditingId(w._id);
  }

  async function toggleStatus(id, current) {
    try {
      await fetch(`/api/admin/warehouses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      loadWarehouses();
    } catch {
      alert("Failed to toggle status");
    }
  }

  async function deleteWarehouse(id) {
    if (!confirm("Delete this warehouse?")) return;
    try {
      await fetch(`/api/admin/warehouses/${id}`, { method: "DELETE" });
      loadWarehouses();
    } catch {
      alert("Failed to delete warehouse");
    }
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Warehouses...</h2>;

  return (
    <div style={{ maxWidth: 1300, margin: "auto", padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>🏭 Warehouses Management</h1>
      {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 25,
          marginBottom: 30,
          padding: 20,
          border: "1px solid #eee",
          borderRadius: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
          background: "#f9fafb",
        }}
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <input
          placeholder="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <input
          placeholder="Manager Name"
          value={form.managerName}
          onChange={(e) => setForm({ ...form, managerName: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={form.allowDispatch}
            onChange={(e) => setForm({ ...form, allowDispatch: e.target.checked })}
          />{" "}
          Allow Dispatch
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.allowPurchase}
            onChange={(e) => setForm({ ...form, allowPurchase: e.target.checked })}
          />{" "}
          Allow Purchase
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />{" "}
          Active
        </label>
        <button
          disabled={saving}
          style={{
            padding: 12,
            background: "#1e40af",
            color: "#fff",
            borderRadius: 6,
            cursor: "pointer",
            gridColumn: "span 2",
          }}
        >
          {saving ? "Saving..." : editingId ? "Update Warehouse" : "Add Warehouse"}
        </button>
      </form>

      {/* Warehouses Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>City</th>
              <th>Manager</th>
              <th>Dispatch</th>
              <th>Purchase</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w._id} style={{ borderBottom: "1px solid #eee", textAlign: "center" }}>
                <td>{w.code}</td>
                <td>{w.name}</td>
                <td>{w.type}</td>
                <td>{w.city}</td>
                <td>{w.managerName}</td>
                <td>{w.allowDispatch ? "Yes" : "No"}</td>
                <td>{w.allowPurchase ? "Yes" : "No"}</td>
                <td>
                  <button
                    onClick={() => toggleStatus(w._id, w.isActive)}
                    style={{
                      background: w.isActive ? "#16a34a" : "#dc2626",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    {w.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => editWarehouse(w)}
                    style={{
                      background: "#0a7cff",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => deleteWarehouse(w._id)}
                    style={{
                      background: "red",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
