"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password || (isSignup && !name)) {
      setError("Please fill all required fields")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.msg || "Something went wrong")
        setLoading(false)
        return
      }

      // Login successful, redirect to profile/orders page
      router.push("/profile")
    } catch (err) {
      setError("Server error")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", padding: "30px", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)", background: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {isSignup ? "Sign Up" : "Login"}
      </h2>

      {error && <p style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          style={{ padding: "12px 20px", borderRadius: "25px", border: "none", background: "#c28b45", color: "#fff", fontWeight: "500", cursor: "pointer" }}
          disabled={loading}
        >
          {loading ? (isSignup ? "Signing Up..." : "Logging In...") : isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center", fontSize: "14px" }}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <span
          onClick={() => setIsSignup(!isSignup)}
          style={{ color: "#c28b45", cursor: "pointer", fontWeight: "500" }}
        >
          {isSignup ? "Login" : "Sign Up"}
        </span>
      </p>
    </div>
  )
}
