"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  async function handleSubmit() {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.msg);

    if (data.token) setToken(data.token);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Forgot Password</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <button onClick={handleSubmit}>Get Token</button>

      {token && <p>Reset Token: {token}</p>}
    </div>
  );
}
