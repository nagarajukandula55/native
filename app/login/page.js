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

    try {
      if (!email || !password) {
        setError("Please enter email and password");
        setLoading(false);
        return;
      }

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
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      console.log("LOGIN SUCCESS:", data);

      // 🔥 STEP 1: Sync auth immediately
      await refreshUser();

      // 🔥 STEP 2: wait for cookie propagation (important in prod)
      await new Promise((r) => setTimeout(r, 400));

      setSuccess(true);

      const role = data?.user?.role;

      // 🔥 CENTRALIZED ROLE ROUTING
      const routes = {
        super_admin: "/super-admin",
        admin: "/admin",
        vendor: "/vendor",
        finance: "/finance",
        customer_support: "/support",
        branding: "/branding",
        analytics: "/analytics",
        customer: "/account",
      };

      // 🔥 STEP 3: safe redirect (no flicker)
      setTimeout(() => {
        router.replace(routes[role] || "/");
      }, 700);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Server error. Please try again.");
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

            <span onClick={() => setShowPass(!showPass)} style={eye}>
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
