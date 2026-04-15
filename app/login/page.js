"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ================= LOGIN ================= */
  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

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

      if (!res.ok || !data.success) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      console.log("LOGIN SUCCESS:", data);

      /* ================= IMPORTANT SYNC FIX ================= */
      await refreshUser();

      // allow cookie + /me sync time
      await new Promise((r) => setTimeout(r, 300));

      setSuccess(true);

      const roleRoutes = {
        super_admin: "/super-admin",
        admin: "/admin",
        vendor: "/vendor",
        finance: "/finance",
        customer_support: "/support",
        branding: "/branding",
        analytics: "/analytics",
        customer: "/account",
      };

      const role = data?.user?.role;

      setTimeout(() => {
        router.replace(roleRoutes[role] || "/");
      }, 600);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
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

      {success ? (
        <div style={successBox}>
          <h2 style={successTitle}>Login Successful ✅</h2>
          <p style={{ marginTop: 10 }}>Redirecting...</p>
          <div style={loader}></div>
        </div>
      ) : (
        <form style={card} onSubmit={handleLogin}>
          <h2 style={title}>Welcome Back</h2>

          <input
            type="email"
            placeholder="Email address"
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

            <span
              onClick={() => setShowPass(!showPass)}
              style={eye}
            >
              {showPass ? "🙈" : "👁"}
            </span>
          </div>

          {error && <p style={errorText}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div style={linksBox}>
            <p onClick={() => router.push("/forgot-password")} style={link}>
              Forgot password?
            </p>

            <p onClick={() => router.push("/signup")} style={link}>
              Create account
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #f8fafc, #eef2f7)",
};

const card = {
  width: 380,
  background: "#fff",
  padding: 32,
  borderRadius: 18,
  boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
};

const title = {
  textAlign: "center",
  marginBottom: 20,
  fontSize: 22,
  fontWeight: 600,
  color: "#111",
};

const input = {
  width: "100%",
  padding: 12,
  marginTop: 12,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  fontSize: 14,
  outline: "none",
};

const button = {
  width: "100%",
  padding: 12,
  marginTop: 18,
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #111, #333)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 500,
};

const errorText = {
  color: "#ef4444",
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
  marginTop: 6,
};

const successBox = {
  width: 380,
  background: "#fff",
  padding: 32,
  borderRadius: 18,
  boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const successTitle = {
  color: "#16a34a",
  fontSize: 22,
  fontWeight: 600,
};

const loader = {
  margin: "20px auto 0",
  width: 30,
  height: 30,
  border: "3px solid #e5e7eb",
  borderTop: "3px solid #16a34a",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
