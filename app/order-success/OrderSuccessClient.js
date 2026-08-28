"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { anGet, anPost } from "@/lib/an-sdk/client";
import { notifyAccounting } from "@/lib/accounting-sync";

// Every other data call in this app routes through lib/an-sdk (which reads
// NEXT_PUBLIC_AN_API, attaches businessId/auth, etc.) -- this page instead
// had the ANgroup production hostname hardcoded directly into three
// separate fetch() calls, bypassing that config entirely. That breaks any
// non-production environment (staging/local dev against a different
// ANgroup deployment) and drops the businessId/auth attachment the SDK
// normally handles. NEXT_PUBLIC_AN_API is still needed here (not just
// anGet/anPost) for the invoice download link, which has to be a real
// clickable URL, not an API call.
const AN_API = process.env.NEXT_PUBLIC_AN_API || "";

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
  const [accountingSynced, setAccountingSynced] = useState(false);

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

      const data = await anGet(`/api/orders/get-by-id?orderId=${id}`);

      if (!data?.success) {
        setStatus("NOT_FOUND");
        return;
      }

      setOrder(data.order);
      setStatus(data.order?.status || "PENDING_PAYMENT");

      const inv = data.order?.invoice;

      if (
        inv?.invoiceNumber ||
        inv?.invoiceUrl
      ) {
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

      if (
        ["PAID", "PROCESSING", "PACKED", "DISPATCHED", "DELIVERED"].includes(
          data.order?.status
        ) &&
        !accountingSynced
      ) {
        setAccountingSynced(true);
        syncToAccounting(id, data.order);
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

      const data = await anPost("/api/invoice/generate", { orderId: id });

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

  // Pushes this paid order into AN-Accounting (the owner's own bookkeeping
  // app — a different system from the ANgroup backend everything else on
  // this page talks to). Best-effort: notifyAccounting() never throws, so
  // this never affects the order-success experience for the customer.
  const syncToAccounting = async (id, orderData) => {
    const address = orderData?.address || {};
    if (!address.state) {
      // No state means we can't determine CGST+SGST vs. IGST on the
      // AN-Accounting side — skip rather than send an incomplete sale.
      return;
    }

    const items = Array.isArray(orderData?.items) ? orderData.items : [];
    const lines = items.length
      ? items.map((item) => {
          const qty = Math.max(1, Number(item.qty) || 1);
          const taxable = Number(item.taxableValue) || 0;
          return {
            description: item.name || "Item",
            quantity: qty,
            rate: Number((taxable / qty).toFixed(2)),
            gstRatePercent: Number(item.gstRate) || 0,
          };
        })
      : [
          // Fallback if the order fetch doesn't include line items: one
          // line for the full amount, no GST breakdown (better than
          // silently dropping the sale entirely).
          {
            description: `Order ${id}`,
            quantity: 1,
            rate: Number(orderData?.amount) || 0,
            gstRatePercent: 0,
          },
        ];

    await notifyAccounting({
      orderId: id,
      customer: {
        name: address.name || "Customer",
        email: address.email || undefined,
        phone: address.phone || undefined,
        state: address.state,
      },
      lines,
      payment: {
        amount: Number(orderData?.amount) || 0,
        reference: id,
      },
    });
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

              {order?.address?.email && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    Email: {order.address.email}
                  </div>
                )}
  
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {orderId}
              </div>
            </div>
  
            <button onClick={copyOrderId} className="btn btn-primary btn-sm">
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
              href={`${AN_API}/invoice/${invoice.invoiceNumber}`}
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
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Refresh Status
          </button>

          <Link
            href="/products"
            style={{ flex: 1 }}
          >
            <button className="btn btn-accent" style={{ width: "100%" }}>
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
