"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateStorePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    code: "",
    contact: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/store/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Store Created");
        router.push("/admin/(dashboard)/store");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h1 className="text-xl font-bold mb-4">Create Store</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Store Name"
          className="w-full border p-2"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Code"
          className="w-full border p-2"
          onChange={(e) =>
            setForm({ ...form, code: e.target.value })
          }
        />

        <input
          placeholder="Contact"
          className="w-full border p-2"
          onChange={(e) =>
            setForm({ ...form, contact: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="w-full border p-2"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full border p-2"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 w-full"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Store"}
        </button>
      </form>
    </div>
  );
}
