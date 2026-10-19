"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShopLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/shop/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }
      router.push("/shop/orders");
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form onSubmit={(event) => { event.preventDefault(); login(); }} className="w-full max-w-sm bg-white rounded-xl border p-6 space-y-3">
        <h1 className="text-lg font-semibold text-gray-900">Native Shop Login</h1>
        <p className="text-xs text-gray-500">Confirm order handover to the delivery executive here.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          type="email"
          required
          autoComplete="username"
          className="w-full border rounded-lg p-2 text-sm"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          className="w-full border rounded-lg p-2 text-sm"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <button type="submit" disabled={loading} className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50">
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <p className="text-xs text-gray-500 text-center">
          No login yet? Ask the Native team to set one up for your shop.
        </p>
      </form>
    </div>
  );
}
