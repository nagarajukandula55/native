"use client";

import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/orders/list");

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();

        if (data?.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          setFiltered(data.orders);
        } else {
          setOrders([]);
          setFiltered([]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= FILTER LOGIC ================= */
  useEffect(() => {
    let temp = [...orders];

    if (status !== "ALL") {
      temp = temp.filter(
        (o) => (o.status || "").toUpperCase() === status
      );
    }

    if (search) {
      temp = temp.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
          o.address?.phone?.includes(search)
      );
    }

    setFiltered(temp);
  }, [status, search, orders]);

  /* ================= STATUS UPDATE ================= */
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();

      if (data?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === id ? { ...o, status: newStatus } : o
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  /* ================= ACTION BUTTONS ================= */
  const ActionButtons = ({ o }) => {
    return (
      <span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>

        {/* MARK PAID (manual COD / pending UPI) */}
        {o.status !== "PAID" && (
          <button onClick={() => updateStatus(o._id, "PAID")}>
            Mark Paid
          </button>
        )}

        {/* PROCESS */}
        {o.status === "PAID" && (
          <button onClick={() => updateStatus(o._id, "PROCESSING")}>
            Process
          </button>
        )}

        {/* ASSIGN TO WAREHOUSE */}
        {o.status === "PROCESSING" && (
          <button onClick={() => updateStatus(o._id, "ASSIGNED_TO_WH")}>
            Assign WH
          </button>
        )}

        {/* SHIP */}
        {o.status === "ASSIGNED_TO_WH" && (
          <button onClick={() => updateStatus(o._id, "SHIPPED")}>
            Ship
          </button>
        )}

        {/* DELIVER */}
        {o.status === "SHIPPED" && (
          <button onClick={() => updateStatus(o._id, "DELIVERED")}>
            Deliver
          </button>
        )}

      </span>
    );
  };

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h2>Orders Dashboard</h2>

        <input
          placeholder="Search Order ID / Phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />
      </div>

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* FILTERS */}
      <div style={filters}>
        {["ALL", "PAID", "PROCESSING", "ASSIGNED_TO_WH", "SHIPPED", "DELIVERED"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                ...filterBtn,
                background: status === s ? "#c28b45" : "#eee",
                color: status === s ? "#fff" : "#000",
              }}
            >
              {s}
            </button>
          )
        )}
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading orders...</p>
      ) : filtered.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div style={table}>
          <div style={rowHead}>
            <span>Order ID</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.map((o) => (
            <div key={o._id} style={row}>
              <span>{o.orderId}</span>

              <span>
                {o.address?.name || "N/A"}
                <br />
                <small>{o.address?.phone || "N/A"}</small>
              </span>

              <span>₹{o.amount}</span>

              <span>
                <b>{o.status}</b>
              </span>

              <ActionButtons o={o} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: 20,
  maxWidth: 1200,
  margin: "auto",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const input = {
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 8,
  width: 250,
};

const filters = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
  flexWrap: "wrap",
};

const filterBtn = {
  padding: "8px 12px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const table = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const rowHead = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
  fontWeight: "bold",
  padding: 10,
  background: "#f5f5f5",
  borderRadius: 8,
};

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
  padding: 10,
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 8,
  alignItems: "center",
};
