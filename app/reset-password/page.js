"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  /* ✅ SAFE TOKEN FETCH */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const query = new URLSearchParams(window.location.search);
      const t = query.get("token");

      if (!t) {
        setMsg("Invalid or missing reset link");
      } else {
        setToken(t);
      }
    }
  }, []);

  async function handleReset() {
    setMsg("");

    if (!password || !confirm) {
      setMsg("Please fill all fields");
      return;
    }

    if (password !== confirm) {
      setMsg("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      setMsg("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setMsg(data.msg || "Failed to reset password");
        setLoading(false);
        return;
      }

      setMsg("✅ Password updated successfully");

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      console.error(err);
      setMsg("Server error");
    }

    setLoading(false);
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Reset Password</h2>

        <p style={subText}>
          Enter your new password below
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={input}
        />

        {msg && <p style={msgStyle}>{msg}</p>}

        <button
          onClick={handleReset}
          disabled={loading}
          style={{ ...btn, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>

        <p style={footer}>
          Back to{" "}
          <span onClick={() => router.push("/login")} style={link}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f3f4f6",
};

const card = {
  width: 400,
  padding: 30,
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const title = {
  textAlign: "center",
  fontSize: 22,
  fontWeight: 600,
};

const subText = {
  textAlign: "center",
  fontSize: 13,
  color: "#666",
  marginBottom: 20,
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const btn = {
  width: "100%",
  padding: 12,
  border: "none",
  borderRadius: 8,
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const msgStyle = {
  fontSize: 13,
  color: "#e11d48",
  marginBottom: 10,
};

const footer = {
  marginTop: 15,
  textAlign: "center",
  fontSize: 13,
};

const link = {
  color: "#2563eb",
  cursor: "pointer",
};
