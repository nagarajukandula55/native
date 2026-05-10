"use client";

import { useEffect, useMemo, useState } from "react";

import OrderTimeline from "@/components/OrderTimeline";

export default function FulfillmentPage() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [status, setStatus] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [creating, setCreating] =
    useState("");

  const [couriers, setCouriers] =
    useState({});

  /* =========================================
     FETCH ORDERS
  ========================================= */

  const fetchOrders = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        "/api/orders/list",
        {
          cache: "no-store",
        }
      );

      const data =
        await res.json();

      if (data?.success) {

        setOrders(
          data.orders || []
        );
      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================================
     FILTER
  ========================================= */

  const filtered = useMemo(() => {

    let temp = [...orders];

    if (status !== "ALL") {

      temp = temp.filter(
        (o) =>
          o.status === status
      );
    }

    if (search) {

      temp = temp.filter((o) =>

        o.orderId
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        o.address?.phone?.includes(
          search
        ) ||

        o.address?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        o.shipping?.awbNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    }

    return temp;

  }, [orders, status, search]);

  /* =========================================
     STATS
  ========================================= */

  const stats = useMemo(() => {

    return {

      total:
        orders.length,

      pending:
        orders.filter(
          (o) =>
            o.status ===
            "PENDING_PAYMENT"
        ).length,

      paid:
        orders.filter(
          (o) =>
            o.status ===
            "PAID"
        ).length,

      processing:
        orders.filter(
          (o) =>
            o.status ===
            "PROCESSING"
        ).length,

      packed:
        orders.filter(
          (o) =>
            o.status ===
            "PACKED"
        ).length,

      dispatched:
        orders.filter(
          (o) =>
            o.status ===
            "DISPATCHED"
        ).length,

      delivered:
        orders.filter(
          (o) =>
            o.status ===
            "DELIVERED"
        ).length,
    };

  }, [orders]);

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateStatus = async (
    id,
    newStatus
  ) => {

    try {

      const res = await fetch(
        "/api/admin/orders/update-status",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            id,

            status:
              newStatus,
          }),
        }
      );

      const data =
        await res.json();

      if (data?.success) {

        alert(
          "Status Updated ✅"
        );

        fetchOrders();

      } else {

        alert(
          data.message ||
          "Failed to update status"
        );
      }

    } catch (err) {

      console.error(err);

      alert(
        "Error updating status"
      );
    }
  };

  /* =========================================
     MARK PAID
  ========================================= */

  const markAsPaid = async (
    order
  ) => {

    const utr = prompt(
      "Enter UTR / Reference (optional)"
    );

    try {

      const res = await fetch(
        "/api/payment/mark-paid",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            orderId:
              order.orderId,

            utr,
          }),
        }
      );

      const data =
        await res.json();

      if (data.success) {

        alert(
          "Marked as Paid ✅"
        );

        fetchOrders();

      } else {

        alert(
          data.message ||
          "Failed ❌"
        );
      }

    } catch (err) {

      console.log(err);

      alert(
        "Payment update failed"
      );
    }
  };

  /* =========================================
     LOAD COURIERS
  ========================================= */

  const loadCouriers = async (
    order
  ) => {

    try {

      const res = await fetch(
        "/api/shipping/couriers",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            orderId:
              order.orderId,
          }),
        }
      );

      const data =
        await res.json();

      console.log(
        "🚚 COURIERS:",
        data
      );

      if (!data.success) {

        alert(
          data.message ||
          "Failed to load couriers"
        );

        return;
      }

      setCouriers((prev) => ({
        ...prev,
        [order.orderId]:
          data.couriers || [],
      }));

    } catch (err) {

      console.log(err);

      alert(
        "Courier fetch failed"
      );
    }
  };

  /* =========================================
     CREATE SHIPMENT
  ========================================= */

  const createShipment = async (
    order,
    courierId
  ) => {

    try {

      setCreating(order.orderId);

      const dispatchType =
        document.getElementById(
          `dispatch-${order._id}`
        ).value;

      const res = await fetch(
        "/api/shipping/create-shipment",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            orderId:
              order.orderId,

            courierId,

            dispatchType,
          }),
        }
      );

      const data =
        await res.json();

      console.log(data);

      if (data.success) {

        alert(
          "Shipment Created ✅"
        );

        fetchOrders();

      } else {

        alert(
          data.message ||
          "Shipment Failed"
        );
      }

    } catch (err) {

      console.log(err);

      alert(
        "Shipment creation failed"
      );

    } finally {

      setCreating("");
    }
  };

  /* =========================================
     STATUS COLORS
  ========================================= */

  const statusColor = (s) => {

    switch (s) {

      case "PENDING_PAYMENT":
        return "#ef4444";

      case "PAID":
        return "#2563eb";

      case "PROCESSING":
        return "#7c3aed";

      case "PACKED":
        return "#f59e0b";

      case "DISPATCHED":
        return "#0891b2";

      case "DELIVERED":
        return "#16a34a";

      default:
        return "#6b7280";
    }
  };

  /* =========================================
     BUTTON STYLE
  ========================================= */

  const btn = (bg) => ({

    padding: "10px 14px",

    border: "none",

    borderRadius: 12,

    cursor: "pointer",

    fontSize: 12,

    fontWeight: 700,

    background: bg,

    color: "#fff",

    transition: "0.2s",
  });

  return (

    <div style={styles.page}>

      {/* =========================================
         HEADER
      ========================================= */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            📦 Enterprise Fulfillment
          </h1>

          <p style={styles.subtitle}>
            Real-time warehouse, dispatch & courier operations
          </p>

        </div>

        <input
          placeholder="Search Order / Customer / Phone / AWB"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={styles.search}
        />

      </div>

      {/* =========================================
         STATS
      ========================================= */}

      <div style={styles.statsGrid}>

        <StatCard
          label="TOTAL"
          value={stats.total}
          color="#111827"
        />

        <StatCard
          label="PENDING"
          value={stats.pending}
          color="#ef4444"
        />

        <StatCard
          label="PAID"
          value={stats.paid}
          color="#2563eb"
        />

        <StatCard
          label="PROCESSING"
          value={stats.processing}
          color="#7c3aed"
        />

        <StatCard
          label="PACKED"
          value={stats.packed}
          color="#f59e0b"
        />

        <StatCard
          label="DISPATCHED"
          value={stats.dispatched}
          color="#0891b2"
        />

        <StatCard
          label="DELIVERED"
          value={stats.delivered}
          color="#16a34a"
        />

      </div>

      {/* =========================================
         FILTERS
      ========================================= */}

      <div style={styles.filters}>

        {[
          "ALL",
          "PENDING_PAYMENT",
          "PAID",
          "PROCESSING",
          "PACKED",
          "DISPATCHED",
          "DELIVERED",
        ].map((s) => (

          <button
            key={s}
            onClick={() =>
              setStatus(s)
            }
            style={{
              ...styles.filterBtn,
              background:
                status === s
                  ? "#111827"
                  : "#fff",
              color:
                status === s
                  ? "#fff"
                  : "#111827",
            }}
          >
            {s}
          </button>
        ))}

      </div>

      {/* =========================================
         TABLE
      ========================================= */}

      {loading ? (

        <div style={styles.loading}>
          Loading Orders...
        </div>

      ) : filtered.length === 0 ? (

        <div style={styles.loading}>
          No Orders Found
        </div>

      ) : (

        <div style={styles.ordersGrid}>

          {filtered.map((o) => (

            <div
              key={o._id}
              style={styles.card}
            >

              {/* TOP */}

              <div style={styles.cardTop}>

                <div>

                  <div style={styles.orderId}>
                    {o.orderId}
                  </div>

                  <div style={styles.date}>
                    {new Date(
                      o.createdAt
                    ).toLocaleString()}
                  </div>

                </div>

                <div
                  style={{
                    ...styles.status,
                    background:
                      statusColor(
                        o.status
                      ),
                  }}
                >
                  {o.status}
                </div>

              </div>

              {/* CUSTOMER */}

              <div style={styles.section}>

                <div style={styles.sectionTitle}>
                  Customer
                </div>

                <div style={styles.customerName}>
                  {o.address?.name}
                </div>

                <div style={styles.smallText}>
                  📞 {o.address?.phone}
                </div>

                <div style={styles.smallText}>
                  💰 ₹{o.amount}
                </div>

                <div style={styles.smallText}>
                  💳 {o.payment?.method}
                </div>

                <div style={{
                  marginTop: 6,
                  fontWeight: 700,
                  color:
                    o.payment?.status === "SUCCESS"
                      ? "#16a34a"
                      : "#ef4444",
                }}>
                  {o.payment?.status}
                </div>

              </div>

              {/* SHIPPING */}

              <div style={styles.section}>

                <div style={styles.sectionTitle}>
                  Shipping
                </div>

                {o.shipping?.awbNumber ? (

                  <>

                    <div style={styles.smallText}>
                      🚚 {o.shipping?.courierPartner}
                    </div>

                    <div style={styles.smallText}>
                      📦 {o.shipping?.awbNumber}
                    </div>

                    <div style={styles.smallText}>
                      📍 {o.shipping?.trackingStatus || "Created"}
                    </div>

                    {o.shipping?.labelUrl && (

                      <a
                        href={
                          o.shipping?.labelUrl
                        }
                        target="_blank"
                        style={styles.labelBtn}
                      >
                        Download Label
                      </a>
                    )}

                  </>

                ) : (

                  <div style={{
                    color: "#9ca3af",
                  }}>
                    Shipment not created
                  </div>
                )}

              </div>

              {/* TIMELINE */}

              <div style={{
                marginTop: 15,
              }}>
                <OrderTimeline
                  order={o}
                />
              </div>

              {/* ACTIONS */}

              <div style={styles.actionWrap}>

                {!["SUCCESS", "PAID"].includes(
                  o.payment?.status
                ) &&
                ![
                  "PAID",
                  "PROCESSING",
                  "PACKED",
                  "DISPATCHED",
                  "DELIVERED",
                ].includes(
                  o.status
                ) && (

                  <button
                    style={btn("#16a34a")}
                    onClick={() =>
                      markAsPaid(o)
                    }
                  >
                    Mark Paid
                  </button>
                )}

                {o.status === "PAID" && (

                  <button
                    style={btn("#2563eb")}
                    onClick={() =>
                      updateStatus(
                        o._id,
                        "PROCESSING"
                      )
                    }
                  >
                    Start Processing
                  </button>
                )}

                {o.status ===
                  "PROCESSING" && (

                  <button
                    style={btn("#7c3aed")}
                    onClick={() =>
                      updateStatus(
                        o._id,
                        "PACKED"
                      )
                    }
                  >
                    Mark Packed
                  </button>
                )}

                {o.status ===
                  "PACKED" &&
                  !o.shipping
                    ?.awbNumber && (

                  <>

                    <select
                      defaultValue="COURIER"
                      id={`dispatch-${o._id}`}
                      style={styles.select}
                    >

                      <option value="COURIER">
                        Courier
                      </option>

                      <option value="BY_HAND">
                        By Hand
                      </option>

                      <option value="LOCAL_DELIVERY">
                        Local Delivery
                      </option>

                    </select>

                    <button
                      style={btn("#0f172a")}
                      onClick={() =>
                        loadCouriers(o)
                      }
                    >
                      Load Couriers
                    </button>

                  </>
                )}

                {couriers[
                  o.orderId
                ]?.map((c) => (

                  <button
                    key={
                      c.courier_company_id
                    }
                    style={btn("#ea580c")}
                    disabled={
                      creating ===
                      o.orderId
                    }
                    onClick={() =>
                      createShipment(
                        o,
                        c.courier_company_id
                      )
                    }
                  >
                    {c.courier_name}
                  </button>
                ))}

                {o.status ===
                  "DISPATCHED" && (

                  <button
                    style={btn("#111827")}
                    onClick={() =>
                      updateStatus(
                        o._id,
                        "DELIVERED"
                      )
                    }
                  >
                    Mark Delivered
                  </button>
                )}

                {o.status ===
                  "DELIVERED" && (

                  <div style={styles.completed}>
                    ✔ Delivered Successfully
                  </div>
                )}

                {/* INVOICE */}

                <a
                  href={`/api/invoice/${o.orderId}`}
                  target="_blank"
                  style={styles.invoiceBtn}
                >
                  Invoice
                </a>

                {/* RECEIPT */}

                <a
                  href={`/api/receipt/${o.orderId}`}
                  target="_blank"
                  style={styles.receiptBtn}
                >
                  Receipt
                </a>

                {/* TRACK */}

                {o.shipping?.awbNumber && (

                  <a
                    href={`/track?awb=${o.shipping?.awbNumber}`}
                    target="_blank"
                    style={styles.trackBtn}
                  >
                    Track
                  </a>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  label,
  value,
  color,
}) {

  return (

    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 22,
        boxShadow:
          "0 10px 25px rgba(0,0,0,0.06)",
        borderTop:
          `5px solid ${color}`,
      }}
    >

      <div
        style={{
          color: "#6b7280",
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>

    </div>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = {

  page: {
    padding: 24,
    background:
      "linear-gradient(to bottom,#eef2ff,#f8fafc)",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 30,
    gap: 20,
    flexWrap: "wrap",
  },

  title: {
    fontSize: 38,
    fontWeight: 900,
    marginBottom: 6,
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    fontSize: 15,
  },

  search: {
    padding: 14,
    width: 360,
    borderRadius: 14,
    border:
      "1px solid #dbeafe",
    fontSize: 15,
    background: "#fff",
    outline: "none",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: 18,
    marginBottom: 30,
  },

  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 25,
  },

  filterBtn: {
    border:
      "1px solid #d1d5db",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    transition: "0.2s",
  },

  ordersGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(420px,1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    borderRadius: 24,
    padding: 22,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",
    border:
      "1px solid rgba(255,255,255,0.7)",
  },

  cardTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  orderId: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
  },

  date: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 12,
  },

  section: {
    marginBottom: 18,
    padding: 16,
    background: "#f8fafc",
    borderRadius: 16,
  },

  sectionTitle: {
    fontWeight: 800,
    marginBottom: 10,
    color: "#111827",
  },

  customerName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
  },

  smallText: {
    color: "#4b5563",
    marginBottom: 5,
    fontSize: 14,
  },

  status: {
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12,
  },

  actionWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },

  select: {
    padding: "10px 14px",
    borderRadius: 12,
    border:
      "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 600,
  },

  labelBtn: {
    display: "inline-block",
    marginTop: 10,
    background: "#16a34a",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
  },

  invoiceBtn: {
    background: "#0f172a",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
  },

  receiptBtn: {
    background: "#7c3aed",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
  },

  trackBtn: {
    background: "#0891b2",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
  },

  completed: {
    background: "#dcfce7",
    color: "#166534",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 700,
  },

  loading: {
    padding: 60,
    textAlign: "center",
    fontWeight: 800,
    fontSize: 18,
  },
};
