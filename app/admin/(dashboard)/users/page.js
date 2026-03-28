"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  const handleChange = (id, field, value) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, [field]: value } : u))
    );
  };

  const handleSave = async (user) => {
    const res = await fetch(`/api/admin/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (data.success) {
      alert("User updated successfully");
      setEditingId(null);
    } else {
      alert(data.message || "Update failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin: User Management</h1>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Warehouse Name</th>
            <th className="p-2">Warehouse Code</th>
            <th className="p-2">Active</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-t">
              <td className="p-2">
                {editingId === u._id ? (
                  <input
                    value={u.name}
                    onChange={(e) => handleChange(u._id, "name", e.target.value)}
                  />
                ) : (
                  u.name
                )}
              </td>

              <td className="p-2">
                {editingId === u._id ? (
                  <input
                    value={u.email}
                    onChange={(e) => handleChange(u._id, "email", e.target.value)}
                  />
                ) : (
                  u.email
                )}
              </td>

              <td className="p-2">
                {editingId === u._id ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleChange(u._id, "role", e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="store">Store</option>
                    <option value="admin">Admin</option>
                    <option value="branding">Branding</option>
                  </select>
                ) : (
                  u.role
                )}
              </td>

              <td className="p-2">
                {editingId === u._id ? (
                  <input
                    value={u.warehouseName || ""}
                    onChange={(e) =>
                      handleChange(u._id, "warehouseName", e.target.value)
                    }
                  />
                ) : (
                  u.warehouseName || "-"
                )}
              </td>

              <td className="p-2">
                {editingId === u._id ? (
                  <input
                    value={u.warehouseCode || ""}
                    onChange={(e) =>
                      handleChange(u._id, "warehouseCode", e.target.value)
                    }
                  />
                ) : (
                  u.warehouseCode || "-"
                )}
              </td>

              <td className="p-2 text-center">
                {editingId === u._id ? (
                  <input
                    type="checkbox"
                    checked={u.isActive}
                    onChange={(e) =>
                      handleChange(u._id, "isActive", e.target.checked)
                    }
                  />
                ) : u.isActive ? (
                  "✅"
                ) : (
                  "❌"
                )}
              </td>

              <td className="p-2">
                {editingId === u._id ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 mr-2"
                      onClick={() => handleSave(u)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white px-2 py-1"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-2 py-1"
                    onClick={() => setEditingId(u._id)}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
