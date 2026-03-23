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

      // 🔥 SHOW ACTUAL BACKEND ERROR
      if (!res.ok || !data.success) {
        console.log("LOGIN ERROR:", data);
        setError(data.msg || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ TEMP DEBUG (remove later)
      console.log("LOGIN SUCCESS:", data);

      // ================= ROLE REDIRECT =================
      if (data.role === "admin") {
        router.push("/admin");
      } else if (data.role === "store") {
        router.push("/admin/store/dashboard");
      } else {
        router.push("/account");
      }

    } catch (err) {
      console.error("FETCH ERROR:", err);
      setError("Network / Server issue. Check console.");
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

      {/* CARD */}
      <form style={card} onSubmit={handleLogin}>
        <h2 style={title}>Welcome Back</h2>

        {/* EMAIL */}
        <div style={field}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />
          <label style={email ? labelActive : label}>Email</label>
        </div>

        {/* PASSWORD */}
        <div style={field}>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />
          <label style={password ? labelActive : label}>Password</label>

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
        <p style={footer}>
          <span onClick={() => router.push("/signup")} style={link}>
            Create Account
          </span>{" "}
          |{" "}
          <span onClick={() => router.push("/forgot-password")} style={link}>
            Forgot Password
          </span>
        </p>
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
  width: 400,
  padding: 30,
  background: "#fff",
  borderRadius: 14,
};

const title = {
  textAlign: "center",
  marginBottom: 20,
};

const field = {
  position: "relative",
  marginBottom: 15,
};

const input = {
  width: "100%",
  padding: 12,
  border: "1px solid #ddd",
  borderRadius: 6,
};

const label = {
  position: "absolute",
  left: 10,
  top: 12,
  fontSize: 12,
  color: "#777",
};

const labelActive = {
  ...label,
  top: -8,
  fontSize: 10,
  background: "#fff",
};

const eye = {
  position: "absolute",
  right: 10,
  top: 12,
  cursor: "pointer",
};

const button = {
  width: "100%",
  padding: 12,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const errorText = {
  color: "red",
  fontSize: 13,
};

const footer = {
  marginTop: 15,
  textAlign: "center",
};

const link = {
  color: "#2563eb",
  cursor: "pointer",
};
