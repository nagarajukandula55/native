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

      // ✅ Refresh auth state
      await refreshUser();
      router.refresh();

      setSuccess(true);

      const role = data?.user?.role;

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

      setTimeout(() => {
        router.replace(routes[role] || "/");
      }, 800);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Server error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

      {/* LOGO */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Logo"
          width={180}
          height={70}
          className="object-contain"
          priority
        />
      </div>

      {success ? (
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md">
          <h2 className="text-green-600 text-xl font-semibold">
            Login Successful ✅
          </h2>
          <p className="mt-2">Redirecting...</p>
          <div className="mt-4 animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-xl font-semibold text-center mb-6">
            Welcome Back
          </h2>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-black"
          />

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            />

            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 cursor-pointer"
            >
              {showPass ? "🙈" : "👁"}
            </span>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg bg-black text-white hover:opacity-90 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex justify-between mt-4 text-sm">
            <p
              onClick={() => router.push("/forgot-password")}
              className="text-blue-600 cursor-pointer"
            >
              Forgot password?
            </p>

            <p
              onClick={() => router.push("/signup")}
              className="text-blue-600 cursor-pointer"
            >
              Create account
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
