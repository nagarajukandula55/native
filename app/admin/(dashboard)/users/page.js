"use client";

import { useEffect, useState } from "react";

export default function Users() {
  const emptyForm = { id: "", role: "", warehouseId: "", isActive: true };
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [roles, setRoles] = useState(["user", "admin", "store", "branding"]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [resUsers, resWarehouses] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/warehouses")
      ]);

      const usersJson = await resUsers.json();
      const whJson = await resWarehouses.json();

      if (usersJson.success !== false) setUsers(usersJson);
      if (whJson.success) setWarehouses(whJson.warehouses);

    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
    setLoading(false);
  }

  function editUser(u) {
    setForm({
      id: u._id,
      role: u.role,
      warehouseId: u.warehouseId || "",
      isActive: u.isActive,
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.id) return alert("Select a user to edit");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("✅ User updated successfully");
        setForm(emptyForm);
        loadData();
      } else {
        alert(json.message || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 2000);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Users...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>👤 Users Management</h1>
      {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}

      {/* Edit User Form */}
      <form
        onSubmit={handleSave}
        style={{
          marginTop: 20,
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
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="">-- Select Role --</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={form.warehouseId}
          onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
        >
          <option value="">-- Select Warehouse --</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>{w.name}</option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          /> Active
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
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Users Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "center" }}>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Warehouse</th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 20 }}>No Users found</td></tr>
            )}
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: "1px solid #eee", textAlign: "center" }}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.warehouseName || "-"}</td>
                <td>{u.isActive ? "Active" : "Disabled"}</td>
                <td>
                  <button
                    onClick={() => editUser(u)}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
