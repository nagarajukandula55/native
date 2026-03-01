"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await apiRequest("/api/auth/login", "POST", {
      email,
      password,
    });

    if (res.role !== "admin") {
      alert("Not authorized");
      return;
    }

    saveToken(res.token);
    router.push("/admin/dashboard");
  }

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl mb-4">Admin Login</h1>
      <input
        className="border p-2 mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 mb-2"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-black text-white px-4 py-2"
      >
        Login
      </button>
    </div>
  );
}
