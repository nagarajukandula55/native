"use client";

import { useState } from "react";

export default function CreateStorePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/store/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Store Created Successfully");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Create Store</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Store Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={input}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={input}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={input}
        />

        <button disabled={loading} style={btn}>
          {loading ? "Creating..." : "Create Store"}
        </button>
      </form>
    </div>
  );
}

const input = { width: "100%", padding: 10, margin: "10px 0" };
const btn = { width: "100%", padding: 10, background: "green", color: "#fff" };
