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
    e.preventDefault(); // Prevent form reload
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

      if (!data.success) {
        setError(data.msg || "Login failed");
        setLoading(false);
        return;
      }

      // ================= ROLE-BASED REDIRECT =================
      switch (data.role) {
        case "admin":
          router.push("/admin");
          break;
        case "store":
          router.push("/admin/store/dashboard");
          break;
        case "user":
          router.push("/account");
          break;
        default:
          router.push("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
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
          priority
        />
      </div>

      {/* LOGIN CARD */}
      <form style={card} onSubmit={handleLogin}>
        <h2 style={title}>Welcome Back</h2>

        {/* EMAIL */}
        <div style={field}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />
          <label style={email ? labelActive : label}>Email address</label>
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

        {/* ERROR MESSAGE */}
        {error && <p style={errorText}>{error}</p>}

        {/* OPTIONS */}
        <div style={options}>
          <label style={{ fontSize: 13 }}>
            <input type="checkbox" /> Remember me
          </label>
          <span style={link} onClick={() => router.push("/forgot-password")}>
            Forgot password?
          </span>
        </div>

        {/* BUTTON */}
        <button style={{ ...button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? <Spinner /> : "Sign in"}
        </button>

        {/* FOOTER */}
        <p style={footer}>
          Don’t have an account?{" "}
          <span onClick={() => router.push("/signup")} style={link}>
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
}

/* SPINNER */
function Spinner() {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        border: "2px solid #fff",
        borderTop: "2px solid transparent",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "auto",
      }}
    />
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
  background: "#fff",
  padding: 32,
  borderRadius: 18,
  boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
};

const title = {
  fontSize: 24,
  fontWeight: 600,
  marginBottom: 25,
  textAlign: "center",
};

const field = {
  position: "relative",
  marginBottom: 18,
};

const input = {
  width: "100%",
  padding: "14px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
  outline: "none",
};

const label = {
  position: "absolute",
  left: 12,
  top: 14,
  fontSize: 13,
  color: "#777",
  transition: "0.2s",
  pointerEvents: "none",
};

const labelActive = {
  ...label,
  top: -8,
  fontSize: 11,
  color: "#111",
  background: "#fff",
  padding: "0 4px",
};

const eye = {
  position: "absolute",
  right: 12,
  top: 14,
  cursor: "pointer",
};

const button = {
  width: "100%",
  padding: 14,
  marginTop: 10,
  borderRadius: 8,
  border: "none",
  background: "#111",
  color: "#fff",
  fontSize: 15,
  cursor: "pointer",
};

const options = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
};

const errorText = {
  color: "red",
  fontSize: 13,
  marginBottom: 10,
};

const footer = {
  textAlign: "center",
  marginTop: 15,
  fontSize: 13,
};

const link = {
  color: "#2563eb",
  cursor: "pointer",
};
