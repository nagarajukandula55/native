"use client";

import { useEffect, useState } from "react";

export default function OrderDetail({ params }) {
  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    const res = await fetch(`/api/store/orders/${params.id}`, {
      headers: {
        authorization: localStorage.getItem("storeToken"),
      },
    });

    const data = await res.json();
    setOrder(data.order);
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const updateStatus = async (status) => {
    await fetch("/api/store/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("storeToken"),
      },
      body: JSON.stringify({
        orderId: order._id,
        status,
      }),
    });

    fetchOrder();
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-xl mb-4">Order {order.orderId}</h1>

      {/* CUSTOMER */}
      <div className="bg-white p-4 mb-4 shadow">
        <p><b>{order.customerName}</b></p>
        <p>{order.phone}</p>
        <p>{order.address}</p>
      </div>

      {/* ITEMS */}
      <div className="bg-white p-4 mb-4 shadow">
        <h2 className="mb-2 font-semibold">Items</h2>

        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.name}</span>
            <span>{item.quantity} x ₹{item.price}</span>
          </div>
        ))}
      </div>

      {/* STATUS ACTIONS */}
      <div className="mb-4">
        {order.currentStatus === "Order Placed" && (
          <button onClick={() => updateStatus("Packed")}>
            Mark Packed
          </button>
        )}

        {order.currentStatus === "Packed" && (
          <button onClick={() => updateStatus("Shipped")}>
            Mark Shipped
          </button>
        )}

        {order.currentStatus === "Shipped" && (
          <button onClick={() => updateStatus("Out For Delivery")}>
            Out For Delivery
          </button>
        )}

        {order.currentStatus === "Out For Delivery" && (
          <button onClick={() => updateStatus("Delivered")}>
            Mark Delivered
          </button>
        )}
      </div>

      {/* 🔥 TIMELINE */}
      <div className="bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Timeline</h2>

        {order.statusHistory.map((s, i) => (
          <div key={i} className="border-l-2 pl-3 mb-2">
            <p className="font-medium">{s.status}</p>
            <p className="text-sm text-gray-500">
              {new Date(s.time).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
