"use client";

import { useState } from "react";

const ROLES = [
  "super_admin",
  "admin",
  "logistics",
  "customer_support",
  "finance",
  "vendor",
  "branding",
  "customer",
  "analytics",
];

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [msg, setMsg] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      setMsg("✅ User Created");
      setForm({ name: "", email: "", password: "", role: "" });
    } else {
      setMsg("❌ " + data.message);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h2>Create User</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} /><br /><br />

        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} /><br /><br />

        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} /><br /><br />

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="">Select Role</option>
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <br /><br />

        <button type="submit">Create User</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
