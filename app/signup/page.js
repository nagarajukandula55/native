"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup() {
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.msg);
        setLoading(false);
        return;
      }

      alert("Account created! Please login.");
      router.push("/login");

    } catch (err) {
      console.error(err);
      setError("Server error");
    }

    setLoading(false);
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2>Create Account</h2>

        <input placeholder="Full Name" onChange={e => setForm({ ...form, name: e.target.value })} style={input} />
        <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} style={input} />
        <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} style={input} />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={handleSignup} style={btn}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}

const container = { display: "flex", justifyContent: "center", marginTop: 100 };
const card = { width: 350, padding: 20, background: "#fff", borderRadius: 10 };
const input = { width: "100%", padding: 10, marginTop: 10 };
const btn = { width: "100%", padding: 12, marginTop: 15, background: "#111", color: "#fff" };
