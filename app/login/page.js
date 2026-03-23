"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.msg || "Login failed");
        setLoading(false);
        return;
      }

      console.log("LOGIN SUCCESS:", data);

      // ✅ SET COOKIE (IMPORTANT)
      document.cookie = `token=${data.token}; path=/`;

      // ✅ HARD REDIRECT (CRITICAL FIX)
      if (data.role === "admin") {
        window.location.href = "/admin";
      } 
      else if (data.role === "store") {
        window.location.href = "/admin/store/dashboard";
      } 
      else {
        window.location.href = "/account";
      }

    } catch (err) {
      console.error(err);
      setError("Server error. Check console.");
    }

    setLoading(false);
  }

  return (
    <div style={container}>

      {/* LOGO */}
      <div style={{ marginBottom: 30 }}>
        <Image
          src="/logo.png"
          alt="Logo"
          width={170}
          height={60}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* LOGIN CARD */}
      <form style={card} onSubmit={handleLogin}>
        <h2 style={title}>Welcome Back</h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <span onClick={() => setShowPass(!showPass)} style={eye}>
            {showPass ? "🙈" : "👁"}
          </span>
        </div>

        {/* ERROR */}
        {error && <p style={errorText}>{error}</p>}

        {/* BUTTON */}
        <button disabled={loading} style={button}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {/* LINKS */}
        <div style={{ marginTop: 15, textAlign: "center" }}>
          <p onClick={() => window.location.href = "/signup"} style={link}>
            Create Account
          </p>
          <p onClick={() => window.location.href = "/forgot-password"} style={link}>
            Forgot Password?
          </p>
        </div>

      </form>
    </div>
  );
}

/* ===== STYLES ===== */

const container = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "#f3f4f6",
};

const card = {
  width: 360,
  background: "#fff",
  padding: 30,
  borderRadius: 14,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const title = {
  textAlign: "center",
  marginBottom: 20,
  fontSize: 22,
  fontWeight: 600,
};

const input = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const button = {
  width: "100%",
  padding: 12,
  marginTop: 15,
  borderRadius: 8,
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const errorText = {
  color: "red",
  fontSize: 13,
  marginTop: 8,
};

const eye = {
  position: "absolute",
  right: 12,
  top: 18,
  cursor: "pointer",
};

const link = {
  color: "#2563eb",
  cursor: "pointer",
  fontSize: 14,
};
