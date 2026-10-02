"use client";

import { useEffect, useRef, useState } from "react";
import { getPublicPaymentSettings, verifyVerticalPayment } from "@/lib/an-sdk/payments";

type VerticalType = "FRESH" | "LIVE_MARKET" | "GROCERY" | "SANTHA";

/**
 * Renders whichever payment UI the order's category is configured for
 * (Settings -> Payments in native-admin): a UPI ID/QR to pay to manually
 * (admin confirms via a Telegram button -- nothing more for the customer
 * to do here, no screenshot upload), or a real Razorpay checkout that
 * auto-verifies. Replaces the old dead "Pay Now" placeholder that existed
 * on every one of these four order-detail pages.
 */
export default function VerticalOrderPayment({
  type,
  order,
  categoryKey,
  onPaid,
}: {
  type: VerticalType;
  order: any;
  categoryKey: "fresh" | "liveMarket" | "grocery" | "santha";
  onPaid: () => void;
}) {
  const [settings, setSettings] = useState<{ method: "UPI" | "RAZORPAY"; upiId?: string; upiPayeeName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const razorpayLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getPublicPaymentSettings()
      .then((data) => {
        if (cancelled) return;
        setSettings(data?.[categoryKey] || { method: "UPI" });
      })
      .catch(() => !cancelled && setSettings({ method: "UPI" }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [categoryKey]);

  function loadRazorpayScript(): Promise<void> {
    if (razorpayLoaded.current || (window as any).Razorpay) {
      razorpayLoaded.current = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        razorpayLoaded.current = true;
        resolve();
      };
      script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
      document.body.appendChild(script);
    });
  }

  async function handleRazorpayPay() {
    setError("");
    if (!order.payment?.gatewayOrderId) {
      setError("Payment session not found for this order.");
      return;
    }
    setPaying(true);
    try {
      await loadRazorpayScript();
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round((order.totalAmount || 0) * 100),
        currency: "INR",
        order_id: order.payment.gatewayOrderId,
        name: "AN Group",
        description: `${type} order ${order._id}`,
        handler: async (response: any) => {
          try {
            const result: any = await verifyVerticalPayment({
              type,
              orderId: String(order._id),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (result?.success) {
              onPaid();
            } else {
              setError(result?.message || "Payment verification failed.");
            }
          } catch (err: any) {
            setError(err?.message || "Payment verification failed.");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.message || "Could not open payment.");
      setPaying(false);
    }
  }

  if (loading) return <p className="muted">Loading payment options…</p>;

  if (settings?.method === "RAZORPAY") {
    return (
      <div className="payBox">
        <button type="button" className="payBtn" onClick={handleRazorpayPay} disabled={paying}>
          {paying ? "Processing…" : `Pay ₹${order.totalAmount}`}
        </button>
        {error && <p className="error">{error}</p>}
        <style jsx>{`
          .payBox { display: flex; flex-direction: column; gap: 8px; }
          .payBtn { padding: 12px 24px; background: #c28b45; color: #fff; border: none; border-radius: 30px; font-weight: 700; cursor: pointer; }
          .payBtn:disabled { opacity: 0.6; cursor: not-allowed; }
          .error { color: #e11d48; font-size: 13px; }
        `}</style>
      </div>
    );
  }

  // UPI: show the ID + a scannable QR built from the standard upi:// deep
  // link (no server-side QR generation needed -- a public QR-image API
  // renders it client-side from the same string a UPI app would parse).
  const upiId = settings?.upiId;
  const payeeName = settings?.upiPayeeName || "AN Group";
  const upiUri = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent(
        `Order ${String(order._id).slice(-6)}`
      )}`
    : "";
  const qrImgSrc = upiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`
    : "";

  return (
    <div className="upiBox">
      {!upiId ? (
        <p className="muted">Payment isn&apos;t configured for this category yet — contact support.</p>
      ) : (
        <>
          <p className="instructions">
            Pay <strong>₹{order.totalAmount}</strong> via UPI to confirm your order. We&apos;ll update this page
            automatically once payment is confirmed — no screenshot needed.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrImgSrc} alt="UPI QR code" className="qr" />
          <p className="upiId">
            UPI ID: <strong>{upiId}</strong>
          </p>
          <a className="upiAppLink" href={upiUri}>
            Open in UPI app
          </a>
        </>
      )}
      <style jsx>{`
        .upiBox { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
        .muted { color: #888; }
        .instructions { font-size: 14px; color: #444; margin: 0; }
        .qr { width: 180px; height: 180px; border: 1px solid #eee; border-radius: 8px; }
        .upiId { font-family: monospace; font-size: 14px; margin: 0; }
        .upiAppLink { color: #c28b45; font-weight: 600; text-decoration: none; font-size: 13px; }
      `}</style>
    </div>
  );
}
