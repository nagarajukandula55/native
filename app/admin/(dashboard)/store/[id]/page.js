"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axios from "axios";

export default function EditStorePage() {
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/admin/store/get/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStore(res.data.store);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [params.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/store/update/${params.id}`,
        { name: store.name, code: store.code, contact: store.contact },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/admin/(dashboard)/store");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading store...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Store</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-1">Store Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2"
            value={store.name}
            onChange={(e) => setStore({ ...store, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Code</label>
          <input
            type="text"
            className="w-full border px-3 py-2"
            value={store.code}
            onChange={(e) => setStore({ ...store, code: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Contact</label>
          <input
            type="text"
            className="w-full border px-3 py-2"
            value={store.contact}
            onChange={(e) => setStore({ ...store, contact: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
