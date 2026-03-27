"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok || !data.success) {
        setError(data.msg || "Login failed");
        setLoading(false);
        return;
      }

      const role = data.user?.role;

      if (!role) {
        setError("Invalid response from server");
        setLoading(false);
        return;
      }

      // ✅ Show success UI
      setSuccess(true);

      // ✅ Redirect after animation
      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "/admin";
        } else if (role === "store") {
          window.location.href = "/admin/store/dashboard";
        } else if (role === "branding") {
          window.location.href = "/branding/dashboard";
        } else {
          window.location.href = "/account";
        }
      }, 1200);

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
          width={180}
          height={70}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* ✅ SUCCESS SCREEN */}
      {success ? (
        <div style={successBox}>
          <h2 style={successTitle}>Login Successful ✅</h2>
          <p style={{ marginTop: 10 }}>Redirecting to dashboard...</p>

          <div style={loader}></div>
        </div>
      ) : (
        /* LOGIN FORM */
        <form style={card} onSubmit={handleLogin}>
          <h2 style={title}>Welcome Back</h2>

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email address"
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
          <button
            type="submit"
            disabled={loading}
            style={{ ...button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* LINKS */}
          <div style={linksBox}>
            <p onClick={() => (window.location.href = "/forgot-password")} style={link}>
              Forgot password?
            </p>

            <p onClick={() => (window.location.href = "/signup")} style={link}>
              Create account
            </p>
          </div>

        </form>
      )}
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
  borderRadius: 16,
  boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
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
  marginTop: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
};

const button = {
  width: "100%",
  padding: 12,
  marginTop: 18,
  borderRadius: 8,
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  fontSize: 15,
};

const errorText = {
  color: "#e11d48",
  fontSize: 13,
  marginTop: 10,
};

const eye = {
  position: "absolute",
  right: 12,
  top: 18,
  cursor: "pointer",
};

const linksBox = {
  marginTop: 15,
  textAlign: "center",
};

const link = {
  color: "#2563eb",
  cursor: "pointer",
  fontSize: 14,
  marginTop: 5,
};

/* 🔥 SUCCESS UI */
const successBox = {
  width: 360,
  background: "#fff",
  padding: 30,
  borderRadius: 16,
  boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const successTitle = {
  color: "#16a34a",
  fontSize: 22,
  fontWeight: 600,
};

/* 🔥 LOADER */
const loader = {
  margin: "20px auto 0",
  width: 30,
  height: 30,
  border: "3px solid #ddd",
  borderTop: "3px solid #16a34a",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
