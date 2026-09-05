"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { getSanthaOrder } from "@/lib/an-sdk/santha";
import { ApiError } from "@/lib/an-sdk/client";

export default function SanthaOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TEMPORARY, DEV-ONLY: see the same note in app/groceries/orders/[id]/page.tsx —
  // no payment gateway or customer-callable "mark paid" endpoint exists yet
  // on the ANgroup side, so this stays a disabled/placeholder button.
  const [payNotice, setPayNotice] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push(`/login?next=/santha/orders/${id}`);
      return;
    }
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getSanthaOrder(id)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load order");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user, userLoading, router]);

  if (userLoading || loading) {
    return (
      <div className="container">
        <p>Loading order…</p>
        <style jsx>{`
          .container {
            max-width: 700px;
            margin: 0 auto;
            padding: 40px 20px;
          }
        `}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container">
        <p className="error">{error || "Order not found"}</p>
        <Link href="/santha/orders" className="link">
          Back to my santha orders
        </Link>
        <style jsx>{`
          .container {
            max-width: 700px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .error {
            color: #e11d48;
          }
          .link {
            color: #c28b45;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  const hasQuote = !!order.quoteImageUrl && order.quoteAmount != null;
  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="container">
      <Link href="/santha/orders" className="back">
        ← My Santha Orders
      </Link>
      <h1>Order #{String(order._id).slice(-6).toUpperCase()}</h1>
      <p className="status">{(order.status || "").replace(/_/g, " ")}</p>

      {order.plannedFor && (
        <div className="plannedBanner">
          Pickup &amp; delivery planned for{" "}
          <strong>
            {new Date(order.plannedFor).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </strong>
        </div>
      )}

      <div className="section">
        <h2>Santha Session</h2>
        <p>{order.marketSessionId?.name || "—"}</p>
      </div>

      <div className="section">
        <h2>Items</h2>
        <ul className="items">
          {(order.items || []).map((it: any, idx: number) => (
            <li key={idx}>
              {it.name} — {it.quantity} {it.unit || ""}
              {it.notes ? ` (${it.notes})` : ""}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Quote</h2>
        {!hasQuote && <p className="muted">Awaiting quote.</p>}
        {hasQuote && (
          <>
            <img src={order.quoteImageUrl} alt="Quote" className="quoteImg" />
            <div className="amounts">
              <div>
                <span>Quote amount</span>
                <span>₹{order.quoteAmount}</span>
              </div>
              {order.serviceCharge != null && (
                <div>
                  <span>Service charge</span>
                  <span>₹{order.serviceCharge}</span>
                </div>
              )}
              <div className="total">
                <span>Total</span>
                <span>₹{order.totalAmount ?? order.quoteAmount}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="section">
        <h2>Payment</h2>
        {isPaid ? (
          <p className="paid">Paid ✓</p>
        ) : hasQuote ? (
          <>
            <button
              type="button"
              className="payBtn"
              title="Payment gateway integration is not built yet — this is a placeholder."
              onClick={() => setPayNotice(true)}
            >
              Pay Now
            </button>
            {payNotice && (
              <p className="notice">
                Online payment isn't wired up yet — this button is a temporary placeholder.
                A real "Pay Now" flow will replace it once payment gateway integration lands.
              </p>
            )}
          </>
        ) : (
          <button type="button" className="payBtn" disabled>
            Awaiting quote
          </button>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .back {
          color: #c28b45;
          font-weight: 600;
          text-decoration: none;
          font-size: 13px;
        }
        h1 {
          margin: 12px 0 4px;
        }
        .status {
          font-weight: 700;
          color: #c28b45;
          margin-bottom: 14px;
        }
        .plannedBanner {
          background: #fff7ec;
          border: 1px solid #c28b45;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }
        .section {
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 16px;
        }
        h2 {
          margin: 0 0 10px;
          font-size: 15px;
        }
        .muted {
          color: #888;
        }
        .items {
          margin: 0;
          padding-left: 18px;
        }
        .items li {
          margin-bottom: 4px;
        }
        .quoteImg {
          max-width: 100%;
          border-radius: 8px;
          margin-bottom: 14px;
        }
        .amounts > div {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }
        .amounts .total {
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
        .payBtn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .paid {
          color: #16a34a;
          font-weight: 700;
        }
        .notice {
          margin-top: 10px;
          font-size: 13px;
          color: #b45309;
          background: #fff7e6;
          border: 1px solid #f0c36d;
          padding: 10px 12px;
          border-radius: 8px;
        }
        .error {
          color: #e11d48;
        }
        .link {
          color: #c28b45;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
