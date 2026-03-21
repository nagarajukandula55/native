"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
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
      } else {
        localStorage.setItem("store", JSON.stringify(data.store));
        router.push("/admin/store/dashboard");
      }
    } catch (err) {
      alert("Server error");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 20 }}>
      <h2>Store Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button onClick={handleLogin} disabled={loading} style={btnStyle}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

const inputStyle = { width: "100%", padding: 10, margin: "10px 0", border: "1px solid #ccc" };
const btnStyle = { width: "100%", padding: 12, background: "#16a34a", color: "#fff", border: "none" };
