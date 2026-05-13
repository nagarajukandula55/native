"use client";

import { useEffect, useState } from "react";

type Order = {
  _id: string;
  orderId: string;
  amount: number;
  status: string;
  payment?: {
    status?: string;
    utr?: string;
  };
  address?: {
    name?: string;
    phone?: string;
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/orders/list");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
        setFiltered(data.orders || []);
      }
    } catch (err) {
      console.error("FETCH ORDERS ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let temp = [...orders];

    if (status !== "ALL") {
      temp = temp.filter((o) => o.status === status);
    }

    if (search) {
      temp = temp.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
          o.address?.phone?.includes(search) ||
          o.address?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(temp);
  }, [status, search, orders]);

  /* ================= MARK AS PAID ================= */
  const markAsPaid = async (orderId: string) => {
    const utr = prompt("Enter UTR / Transaction ID");

    if (!utr) return;

    const res = await fetch("/api/payment/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        utr,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Marked as Paid ✅");
      fetchOrders();
    } else {
      alert(data.message || "Failed");
    }
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch("/api/admin/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        status,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Updated ✅");
      fetchOrders();
    } else {
      alert(data.message || "Failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 ShopNative Orders</h2>

      {/* SEARCH */}
      <input
        placeholder="Search orders..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 10,
          marginTop: 10,
          marginBottom: 10,
          width: 300,
        }}
      />

      {/* FILTER */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
            onClick={() => setStatus(s)}
            style={{
              padding: 8,
              background: status === s ? "#000" : "#eee",
              color: status === s ? "#fff" : "#000",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table width="100%" border={1} cellPadding={10} style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o._id}>
                <td>{o.orderId}</td>

                <td>
                  {o.address?.name}
                  <br />
                  <small>{o.address?.phone}</small>
                </td>

                <td>₹{o.amount}</td>

                <td>{o.payment?.status || "PENDING"}</td>

                <td>{o.status}</td>

                <td style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {/* MARK PAID */}
                  {o.payment?.status !== "PAID" && (
                    <button onClick={() => markAsPaid(o.orderId)}>
                      Mark Paid
                    </button>
                  )}

                  {/* PROCESS */}
                  {o.status === "PAID" && (
                    <button
                      onClick={() => updateStatus(o.orderId, "PROCESSING")}
                    >
                      Process
                    </button>
                  )}

                  {/* PACK */}
                  {o.status === "PROCESSING" && (
                    <button onClick={() => updateStatus(o.orderId, "PACKED")}>
                      Pack
                    </button>
                  )}

                  {/* DISPATCH */}
                  {o.status === "PACKED" && (
                    <button
                      onClick={() => updateStatus(o.orderId, "DISPATCHED")}
                    >
                      Dispatch
                    </button>
                  )}

                  {/* DELIVER */}
                  {o.status === "DISPATCHED" && (
                    <button
                      onClick={() => updateStatus(o.orderId, "DELIVERED")}
                    >
                      Deliver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
