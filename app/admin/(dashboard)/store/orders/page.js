"use client";

import { useEffect, useState } from "react";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    orderId: null,
    awbNumber: "",
    courierName: "",
    trackingLink: "",
  });

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/store/orders");
      const json = await res.json();

      if (json.success) {
        setOrders(json.orders || []);
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    }
    setLoading(false);
  }

  async function handleUpdate(orderId, payload) {
    setUpdatingId(orderId);

    try {
      const body = { id: orderId, ...payload };

      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        await loadOrders();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setUpdatingId(null);
  }

  // ================= MODAL HANDLERS =================
  function openShipModal(order) {
    setModalData({
      orderId: order._id,
      awbNumber: order.awbNumber || "",
      courierName: order.courierName || "",
      trackingLink: order.trackingLink || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalData({ orderId: null, awbNumber: "", courierName: "", trackingLink: "" });
  }

  function confirmShipped() {
    const { orderId, awbNumber, courierName, trackingLink } = modalData;

    if (!awbNumber.trim() || !courierName.trim()) {
      alert("❌ Please enter both AWB Number and Courier Name");
      return;
    }

    handleUpdate(orderId, { status: "Shipped", awbNumber, courierName, trackingLink });
    closeModal();
  }

  // ================= ACTION BUTTONS =================
  function renderActions(o) {
    const disabled = updatingId === o._id;

    // 📦 PACK
    if (o.status === "Order Placed") {
      return (
        <button
          onClick={() => handleUpdate(o._id, { status: "Packed" })}
          disabled={disabled}
          style={btnPrimary}
        >
          {disabled ? "Updating..." : "📦 Mark Packed"}
        </button>
      );
    }

    // 🚚 SHIP → opens modal
    if (o.status === "Packed") {
      return (
        <button
          onClick={() => openShipModal(o)}
          disabled={disabled}
          style={btnPurple}
        >
          {disabled ? "Updating..." : "🚚 Mark Shipped"}
        </button>
      );
    }

    // 🚛 OUT FOR DELIVERY
    if (o.status === "Shipped") {
      return (
        <button
          onClick={() => handleUpdate(o._id, { status: "Out For Delivery" })}
          disabled={disabled}
          style={btnOrange}
        >
          🚛 Out For Delivery
        </button>
      );
    }

    // ✅ DELIVERED
    if (o.status === "Out For Delivery") {
      return (
        <button
          onClick={() => handleUpdate(o._id, { status: "Delivered" })}
          disabled={disabled}
          style={btnGreen}
        >
          ✅ Delivered
        </button>
      );
    }

    return null;
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>📦 Store Orders Dashboard</h1>

      {orders.length === 0 && <p>No orders assigned.</p>}

      {orders.map((o) => (
        <div key={o._id} style={card}>
          {/* HEADER */}
          <div style={header}>
            <div>
              <p><strong>Order ID:</strong> {o.orderId}</p>
              <p><strong>Status:</strong> {o.status}</p>
              <p><strong>Customer:</strong> {o.customerName}</p>
            </div>
            <div style={badge(o.status)}>{o.status}</div>
          </div>

          {/* ITEMS */}
          <div style={box}>
            <strong>🧾 Items:</strong>
            {o.items.map((i, idx) => (
              <div key={idx}>{i.name} × {i.quantity}</div>
            ))}
          </div>

          {/* WAREHOUSE */}
          {o.warehouseAssignments?.length > 0 && (
            <div style={box}>
              <strong>🏬 Warehouse:</strong>{" "}
              {o.warehouseAssignments[0]?.warehouseId?.name || "N/A"}
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ marginTop: 15 }}>{renderActions(o)}</div>

          {/* TIMELINE */}
          {o.statusHistory?.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <strong>Timeline:</strong>
              <ul>
                {o.statusHistory.map((s, i) => (
                  <li key={i}>
                    {new Date(s.time).toLocaleString()} → {s.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Enter Courier Details</h3>
            <input
              placeholder="AWB Number"
              value={modalData.awbNumber}
              onChange={(e) => setModalData({ ...modalData, awbNumber: e.target.value })}
              style={modalInput}
            />
            <input
              placeholder="Courier Name"
              value={modalData.courierName}
              onChange={(e) => setModalData({ ...modalData, courierName: e.target.value })}
              style={modalInput}
            />
            <input
              placeholder="Tracking Link (optional)"
              value={modalData.trackingLink}
              onChange={(e) => setModalData({ ...modalData, trackingLink: e.target.value })}
              style={modalInput}
            />

            <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
              <button onClick={confirmShipped} style={btnPurple}>
                ✅ Confirm Shipped
              </button>
              <button onClick={closeModal} style={btnGray}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const card = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 15,
  marginTop: 15,
  background: "#f9fafb",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
};

const box = {
  background: "#fff",
  padding: 10,
  borderRadius: 6,
  marginTop: 10,
};

const btnPrimary = {
  padding: "8px 12px",
  background: "#1e40af",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const btnPurple = {
  padding: "8px 12px",
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const btnOrange = {
  padding: "8px 12px",
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const btnGreen = {
  padding: "8px 12px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const btnGray = {
  padding: "8px 12px",
  background: "#6b7280",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const badge = (status) => ({
  padding: "6px 12px",
  borderRadius: 20,
  color: "#fff",
  background:
    status === "Delivered"
      ? "#16a34a"
      : status === "Shipped"
      ? "#9333ea"
      : status === "Packed"
      ? "#f59e0b"
      : "#6b7280",
});

// ================= MODAL =================
const modalOverlay = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 999,
};

const modalBox = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  minWidth: 300,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const modalInput = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
};
