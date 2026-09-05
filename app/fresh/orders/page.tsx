"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getMyFreshOrders } from "@/lib/an-sdk/fresh";
import { ApiError } from "@/lib/an-sdk/client";

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "#f59e0b",
  CONFIRMED: "#2563eb",
  OUT_FOR_DELIVERY: "#7c3aed",
  DELIVERED: "#16a34a",
  CANCELLED: "#6b7280",
  FAILED: "#e11d48",
};

export default function FreshOrdersPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push("/login?next=/fresh/orders");
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMyFreshOrders(user.id)
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load orders");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, userLoading, router]);

  return (
    <div className="container">
      <div className="headRow">
        <h1>My Fresh Orders</h1>
        <Link href="/fresh" className="link">
          + New Order
        </Link>
      </div>

      {(userLoading || loading) && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && !orders.length && (
        <div className="empty">
          <p>No Fresh orders yet.</p>
          <Link href="/fresh" className="shopLink">
            Place your first order
          </Link>
        </div>
      )}

      <div className="list">
        {orders.map((order) => {
          const color = STATUS_COLORS[order.status] || "#6b7280";
          return (
            <Link key={order._id} href={`/fresh/orders/${order._id}`} className="row">
              <div className="rowMain">
                <p className="orderId">Order #{String(order._id).slice(-6).toUpperCase()}</p>
                <p className="meta">
                  {order.shopId?.name ? `${order.shopId.name} · ` : ""}
                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""} ·{" "}
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                </p>
              </div>
              <div className="rowRight">
                <span className="status" style={{ color, borderColor: color }}>
                  {(order.status || "").replace(/_/g, " ")}
                </span>
                <span className="total">₹{order.totalAmount}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .headRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .link {
          color: #c28b45;
          font-weight: 600;
          text-decoration: none;
        }
        .error {
          color: #e11d48;
        }
        .empty {
          background: #fff;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        .shopLink {
          display: inline-block;
          margin-top: 12px;
          padding: 10px 24px;
          background: #c28b45;
          color: #fff;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          text-decoration: none;
          color: inherit;
          transition: 0.15s;
        }
        .row:hover {
          transform: translateY(-2px);
        }
        .orderId {
          font-weight: 600;
          margin: 0 0 4px;
        }
        .meta {
          margin: 0;
          font-size: 12px;
          color: #888;
        }
        .rowRight {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .status {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid;
        }
        .total {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
