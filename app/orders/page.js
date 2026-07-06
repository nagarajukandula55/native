"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getMyOrders } from "@/lib/an-sdk/orders";
import { ApiError } from "@/lib/an-sdk/client";

const STATUS_COLORS = {
  DELIVERED: "#16a34a",
  SHIPPED: "#2563eb",
  PENDING_PAYMENT: "#f59e0b",
  PROCESSING: "#f59e0b",
  CANCELLED: "#e11d48",
  REFUNDED: "#6b7280",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push("/login?next=/orders");
      return;
    }

    let cancelled = false;
    setLoading(true);

    getMyOrders()
      .then((data) => {
        if (cancelled) return;
        const list = data?.orders || (Array.isArray(data) ? data : []);
        setOrders(list);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load orders:", err);
        setError(err instanceof ApiError ? err.message : "Could not load your orders");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, userLoading, router]);

  if (userLoading || (loading && !error)) {
    return (
      <div className="container">
        <p>Loading your orders...</p>
        <style jsx>{`
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Orders</h1>

      {error && <p className="error">{error}</p>}

      {!error && !orders.length && (
        <div className="empty">
          <p>You haven't placed any orders yet.</p>
          <Link href="/products" className="shopLink">
            Start shopping
          </Link>
        </div>
      )}

      <div className="list">
        {orders.map((order) => {
          const id = order._id || order.orderId;
          const status = order.status || "PENDING_PAYMENT";
          const color = STATUS_COLORS[status] || "#6b7280";
          const total = order.totalAmount ?? order.total ?? order.amount ?? 0;
          const itemCount = order.items?.length || order.products?.length || 0;

          return (
            <Link
              key={id}
              href={`/order-success?orderId=${encodeURIComponent(order.orderId || id)}`}
              className="row"
            >
              <div className="rowMain">
                <p className="orderId">Order #{order.orderId || id}</p>
                <p className="meta">
                  {itemCount ? `${itemCount} item${itemCount > 1 ? "s" : ""} · ` : ""}
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                </p>
              </div>

              <div className="rowRight">
                <span className="status" style={{ color, borderColor: color }}>
                  {status.replace(/_/g, " ")}
                </span>
                <span className="total">₹{total}</span>
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
        h1 {
          margin-bottom: 24px;
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
