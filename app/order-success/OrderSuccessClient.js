"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderSuccessClient() {
  const params = useSearchParams();

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("LOADING");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceRequested, setInvoiceRequested] = useState(false);

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
    sessionStorage.setItem("lastOrderId", id);

    fetchOrder(id);

    const interval = setInterval(() => {
      fetchOrder(id, true);
    }, 15000);

    return () => clearInterval(interval);
  }, [params]);

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

      const inv = data.order?.invoice;

      if (inv?.invoiceNumber) {
        setInvoice(inv);
      }

      if (
        ["PAID", "PROCESSING", "PACKED", "DISPATCHED", "DELIVERED"].includes(
          data.order?.status
        ) &&
        !invoiceRequested
      ) {
        setInvoiceRequested(true);
        generateInvoice(id);
      }
    } catch (err) {
      setStatus("ERROR");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateInvoice = async (id) => {
    try {
      setInvoiceLoading(true);

      const res = await fetch(
        "https://www.angroup.in/api/invoice/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id }),
        }
      );

      const data = await res.json();

      if (data?.success) {
        setInvoice({
          invoiceNumber: data.invoiceNumber,
          invoiceUrl: data.invoiceUrl,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const copyOrderId = async () => {
    await navigator.clipboard.writeText(orderId);
    alert("Order ID copied");
  };

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

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h1 style={styles.title}>Order Success</h1>

        <div style={styles.orderCard}>
          <div>
            <div style={styles.label}>ORDER ID</div>
            <div style={styles.orderId}>{orderId}</div>
          </div>

          <button onClick={copyOrderId} style={styles.copyBtn}>
            Copy
          </button>
        </div>

        <div
          style={{
            ...styles.statusBox,
            background: getStatusColor(),
          }}
        >
          {status}
        </div>

        {invoice?.invoiceNumber && (
          <div style={styles.infoBox}>
            <div>
              <b>Invoice:</b> {invoice.invoiceNumber}
            </div>
        
            <a
              href={`https://www.angroup.in/invoice/${invoice.invoiceNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                background: "#16a34a",
                color: "#fff",
                padding: "10px 15px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Download Invoice
            </a>
          </div>
        )}

        <div style={styles.actions}>
          <button
            onClick={() => fetchOrder(orderId)}
            style={styles.refreshBtn}
          >
            Refresh
          </button>

          <Link href="/products">
            <button style={styles.shopBtn}>Continue Shopping</button>
          </Link>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: { minHeight: "100vh", padding: 20 },
  card: { maxWidth: 650, margin: "auto", padding: 30, background: "#fff" },
  title: { textAlign: "center" },
  orderCard: { display: "flex", justifyContent: "space-between" },
  label: { fontSize: 12 },
  orderId: { fontWeight: 700 },
  copyBtn: { background: "#000", color: "#fff", padding: 10 },
  statusBox: { padding: 10, color: "#fff", marginTop: 20 },
  infoBox: { marginTop: 20 },
  actions: { display: "flex", gap: 10, marginTop: 20 },
  refreshBtn: { flex: 1 },
  shopBtn: { background: "green", color: "#fff", padding: 10 },
};
