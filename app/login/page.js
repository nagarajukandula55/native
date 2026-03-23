"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.msg || "Login failed");
        setLoading(false);
        return;
      }

      console.log("LOGIN SUCCESS:", data);

      // ✅ IMPORTANT: SET COOKIE
      document.cookie = `token=${data.token}; path=/`;
      document.cookie = `role=${data.role}; path=/`;

      // ✅ REDIRECT
      if (data.role === "admin") {
        router.push("/admin");
      } else if (data.role === "store") {
        router.push("/admin/store/dashboard");
      } else {
        router.push("/account");
      }

    } catch (err) {
      console.error(err);
      setError("Server error");
    }

    setLoading(false);
  }

  return (
    <div style={container}>
      <div style={{ marginBottom: 30 }}>
        <Image src="/logo.png" alt="Logo" width={170} height={60} />
      </div>

      <form style={card} onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />
          <span onClick={() => setShowPass(!showPass)} style={eye}>
            👁
          </span>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button disabled={loading} style={btn}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* STYLES */
const container = { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f3f4f6" };
const card = { width: 350, padding: 25, background: "#fff", borderRadius: 10 };
const input = { width: "100%", padding: 10, marginTop: 10 };
const btn = { width: "100%", padding: 12, marginTop: 15, background: "#111", color: "#fff" };
const eye = { position: "absolute", right: 10, top: 12, cursor: "pointer" };
