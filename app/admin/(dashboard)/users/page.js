// app/admin/(dashboard)/users/page.js
"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const roles = ["user", "admin", "store", "branding"];

  // Fetch users and warehouses
  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, warehousesRes] = await Promise.all([
          fetch("/api/admin/users").then((r) => r.json()),
          fetch("/api/admin/warehouses").then((r) => r.json()),
        ]);

        setUsers(usersRes || []);
        setWarehouses(warehousesRes || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle changes in dropdowns or toggle
  const handleChange = (id, field, value) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, [field]: value } : u))
    );
  };

  // Save user update
  const handleSave = async (user) => {
    try {
      setSavingId(user._id);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user._id,
          role: user.role,
          warehouseId: user.warehouseId,
          isActive: user.isActive,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update user");
      } else {
        // Update local user with returned warehouse info
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...data.user } : u
          )
        );
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error updating user");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p className="p-4 text-gray-500">Loading users...</p>;
  if (!users.length) return <p className="p-4 text-gray-500">No users found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin - Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Warehouse</th>
              <th className="px-4 py-2 border">Active</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">
                  <select
                    value={user.role}
                    onChange={(e) => handleChange(user._id, "role", e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border">
                  <select
                    value={user.warehouseId || ""}
                    onChange={(e) => handleChange(user._id, "warehouseId", e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="">-- None --</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border text-center">
                  <input
                    type="checkbox"
                    checked={user.isActive}
                    onChange={(e) => handleChange(user._id, "isActive", e.target.checked)}
                    className="w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleSave(user)}
                    disabled={savingId === user._id}
                    className={`px-3 py-1 rounded text-white ${
                      savingId === user._id ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {savingId === user._id ? "Saving..." : "Save"}
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
