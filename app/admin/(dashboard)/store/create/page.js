"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CreateStorePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/admin/store/create",
        { name, code, contact },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/admin/(dashboard)/store");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Store</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Store Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Code</label>
          <input
            type="text"
            className="w-full border px-3 py-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Contact</label>
          <input
            type="text"
            className="w-full border px-3 py-2"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Store"}
        </button>
      </form>
    </div>
  );
}
