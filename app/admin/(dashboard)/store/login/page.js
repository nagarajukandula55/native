"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/store/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.msg || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("storeToken", data.token);
      router.push("/admin/store/dashboard");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Store Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
      <button onClick={handleLogin} disabled={loading} style={btnStyle}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

const inputStyle = { width: "100%", padding: 10, margin: "10px 0", borderRadius: 4, border: "1px solid #ccc" };
const btnStyle = { width: "100%", padding: 12, background: "#16a34a", color: "#fff", border: "none", borderRadius: 4 };
