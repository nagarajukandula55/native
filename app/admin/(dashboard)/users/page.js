// app/admin/(dashboard)/users/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [roles, setRoles] = useState(["user", "admin", "store", "branding"]);
  const [loading, setLoading] = useState(true);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await axios.get("/api/admin/warehouses");
      if (res.data.success) setWarehouses(res.data.warehouses);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch warehouses");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWarehouses();
  }, []);

  // Update user
  const handleUpdate = async (userId, field, value) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, { [field]: value });
      toast.success("Updated successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Warehouse</th>
                <th className="px-4 py-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>

                  {/* Role Dropdown */}
                  <td className="px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdate(user._id, "role", e.target.value)}
                      className="border px-2 py-1 rounded"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Warehouse Dropdown */}
                  <td className="px-4 py-2">
                    {user.role === "store" ? (
                      <select
                        value={user.warehouseId || ""}
                        onChange={(e) => handleUpdate(user._id, "warehouseId", e.target.value)}
                        className="border px-2 py-1 rounded"
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

                  <td className="px-4 py-2">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
