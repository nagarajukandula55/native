"use client";

import { useEffect, useMemo, useState } from "react";

export default function FulfillmentPage() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [creating, setCreating] =
    useState("");

  const [couriers, setCouriers] =
    useState({});

  /* =====================================
     FETCH ORDERS
  ===================================== */

  const fetchOrders = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        "/api/orders/list",
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

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

  /* =====================================
     FILTER
  ===================================== */

  const filtered = useMemo(() => {

    let temp = [...orders];

    if (status !== "ALL") {

      temp = temp.filter(
        (o) => o.status === status
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

        o.shipping?.awbNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    }

    return temp;

  }, [orders, status, search]);

  /* =====================================
     STATS
  ===================================== */

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

      processing:
        orders.filter(
          (o) =>
            o.status ===
            "PROCESSING"
        ).length,

      packed:
        orders.filter(
          (o) =>
            o.status === "PACKED"
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

  /* =====================================
     UPDATE STATUS
  ===================================== */

  const updateStatus = async (
    id,
    newStatus
  ) => {

    try {

      const res = await fetch(
        "/api/orders/update-status",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id,
            status: newStatus,
          }),
        }
      );

      const data =
        await res.json();

      if (data?.success) {

        fetchOrders();

      } else {

        alert(
          data?.message ||
            "Failed"
        );
      }

    } catch (err) {

      console.log(err);

      alert(
        "Status update failed"
      );
    }
  };

  /* =====================================
     LOAD COURIERS
  ===================================== */

  const loadCouriers = async (
    orderId
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
            orderId,
          }),
        }
      );

      const data =
        await res.json();

      if (data?.success) {

        setCouriers((prev) => ({
          ...prev,
          [orderId]:
            data.couriers || [],
        }));
      }

    } catch (err) {

      console.log(err);
    }
  };

  /* =====================================
     CREATE SHIPMENT
  ===================================== */

  const createShipment = async (
    orderId,
    courierId
  ) => {

    try {

      setCreating(orderId);

      const res = await fetch(
        "/api/shipping/create-shipment",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            orderId,

            courierId,
          }),
        }
      );

      const data =
        await res.json();

      if (data?.success) {

        alert(
          "Shipment Created"
        );

        fetchOrders();

      } else {

        alert(
          data?.message ||
            "Shipment failed"
        );
      }

    } catch (err) {

      console.log(err);

      alert(
        "Shipment error"
      );

    } finally {

      setCreating("");
    }
  };

  /* =====================================
     STATUS COLORS
  ===================================== */

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

  return (

    <div style={styles.page}>

      {/* =====================================
         HEADER
      ===================================== */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Enterprise Fulfillment
          </h1>

          <p style={styles.subtitle}>
            Live warehouse &
            shipping management
          </p>

        </div>

        <input
          placeholder="Search Order / Phone / AWB"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={styles.search}
        />

      </div>

      {/* =====================================
         STATS
      ===================================== */}

      <div style={styles.statsGrid}>

        <StatCard
          label="Total"
          value={stats.total}
          color="#111827"
        />

        <StatCard
          label="Pending"
          value={stats.pending}
          color="#ef4444"
        />

        <StatCard
          label="Processing"
          value={stats.processing}
          color="#7c3aed"
        />

        <StatCard
          label="Packed"
          value={stats.packed}
          color="#f59e0b"
        />

        <StatCard
          label="Dispatched"
          value={stats.dispatched}
          color="#0891b2"
        />

        <StatCard
          label="Delivered"
          value={stats.delivered}
          color="#16a34a"
        />

      </div>

      {/* =====================================
         FILTERS
      ===================================== */}

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
                  : "#111",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* =====================================
         TABLE
      ===================================== */}

      {loading ? (

        <div style={styles.loading}>
          Loading orders...
        </div>

      ) : (

        <div style={styles.tableWrap}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>
                  Order
                </th>

                <th style={styles.th}>
                  Customer
                </th>

                <th style={styles.th}>
                  Amount
                </th>

                <th style={styles.th}>
                  Payment
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Shipping
                </th>

                <th style={styles.th}>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((o) => (

                <tr
                  key={o._id}
                  style={styles.tr}
                >

                  <td style={styles.td}>

                    <div
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {o.orderId}
                    </div>

                    <small>
                      {new Date(
                        o.createdAt
                      ).toLocaleString()}
                    </small>

                  </td>

                  <td style={styles.td}>

                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {o.address?.name}
                    </div>

                    <small>
                      {
                        o.address?.phone
                      }
                    </small>

                  </td>

                  <td style={styles.td}>
                    ₹{o.amount}
                  </td>

                  <td style={styles.td}>

                    <div
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {
                        o.payment
                          ?.method
                      }
                    </div>

                    <small>
                      {
                        o.payment
                          ?.status
                      }
                    </small>

                  </td>

                  <td style={styles.td}>

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

                  </td>

                  <td style={styles.td}>

                    {o.shipping
                      ?.awbNumber ? (

                      <div>

                        <div>
                          📦 {
                            o.shipping
                              ?.awbNumber
                          }
                        </div>

                        <small>
                          {
                            o.shipping
                              ?.courierPartner
                          }
                        </small>

                      </div>

                    ) : (

                      <span
                        style={{
                          color:
                            "#9ca3af",
                        }}
                      >
                        Not Shipped
                      </span>
                    )}

                  </td>

                  <td style={styles.td}>

                    <div
                      style={
                        styles.actionWrap
                      }
                    >

                      {o.status ===
                        "PAID" && (

                        <button
                          style={
                            styles.blueBtn
                          }
                          onClick={() =>
                            updateStatus(
                              o._id,
                              "PROCESSING"
                            )
                          }
                        >
                          Start
                        </button>
                      )}

                      {o.status ===
                        "PROCESSING" && (

                        <button
                          style={
                            styles.purpleBtn
                          }
                          onClick={() =>
                            updateStatus(
                              o._id,
                              "PACKED"
                            )
                          }
                        >
                          Packed
                        </button>
                      )}

                      {o.status ===
                        "PACKED" &&
                        !o.shipping
                          ?.awbNumber && (

                        <button
                          style={
                            styles.orangeBtn
                          }
                          onClick={() =>
                            loadCouriers(
                              o.orderId
                            )
                          }
                        >
                          Load Couriers
                        </button>
                      )}

                      {couriers[
                        o.orderId
                      ]?.map((c) => (

                        <button
                          key={
                            c.courier_company_id
                          }
                          style={
                            styles.darkBtn
                          }
                          disabled={
                            creating ===
                            o.orderId
                          }
                          onClick={() =>
                            createShipment(
                              o.orderId,
                              c.courier_company_id
                            )
                          }
                        >
                          {
                            c.courier_name
                          }
                        </button>
                      ))}

                      {o.shipping
                        ?.labelUrl && (

                        <a
                          href={
                            o.shipping
                              ?.labelUrl
                          }
                          target="_blank"
                          style={
                            styles.greenBtn
                          }
                        >
                          Label
                        </a>
                      )}

                    </div>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

/* =====================================
   STAT CARD
===================================== */

function StatCard({
  label,
  value,
  color,
}) {

  return (

    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 18,
        boxShadow:
          "0 4px 18px rgba(0,0,0,0.06)",
        borderLeft:
          `5px solid ${color}`,
      }}
    >

      <div
        style={{
          color: "#6b7280",
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>

    </div>
  );
}

/* =====================================
   STYLES
===================================== */

const styles = {

  page: {
    padding: 24,
    background: "#f3f4f6",
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
    fontSize: 34,
    fontWeight: 800,
    marginBottom: 5,
  },

  subtitle: {
    color: "#6b7280",
  },

  search: {
    padding: 14,
    width: 350,
    borderRadius: 14,
    border: "1px solid #ddd",
    fontSize: 15,
    background: "#fff",
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
    border: "none",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },

  tableWrap: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: 20,
    boxShadow:
      "0 6px 25px rgba(0,0,0,0.06)",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  th: {
    textAlign: "left",
    padding: 18,
    background: "#111827",
    color: "#fff",
    fontSize: 14,
  },

  td: {
    padding: 18,
    borderBottom:
      "1px solid #f3f4f6",
    verticalAlign: "top",
  },

  tr: {
    transition: "0.2s",
  },

  status: {
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 700,
    display: "inline-block",
    fontSize: 12,
  },

  actionWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  blueBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  purpleBtn: {
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  orangeBtn: {
    background: "#ea580c",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  darkBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  greenBtn: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 700,
  },

  loading: {
    padding: 40,
    textAlign: "center",
    fontWeight: 700,
  },
};
