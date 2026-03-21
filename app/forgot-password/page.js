"use client";

import { useState } from "react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit() {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (data.success) {
      setMsg("Reset link generated (check console)");
      console.log(data.resetLink);
    } else {
      setMsg(data.msg);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Forgot Password</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <button onClick={handleSubmit}>Send Reset Link</button>
      <p>{msg}</p>
    </div>
  );
}
