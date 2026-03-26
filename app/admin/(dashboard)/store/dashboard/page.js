"use client";

import { useEffect, useState } from "react";

export default function StoreDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/store/orders");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, updates) => {
    try {
      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? data.order : o))
        );
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Store Order Dashboard
      </h1>

      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white shadow rounded-xl p-5 border"
          >
            {/* TOP SECTION */}
            <div className="flex justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-semibold text-lg">
                  {order.orderId}
                </h2>
                <p>{order.customerName}</p>
                <p className="text-sm text-gray-500">
                  {order.phone}
                </p>
                <p className="text-sm text-gray-500">
                  {order.address}
                </p>
              </div>

              <div>
                <p className="font-medium mb-2">
                  Status: {order.status}
                </p>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrder(order._id, {
                      status: e.target.value,
                    })
                  }
                  className="border px-3 py-1 rounded"
                >
                  <option>Order Placed</option>
                  <option>Packed</option>
                  <option>Shipped</option>
                  <option>Out For Delivery</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>

            {/* ITEMS */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">Items:</h3>
              {order.items.map((item, i) => (
                <div key={i} className="text-sm">
                  {item.name} × {item.quantity} = ₹
                  {item.price * item.quantity}
                </div>
              ))}
            </div>

            {/* PAYMENT */}
            <div className="mt-4">
              <p>
                Payment:{" "}
                <strong>{order.paymentStatus}</strong> (
                {order.paymentMethod})
              </p>
            </div>

            {/* COURIER SECTION */}
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <input
                placeholder="AWB Number"
                defaultValue={order.awbNumber}
                onBlur={(e) =>
                  updateOrder(order._id, {
                    awbNumber: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />

              <input
                placeholder="Courier Name"
                defaultValue={order.courierName}
                onBlur={(e) =>
                  updateOrder(order._id, {
                    courierName: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />

              <input
                placeholder="Tracking URL"
                defaultValue={order.trackingUrl}
                onBlur={(e) =>
                  updateOrder(order._id, {
                    trackingUrl: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
            </div>

            {/* STATUS HISTORY */}
            <div className="mt-4 text-sm text-gray-600">
              <h3 className="font-medium">Timeline:</h3>
              {order.statusHistory.map((s, i) => (
                <div key={i}>
                  {s.status} →{" "}
                  {new Date(s.time).toLocaleString()}
                </div>
              ))}
            </div>

            {/* PRINT */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Print Packing Label
              </button>

              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Print Courier Label
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
