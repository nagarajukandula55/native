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

export default function CreateUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    businessName: "",
    gstNumber: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setMsg("❌ " + data.message);
      } else {
        setMsg("✅ User Created Successfully");

        setForm({
          name: "",
          email: "",
          password: "",
          role: "",
          phone: "",
          businessName: "",
          gstNumber: "",
          address: "",
        });
      }

    } catch (err) {
      console.error(err);
      setMsg("❌ Error creating user");
    }

    setLoading(false);
  }

  return (
    <div style={container}>
      <h1>Create User</h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="">Select Role</option>
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />

        {/* VENDOR FIELDS */}
        {form.role === "vendor" && (
          <>
            <input name="businessName" placeholder="Business Name" value={form.businessName} onChange={handleChange} />
            <input name="gstNumber" placeholder="GST Number" value={form.gstNumber} onChange={handleChange} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          </>
        )}

        <button disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}

/* ===== STYLES ===== */

const container = {
  maxWidth: 500,
  margin: "50px auto",
  padding: 20,
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
