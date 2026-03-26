"use client";

import { useEffect, useState } from "react";

export default function StoreDashboard() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await fetch("/api/store/orders");
    const data = await res.json();
    setOrders(data);
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/store/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const updated = await res.json();

    setOrders((prev) =>
      prev.map((o) => (o._id === id ? updated : o))
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Store Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="p-4 border rounded-xl shadow bg-white"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="font-semibold">{order.orderId}</h2>
                <p>{order.customerName}</p>
                <p className="text-sm text-gray-500">
                  {order.address}
                </p>
              </div>

              <div>
                <p className="font-medium">{order.status}</p>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                  className="mt-2 border px-2 py-1 rounded"
                >
                  <option>Placed</option>
                  <option>Packed</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-4 text-sm text-gray-600">
              <strong>Timeline:</strong>
              {order.timeline.map((t, i) => (
                <div key={i}>
                  {t.status} → {new Date(t.time).toLocaleString()}
                </div>
              ))}
            </div>

            {/* Print Buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Print Label
              </button>

              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Courier Label
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
