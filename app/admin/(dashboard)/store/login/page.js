"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert("Enter email & password");
    setLoading(true);

    try {
      const res = await fetch("/api/store/login", {
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
    } catch (e) {
      console.error(e);
      alert("Server error");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 20, background: "#fff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>🏬 Store Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
      <button onClick={handleLogin} disabled={loading} style={btnStyle}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

const inputStyle = { width: "100%", padding: 10, margin: "10px 0", border: "1px solid #ccc", borderRadius: 6 };
const btnStyle = { width: "100%", padding: 12, marginTop: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
