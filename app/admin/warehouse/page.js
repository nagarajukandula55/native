"use client";

import { useEffect, useState } from "react";

export default function WarehousePage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("/api/orders/list");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    };

    fetchOrders();
  }, []);

  const updateWarehouse = async (id, status) => {
    await fetch("/api/warehouse/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: id,
        status,
      }),
    });

    setOrders((prev) =>
      prev.map((o) =>
        o._id === id
          ? {
              ...o,
              warehouse: { ...o.warehouse, status },
            }
          : o
      )
    );
  };

  return (
    <div style={container}>
      <h2>Warehouse Dashboard</h2>

      <div style={grid}>
        {orders.map((o) => (
          <div key={o._id} style={card}>

            <h4>{o.orderId}</h4>

            <p>Customer: {o.address?.name}</p>
            <p>Phone: {o.address?.phone}</p>
            <p>Amount: ₹{o.amount}</p>

            <p>
              Status: <b>{o.warehouse?.status}</b>
            </p>

            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <button onClick={() => updateWarehouse(o._id, "PICKING")}>
                Pick
              </button>

              <button onClick={() => updateWarehouse(o._id, "PACKED")}>
                Pack
              </button>

              <button onClick={() => updateWarehouse(o._id, "DISPATCHED")}>
                Dispatch
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}


const container = {
  padding: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 15,
  marginTop: 20,
};

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  border: "1px solid #eee",
  boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
};
