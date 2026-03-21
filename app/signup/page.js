"use client";

import { useState } from "react";
import Image from "next/image";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSignup() {
    setMsg("");

    if (!form.name || !form.email || !form.password) {
      setMsg("Please fill all fields");
      return;
    }

    if (form.password.length < 6) {
      setMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setMsg(data.msg);
        setLoading(false);
        return;
      }

      setMsg("✅ Account created successfully");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
      console.error(err);
      setMsg("Server error");
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

      {/* CARD */}
      <div style={card}>
        <h2 style={title}>Create your account</h2>

        {/* NAME */}
        <div style={field}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={input}
          />
          <label style={form.name ? labelActive : label}>Full Name</label>
        </div>

        {/* EMAIL */}
        <div style={field}>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={input}
          />
          <label style={form.email ? labelActive : label}>Email</label>
        </div>

        {/* PASSWORD */}
        <div style={field}>
          <input
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={input}
          />
          <label style={form.password ? labelActive : label}>Password</label>

          <span onClick={() => setShowPass(!showPass)} style={eye}>
            {showPass ? "🙈" : "👁"}
          </span>
        </div>

        {/* MESSAGE */}
        {msg && <p style={msgStyle}>{msg}</p>}

        {/* BUTTON */}
        <button
          onClick={handleSignup}
          disabled={loading}
          style={{ ...button, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Spinner /> : "Create Account"}
        </button>

        {/* FOOTER */}
        <p style={footer}>
          Already have an account?{" "}
          <span
            onClick={() => (window.location.href = "/login")}
            style={link}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

/* ===== SPINNER ===== */
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

const msgStyle = {
  fontSize: 13,
  color: "#e11d48",
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
