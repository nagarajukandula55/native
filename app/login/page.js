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
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});

const data = await res.json();

if (!res.ok || !data.success) {
  setError(data.message);
  setLoading(false);
  return;
}

// 🔥 FORCE SYNC FIRST
await refreshUser();

// 🔥 WAIT FOR CONTEXT UPDATE
await new Promise((r) => setTimeout(r, 500));

setSuccess(true);

// 🔥 REDIRECT ONLY AFTER STABLE STATE
router.replace("/");

  } catch (err) {
    setError("Server error");
  }

  setLoading(false);
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f1e8] via-[#faf8f3] to-[#efe7d8] px-4">

      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Native Logo"
            width={180}
            height={70}
            className="object-contain"
            priority
          />
        </div>

        {/* CARD */}
        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-200">

          {success ? (
            <div className="text-center">
              <h2 className="text-green-600 text-xl font-semibold">
                Login Successful ✅
              </h2>
              <p className="mt-2 text-gray-600">Redirecting...</p>

              <div className="mt-4 flex justify-center">
                <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Welcome Back 👋
              </h2>

              {/* EMAIL */}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-[#c28b45] outline-none"
              />

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-[#c28b45] outline-none"
                />

                <span
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-3 cursor-pointer text-gray-600"
                >
                  {showPass ? "🙈" : "👁"}
                </span>
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
              )}

              {/* BUTTON */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#c28b45] text-white font-medium hover:bg-[#a67030] transition"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              {/* LINKS */}
              <div className="flex justify-between mt-4 text-sm">
                <p
                  onClick={() => router.push("/forgot-password")}
                  className="text-[#c28b45] cursor-pointer hover:underline"
                >
                  Forgot password?
                </p>

                <p
                  onClick={() => router.push("/signup")}
                  className="text-[#c28b45] cursor-pointer hover:underline"
                >
                  Create account
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
