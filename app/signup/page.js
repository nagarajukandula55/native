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

  async function handleSignup() {
    if (!form.name || !form.email || !form.password) {
      return alert("Fill all fields");
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
        alert(data.msg);
        setLoading(false);
        return;
      }

      alert("Account created. Please login.");
      router.push("/login");

    } catch (err) {
      console.error(err);
      alert("Error");
    }

    setLoading(false);
  }

  return (
    <div style={container}>
      <h1>🛍️ Create Account</h1>

      <div style={card}>
        <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} style={input} />
        <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} style={input} />
        <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} style={input} />

        <button onClick={handleSignup} style={btn}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

const container = { textAlign: "center", marginTop: 80 };
const card = { width: 350, margin: "auto", padding: 20, background: "#fff" };
const input = { width: "100%", padding: 10, marginTop: 10 };
const btn = { width: "100%", padding: 12, marginTop: 15, background: "#111", color: "#fff" };
