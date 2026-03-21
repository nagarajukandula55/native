"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
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
      const res = await fetch("/api/auth/login", {
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

      /* ===== CLEAR OLD TOKENS ===== */
      localStorage.removeItem("adminToken");
      localStorage.removeItem("storeToken");
      localStorage.removeItem("userToken");

      /* ===== ROLE BASED LOGIN ===== */
      if (data.role === "admin") {
        localStorage.setItem("adminToken", data.token);
        router.push("/admin");
      } 
      
      else if (data.role === "store") {
        localStorage.setItem("storeToken", data.token);
        router.push("/admin/store/dashboard"); // ✅ correct path
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
      
      {/* ===== LOGO SECTION ===== */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Image
          src="/logo.png"   // 👉 put your logo in /public/logo.png
          alt="Logo"
          width={140}
          height={60}
          style={{ marginBottom: 10 }}
        />
        <p style={{ color: "#666", fontSize: 14 }}>
          Login to continue
        </p>
      </div>

      {/* ===== LOGIN CARD ===== */}
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 15 }}>
          Welcome Back
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...btn,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* ===== LINKS ===== */}
        <div style={{ marginTop: 15, textAlign: "center" }}>
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

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f5f5",
};

const card = {
  width: 360,
  padding: 25,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
};

const input = {
  width: "100%",
  padding: 12,
  marginTop: 12,
  border: "1px solid #ccc",
  borderRadius: 6,
};

const btn = {
  width: "100%",
  padding: 12,
  marginTop: 18,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const link = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 14,
  marginTop: 5,
};
