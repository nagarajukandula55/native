"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type OrderType = "GROCERY" | "SANTHA" | "LIVE_MARKET" | "FRESH";

interface ShopOrder {
  _id: string;
  orderType: OrderType;
  totalAmount?: number;
  quoteAmount?: number;
  pincode?: string;
  items?: { name: string; quantity?: number; unit?: string }[];
}

const LABELS: Record<OrderType, string> = {
  GROCERY: "Monthly Groceries",
  SANTHA: "Santha",
  LIVE_MARKET: "Live Market",
  FRESH: "Fresh",
};

export default function ShopOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName] = useState("Native Shop");
  const [signingOut, setSigningOut] = useState(false);

  async function logout() {
    setSigningOut(true);
    try {
      const response = await fetch("/api/shop/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/shop/login");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
      setSigningOut(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/orders", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/shop/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        const all: ShopOrder[] = [
          ...data.data.grocery,
          ...data.data.santha,
          ...data.data.liveMarket,
          ...data.data.fresh,
        ];
        setOrders(all);
      } else {
        setError(data.message || "Unable to load orders.");
      }
    } catch {
      setError("Unable to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/me", { cache: "no-store" }).then((res) => res.json()).then((data) => {
      if (!cancelled && data.success) setShopName(data.data.name || "Native Shop");
    }).catch(() => {});
    load();
    return () => { cancelled = true; };
  }, [load]);

  async function confirmHandover(order: ShopOrder) {
    setError(null);
    setActingOn(order._id);
    try {
      const res = await fetch(`/api/shop/orders/${order._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType: order.orderType }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to confirm handover");
        return;
      }
      await load();
    } catch {
      setError("Unable to confirm handover. Please try again.");
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{shopName}</p>
          <button onClick={logout} disabled={signingOut} className="text-sm underline">{signingOut ? "Signing out…" : "Sign out"}</button>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Orders waiting for handover</h1>
          <button onClick={load} disabled={loading} className="text-sm underline">Refresh</button>
        </div>
        <p className="text-xs text-gray-500">
          These executives have arrived at your shop. Hand over the order, then tap "Confirm Handover".
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-sm text-gray-500">No orders waiting right now.</p>
        )}

        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-violet-600">{LABELS[order.orderType]}</span>
              <span className="text-xs text-gray-400">{order.pincode}</span>
            </div>
            <p className="text-sm text-gray-900">
              {(order.items || []).map((i) => i.name).filter(Boolean).join(", ") || "Order " + order._id}
            </p>
            <p className="text-sm font-semibold text-gray-900">
              ₹{order.totalAmount ?? order.quoteAmount ?? "—"}
            </p>
            <button
              onClick={() => confirmHandover(order)}
              disabled={actingOn === order._id}
              className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {actingOn === order._id ? "Confirming…" : "Confirm Handover"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
