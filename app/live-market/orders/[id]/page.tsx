"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { getLiveMarketOrder } from "@/lib/an-sdk/liveMarket";
import { ApiError } from "@/lib/an-sdk/client";
import VerticalOrderPayment from "@/components/VerticalOrderPayment";
import RiderInfoCard from "@/components/RiderInfoCard";
import EnablePushButton from "@/components/EnablePushButton";

export default function LiveMarketOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const statusRef = useRef<string>("");
  statusRef.current = order?.status || "";

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push(`/login?next=/live-market/orders/${id}`);
      return;
    }
    if (!id) return;
    let cancelled = false;

    const fetchOrder = (silent = false) => {
      if (!silent) setLoading(true);
      return getLiveMarketOrder(id)
        .then((data) => {
          if (!cancelled) setOrder(data);
        })
        .catch((err) => {
          if (!cancelled && !silent) setError(err instanceof ApiError ? err.message : "Could not load order");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchOrder();

    // Poll for status changes (packed/dispatched/delivered etc.) while the
    // page is open, same pattern as order-success -- stops once the order
    // reaches a terminal status instead of polling forever.
    const interval = setInterval(() => {
      if (["DELIVERED", "CANCELLED", "FAILED", "REJECTED"].includes(statusRef.current)) {
        clearInterval(interval);
        return;
      }
      fetchOrder(true);
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, user, userLoading, router]);

  if (userLoading || loading) {
    return (
      <div className="container">
        <p>Loading order…</p>
        <style jsx>{`
          .container { max-width: 700px; margin: 0 auto; padding: 40px 20px; }
        `}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container">
        <p className="error">{error || "Order not found"}</p>
        <Link href="/live-market/orders" className="link">
          Back to my Live orders
        </Link>
        <style jsx>{`
          .container { max-width: 700px; margin: 0 auto; padding: 40px 20px; }
          .error { color: #e11d48; }
          .link { color: #c28b45; font-weight: 600; }
        `}</style>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="container">
      <Link href="/live-market/orders" className="back">
        ← My Live Orders
      </Link>
      <h1>Order #{String(order._id).slice(-6).toUpperCase()}</h1>
      <p className="status">{(order.status || "").replace(/_/g, " ")}</p>

      {order.status === "OUT_FOR_DELIVERY" && order.estimatedDeliveryAt && (
        <p className="eta">
          🚴 Arriving by{" "}
          {new Date(order.estimatedDeliveryAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
        </p>
      )}
      {["REQUESTED", "CONFIRMED", "REACHED_SHOP"].includes(order.status) && (
        <p className="eta muted">Expect your order within about an hour.</p>
      )}

      <EnablePushButton />
      <RiderInfoCard order={order} />

      <div className="section">
        <h2>Shop</h2>
        <p>{order.shopId?.name || "—"}</p>
        {order.shopId?.address && <p className="muted">{order.shopId.address}</p>}
      </div>

      <div className="section">
        <h2>Items</h2>
        <ul className="items">
          {(order.items || []).map((it: any, idx: number) => (
            <li key={idx}>
              <span>
                {it.name} — {it.quantity} {it.unit || ""} × ₹{it.ratePerUnit}
                {it.wantsCleaning ? (
                  <span className="cleaningBadge">Clean &amp; cut</span>
                ) : (
                  <span className="cleaningBadge cleaningBadgeOff">Whole, no cleaning</span>
                )}
              </span>
              <span className="itemAmount">₹{it.amount}</span>
            </li>
          ))}
        </ul>
        <div className="amounts">
          <div className="total">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Payment</h2>
        {isPaid ? (
          <p className="paid">Paid ✓</p>
        ) : (
          <VerticalOrderPayment
            type="LIVE_MARKET"
            order={order}
            categoryKey="liveMarket"
            onPaid={() => setOrder((prev: any) => ({ ...prev, paymentStatus: "PAID", status: "REQUESTED" }))}
          />
        )}
      </div>

      <style jsx>{`
        .container { max-width: 700px; margin: 0 auto; padding: 40px 20px; }
        .back { color: #c28b45; font-weight: 600; text-decoration: none; font-size: 13px; }
        h1 { margin: 12px 0 4px; }
        .status { font-weight: 700; color: #c28b45; margin-bottom: 8px; }
        .eta { font-size: 13px; font-weight: 600; color: #1f3d2b; margin: 0 0 20px; }
        .eta.muted { color: #888; font-weight: 500; }
        .section {
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 16px;
        }
        h2 { margin: 0 0 10px; font-size: 15px; }
        .muted { color: #888; }
        .items { margin: 0 0 10px; padding: 0; list-style: none; }
        .items li {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .itemAmount { font-weight: 600; }
        .cleaningBadge {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          background: #eef6ec;
          color: #1f3d2b;
        }
        .cleaningBadgeOff {
          background: #f4f4f4;
          color: #888;
        }
        .amounts .total {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          border-top: 1px solid #eee;
          margin-top: 6px;
          padding-top: 8px;
        }
        .payBtn {
          padding: 12px 24px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: 700;
          cursor: pointer;
        }
        .paid { color: #16a34a; font-weight: 700; }
        .notice {
          margin-top: 10px;
          font-size: 13px;
          color: #b45309;
          background: #fff7e6;
          border: 1px solid #f0c36d;
          padding: 10px 12px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
