"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const usersRes = await axios.get("/api/admin/users");
        setUsers(usersRes.data || []);

        // Fetch warehouses
        const whRes = await axios.get("/api/admin/warehouses");
        setWarehouses(whRes.data || []);
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async (userId, field, value) => {
    try {
      const body = { id: userId };
      body[field] = value;

      const res = await axios.put("/api/admin/users", body);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...res.data.user } : u))
      );
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Warehouse</th>
            <th className="border p-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">
                <select
                  value={user.role}
                  onChange={(e) => handleUpdate(user._id, "role", e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="store">Store</option>
                  <option value="branding">Branding</option>
                  <option value="user">User</option>
                </select>
              </td>
              <td className="border p-2">
                <select
                  value={user.warehouseId || ""}
                  onChange={(e) =>
                    handleUpdate(user._id, "warehouseId", e.target.value || null)
                  }
                  className="border p-1 rounded"
                >
                  <option value="">-- None --</option>
                  {warehouses.map((wh) => (
                    <option key={wh._id} value={wh._id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </td>
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={user.isActive ?? true}
                  onChange={(e) =>
                    handleUpdate(user._id, "isActive", e.target.checked)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
