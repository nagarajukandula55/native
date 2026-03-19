"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function StorePage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // or your auth method
        const res = await axios.get("/api/admin/store/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStores(res.data.stores || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Store Management</h1>
      {loading && <p>Loading stores...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Store Name</th>
              <th className="py-2 px-4 border-b">Code</th>
              <th className="py-2 px-4 border-b">Contact</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store._id} className="text-center">
                <td className="py-2 px-4 border-b">{store.name}</td>
                <td className="py-2 px-4 border-b">{store.code}</td>
                <td className="py-2 px-4 border-b">{store.contact}</td>
                <td className="py-2 px-4 border-b">
                  <Link
                    href={`/admin/(dashboard)/store/${store._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
