"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return alert("Enter email & password");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.msg);
        setLoading(false);
        return;
      }

      /* ROLE BASED REDIRECT */
      if (data.role === "admin") {
        localStorage.setItem("adminToken", data.token);
        router.push("/admin");
      }

      else if (data.role === "store") {
        localStorage.setItem("storeToken", data.token);
        router.push("/store/dashboard");
      }

      else {
        localStorage.setItem("userToken", data.token);
        router.push("/account");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  }

  return (
    <div style={container}>
      
      {/* LOGO */}
      <h1 style={{ textAlign: "center" }}>🛍️ Your Store</h1>

      <div style={card}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={input}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={input}
        />

        <button onClick={handleLogin} style={btn}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* LINKS */}
        <div style={{ marginTop: 10 }}>
          <p onClick={() => router.push("/signup")} style={link}>
            Create Account
          </p>
          <p onClick={() => router.push("/forgot-password")} style={link}>
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const container = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: 80,
};

const card = {
  width: 350,
  padding: 20,
  background: "#fff",
  borderRadius: 10,
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
};

const btn = {
  width: "100%",
  padding: 12,
  marginTop: 15,
  background: "#111",
  color: "#fff",
};

const link = {
  cursor: "pointer",
  color: "blue",
  fontSize: 14,
};
