// app/admin/(dashboard)/users/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [roles, setRoles] = useState(["user", "admin", "store", "branding"]);
  const [loading, setLoading] = useState(true);

  // Fetch users and warehouses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, whRes] = await Promise.all([
          axios.get("/api/admin/users"),
          axios.get("/api/admin/warehouses"),
        ]);

        setUsers(usersRes.data || []);
        setWarehouses(whRes.data.warehouses || []);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update user role or warehouse
  const handleUpdate = async (userId, field, value) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, { [field]: value });
      const updatedUsers = users.map((u) =>
        u._id === userId ? { ...u, [field]: value } : u
      );
      setUsers(updatedUsers);
      alert("Updated successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg font-medium">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg shadow-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Email</th>
              <th className="px-4 py-3 border-b">Role</th>
              <th className="px-4 py-3 border-b">Warehouse</th>
              <th className="px-4 py-3 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{user.name}</td>
                <td className="px-4 py-2 border-b">{user.email}</td>

                {/* Role dropdown */}
                <td className="px-4 py-2 border-b">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleUpdate(user._id, "role", e.target.value)
                    }
                    className="border rounded px-2 py-1 w-full"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Warehouse dropdown */}
                <td className="px-4 py-2 border-b">
                  {user.role === "store" ? (
                    <select
                      value={user.warehouseId || ""}
                      onChange={(e) =>
                        handleUpdate(user._id, "warehouseId", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="">-- Select Warehouse --</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>

                <td className="px-4 py-2 border-b">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
