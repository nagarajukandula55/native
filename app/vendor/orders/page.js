"use client";

import { useEffect, useState } from "react";
import { getVendorOrders, updateVendorOrderStatus } from "@/lib/an-sdk/vendors";
import { ApiError } from "@/lib/an-sdk/client";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  function load() {
    setLoading(true);
    getVendorOrders()
      .then((data) => setOrders(data?.orders || (Array.isArray(data) ? data : [])))
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load your orders — this endpoint is pending on the AN group backend."
        );
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(orderId, status) {
    setUpdatingId(orderId);
    try {
      await updateVendorOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.orderId) === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1>Orders</h1>

      {error && <p className="notice">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : !orders.length ? (
        <p className="empty">No orders yet.</p>
      ) : (
        <div className="list">
          {orders.map((o) => {
            const id = o._id || o.orderId;
            return (
              <div className="row" key={id}>
                <div>
                  <p className="name">Order #{o.orderId || id}</p>
                  <p className="meta">
                    ₹{o.totalAmount ?? o.total ?? 0}
                    {o.createdAt ? ` · ${new Date(o.createdAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <select
                  value={o.status || "pending"}
                  disabled={updatingId === id}
                  onChange={(e) => handleStatusChange(id, e.target.value)}
                  className="select"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        h1 {
          margin-bottom: 20px;
        }
        .notice {
          background: #fff8ec;
          border: 1px solid #f2d9ad;
          color: #8a5a12;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .empty {
          color: #888;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .row {
          background: #fff;
          border-radius: 10px;
          padding: 14px 18px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .name {
          margin: 0;
          font-weight: 600;
        }
        .meta {
          margin: 2px 0 0;
          font-size: 12px;
          color: #888;
        }
        .select {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
}
