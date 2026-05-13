"use client";

import { useEffect, useState } from "react";

interface Order {
  _id: string;
  orderId: string;
  amount: number;
  status: string;
  createdAt?: string;
  address?: {
    name?: string;
    phone?: string;
  };
  payment?: {
    status?: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/orders/list");
      const data = await res.json();

      const list = data?.orders || [];

      setOrders(list);
      setFiltered(list);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const markAsPaid = async (orderId: string) => {
    const utr = prompt("Enter UTR / Reference Number");

    const res = await fetch("/api/payment/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, utr }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Marked as Paid ✅");
      fetchOrders();
    } else {
      alert(data.message || "Failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Admin Orders (AN DB)</h2>

      {/* SEARCH */}
      <input
        placeholder="Search order / phone / name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 10, marginTop: 10 }}
      />

      {/* FILTER */}
      <div style={{ marginTop: 10 }}>
        {["ALL", "PENDING_PAYMENT", "PAID", "PROCESSING", "DISPATCHED"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                marginRight: 8,
                padding: 8,
                background: status === s ? "black" : "#eee",
                color: status === s ? "white" : "black",
              }}
            >
              {s}
            </button>
          )
        )}
      </div>

      {/* LOADING */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={10} style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o._id}>
                <td>{o.orderId}</td>

                <td>
                  {o.address?.name}
                  <br />
                  {o.address?.phone}
                </td>

                <td>₹{o.amount}</td>

                <td>{o.status}</td>

                <td>{o.payment?.status}</td>

                <td>
                  {o.payment?.status !== "PAID" && (
                    <button onClick={() => markAsPaid(o.orderId)}>
                      Mark Paid
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
