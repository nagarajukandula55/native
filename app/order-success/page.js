"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderSuccess() {

  const params = useSearchParams();

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);

  const [status, setStatus] =
    useState("LOADING");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [invoice, setInvoice] = useState(null);
  
  const [invoiceLoading, setInvoiceLoading] = useState(false);

/* =========================================
   INIT
========================================= */

useEffect(() => {
  const id =
    params.get("orderId") ||
    sessionStorage.getItem("lastOrderId");

  if (!id) {
    setStatus("NOT_FOUND");
    setLoading(false);
    return;
  }

  setOrderId(id);

  sessionStorage.setItem(
    "lastOrderId",
    id
  );

  fetchOrder(id);

  const interval = setInterval(() => {
    fetchOrder(id, true);
  }, 15000);

  return () => {
    clearInterval(interval);
  };
}, [params]);

  /* =========================================
     FETCH ORDER
  ========================================= */

  const fetchOrder = async (id, silent = false) => {
    try {
      if (!silent) setRefreshing(true);
  
      const res = await fetch(
        `https://www.angroup.in/api/orders/get-by-id?orderId=${id}`,
        { cache: "no-store" }
      );
  
      const data = await res.json();
  
      if (!res.ok || !data?.success) {
        setStatus("NOT_FOUND");
        return;
      }
  
      setOrder(data.order);
      setStatus(data.order?.status || "PENDING_PAYMENT");

      console.log(
          "ORDER STATUS:",
          data.order?.status
        );
        
        if (data.order?.invoice?.invoiceNumber) {
          setInvoice({
            invoiceNumber:
              data.order.invoice.invoiceNumber,
            invoiceUrl:
              data.order.invoice.invoiceUrl,
          });
        }
  
      // ✅ IMPORTANT FIX: prevent repeated invoice calls
      const alreadyRequested = sessionStorage.getItem(`inv_${id}`);
  
      if (
        ["PAID","PROCESSING","PACKED","DISPATCHED","DELIVERED"]
          .includes(data.order?.status) &&
        !alreadyRequested
      ) {
        sessionStorage.setItem(`inv_${id}`, "1");
        generateInvoice(id);
      }
  
    } catch (err) {
      console.log(err);
      setStatus("ERROR");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================
     COPY
  ========================================= */

  const copyOrderId = async () => {

    try {

      await navigator.clipboard.writeText(
        orderId
      );

      alert(
        "Order ID copied"
      );

    } catch (err) {

      console.log(err);
    }
  };

  /* ==========================        ====================*/
  
const generateInvoice = async (id) => {
  try {
    setInvoiceLoading(true);

    console.log("================================");
    console.log("GENERATING INVOICE FOR:", id);
    console.log("================================");

    const res = await fetch(
      "https://www.angroup.in/api/invoice/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: id,
        }),
      }
    );

    console.log("HTTP STATUS:", res.status);

    const text = await res.text();

    console.log("RAW RESPONSE:", text);

    let data = null;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("INVALID JSON RESPONSE");
      return;
    }

    console.log("PARSED RESPONSE:", data);

    if (data?.success) {
      setInvoice({
        invoiceNumber: data.invoiceNumber,
        invoiceUrl: data.invoiceUrl,
      });

      console.log(
        "INVOICE CREATED:",
        data.invoiceNumber
      );
    } else {
      console.error(
        "INVOICE FAILED:",
        data?.message
      );
    }
  } catch (err) {
    console.error(
      "GENERATE INVOICE ERROR:",
      err
    );
  } finally {
    setInvoiceLoading(false);
  }
};
  /* =========================================
     STATUS COLOR
  ========================================= */

  const getStatusColor = () => {

    switch (status) {

      case "PAID":
        return "#16a34a";

      case "PROCESSING":
        return "#2563eb";

      case "PACKED":
        return "#7c3aed";

      case "DISPATCHED":
        return "#ea580c";

      case "DELIVERED":
        return "#059669";

      case "FAILED":
        return "#dc2626";

      default:
        return "#d97706";
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        {/* SUCCESS ICON */}

        <div style={styles.iconBox}>

          {status === "PAID" ||
          status === "PROCESSING" ||
          status === "PACKED" ||
          status === "DISPATCHED" ||
          status === "DELIVERED"

            ? "✅"

            : status === "FAILED"

            ? "❌"

            : "⏳"}

        </div>

        {/* TITLE */}

        <h1 style={styles.title}>

          {status === "PAID" &&
            "Payment Successful"}

          {status === "PROCESSING" &&
            "Order Processing"}

          {status === "PACKED" &&
            "Order Packed"}

          {status === "DISPATCHED" &&
            "Order Dispatched"}

          {status === "DELIVERED" &&
            "Order Delivered"}

          {status === "FAILED" &&
            "Payment Failed"}

          {status ===
            "PENDING_PAYMENT" &&
            "Order Created"}

        </h1>

        <p style={styles.subtitle}>
          Thank you for shopping with us
        </p>

        {/* ORDER ID */}

        <div style={styles.orderCard}>

          <div>

            <div style={styles.label}>
              ORDER ID
            </div>

            <div style={styles.orderId}>
              {orderId}
            </div>

          </div>

          <button
            onClick={copyOrderId}
            style={styles.copyBtn}
          >
            Copy
          </button>

        </div>

      {/* INVOICE SECTION */}
        {invoice?.invoiceNumber && (
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span>Invoice</span>
              <b>{invoice.invoiceNumber}</b>
            </div>
        
            <a
              href={invoice?.invoiceUrl}
              style={{
                display: "inline-block",
                marginTop: 10,
                background: "#000",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              Download Invoice
            </a>
          </div>
        )}

        {/* STATUS */}

        <div
          style={{
            ...styles.statusBox,
            background:
              getStatusColor(),
          }}
        >

          {status}

        </div>

        {/* ORDER DETAILS */}

        {order && (

          <div style={styles.infoBox}>

            <div style={styles.infoRow}>
              <span>Customer</span>
              <b>
                {order.address?.name}
              </b>
            </div>

            <div style={styles.infoRow}>
              <span>Phone</span>
              <b>
                {order.address?.phone}
              </b>
            </div>

            <div style={styles.infoRow}>
              <span>Amount</span>
              <b>
                ₹{order.amount}
              </b>
            </div>

            <div style={styles.infoRow}>
              <span>Payment</span>
              <b>
                {order.payment?.method}
              </b>
            </div>

          </div>
        )}

        {/* TRACKING */}

        {order?.shipping
          ?.awbNumber && (

          <div style={styles.awbBox}>

            <div>
              <small>
                Tracking AWB
              </small>

              <div
                style={{
                  fontWeight: 700,
                }}
              >
                {
                  order.shipping
                    ?.awbNumber
                }
              </div>
            </div>

            <Link
              href={`/track?awb=${order.shipping?.awbNumber}`}
            >
              <button
                style={
                  styles.trackBtn
                }
              >
                Track Shipment
              </button>
            </Link>

          </div>
        )}

        {/* ACTIONS */}

        <div style={styles.actions}>

          <button
            onClick={() =>
              fetchOrder(orderId)
            }
            style={styles.refreshBtn}
          >

            {refreshing
              ? "Refreshing..."
              : "Refresh Status"}

          </button>

          <Link href="/products">

            <button
              style={
                styles.shopBtn
              }
            >
              Continue Shopping
            </button>

          </Link>

        </div>

      </div>

    </div>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = {

  page: {

    minHeight: "100vh",

    background:
      "linear-gradient(to bottom right, #f8fafc, #eef2ff)",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    padding: 20,
  },

  card: {

    width: "100%",

    maxWidth: 650,

    background: "#fff",

    borderRadius: 24,

    padding: 35,

    boxShadow:
      "0 10px 40px rgba(0,0,0,0.08)",
  },

  iconBox: {

    fontSize: 70,

    textAlign: "center",

    marginBottom: 10,
  },

  title: {

    textAlign: "center",

    fontSize: 32,

    marginBottom: 8,
  },

  subtitle: {

    textAlign: "center",

    color: "#666",

    marginBottom: 30,
  },

  orderCard: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    border:
      "1px solid #eee",

    padding: 20,

    borderRadius: 16,

    marginBottom: 20,
  },

  label: {

    fontSize: 12,

    color: "#666",

    marginBottom: 6,
  },

  orderId: {

    fontWeight: 700,

    fontSize: 20,
  },

  copyBtn: {

    background: "#111",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

    borderRadius: 10,

    cursor: "pointer",
  },

  statusBox: {

    padding: 14,

    borderRadius: 12,

    textAlign: "center",

    color: "#fff",

    fontWeight: 700,

    marginBottom: 25,
  },

  infoBox: {

    border:
      "1px solid #eee",

    borderRadius: 16,

    padding: 20,

    marginBottom: 20,
  },

  infoRow: {

    display: "flex",

    justifyContent:
      "space-between",

    padding: "10px 0",

    borderBottom:
      "1px solid #f1f1f1",
  },

  awbBox: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    background: "#f8fafc",

    padding: 20,

    borderRadius: 16,

    marginBottom: 20,
  },

  trackBtn: {

    background: "#2563eb",

    color: "#fff",

    border: "none",

    padding:
      "10px 14px",

    borderRadius: 10,

    cursor: "pointer",
  },

  actions: {

    display: "flex",

    gap: 12,

    marginTop: 10,
  },

  refreshBtn: {

    flex: 1,

    background: "#111",

    color: "#fff",

    border: "none",

    padding: 14,

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
  },

  shopBtn: {

    background:
      "#16a34a",

    color: "#fff",

    border: "none",

    padding:
      "14px 18px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
  },
};
