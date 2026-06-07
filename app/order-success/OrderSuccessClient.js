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
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 15px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "750px",
          background: "#fff",
          borderRadius: "20px",
          padding: "40px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* SUCCESS ICON */}
  
        <div
          style={{
            textAlign: "center",
            fontSize: "70px",
          }}
        >
          ✅
        </div>
  
        {/* TITLE */}
  
        <h1
          style={{
            textAlign: "center",
            marginTop: 10,
            marginBottom: 10,
            color: "#16a34a",
          }}
        >
          Order Placed Successfully
        </h1>
  
        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "16px",
            marginBottom: "30px",
          }}
        >
          Thank you for shopping with
          <strong> Native ❤️</strong>
  
          <br />
  
          Your order has been received and
          payment was completed successfully.
        </p>
  
        {/* ORDER DETAILS */}
  
        <div
          style={{
            background: "#f8fafc",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                }}
              >
                ORDER ID
              </div>
  
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {orderId}
              </div>
            </div>
  
            <button
              onClick={copyOrderId}
              style={{
                background: "#000",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Copy
            </button>
          </div>
        </div>
  
        {/* STATUS */}
  
        <div
          style={{
            background: getStatusColor(),
            color: "#fff",
            padding: "15px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Status : {status}
        </div>
  
        {/* CUSTOMER DETAILS */}
  
        {order && (
          <div
            style={{
              background: "#fafafa",
              border: "1px solid #eee",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <h3>
              Customer Information
            </h3>
  
            <p>
              <strong>Name:</strong>{" "}
              {order?.address?.name}
            </p>
  
            <p>
              <strong>Phone:</strong>{" "}
              {order?.address?.phone}
            </p>
  
            <p>
              <strong>Email:</strong>{" "}
              {order?.address?.email}
            </p>
  
            <p>
              <strong>Total Amount:</strong>{" "}
              ₹{order?.amount}
            </p>
          </div>
        )}
  
        {/* INVOICE */}
  
        {invoice?.invoiceNumber && (
          <div
            style={{
              background: "#ecfdf5",
              border:
                "1px solid #10b981",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <div>
              <strong>
                Invoice Generated
              </strong>
            </div>
  
            <div
              style={{
                marginTop: 5,
              }}
            >
              Invoice No:
              {" "}
              {invoice.invoiceNumber}
            </div>
  
            <a
              href={`https://www.angroup.in/invoice/${invoice.invoiceNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "15px",
                background: "#16a34a",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Download Invoice
            </a>
          </div>
        )}
  
        {invoiceLoading && (
          <div
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Generating Invoice...
          </div>
        )}
  
        {/* ACTIONS */}
  
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={() =>
              fetchOrder(orderId)
            }
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Refresh Status
          </button>
  
          <Link
            href="/products"
            style={{ flex: 1 }}
          >
            <button
              style={{
                width: "100%",
                padding: "14px",
                background:
                  "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Continue Shopping
            </button>
          </Link>
        </div>
  
        {/* FOOTER */}
  
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            color: "#888",
            fontSize: "13px",
          }}
        >
          Thank you for choosing Native ❤️
          <br />
          We look forward to serving you again.
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
