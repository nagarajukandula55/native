"use client";

import { useEffect, useState } from "react";

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/store/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch("/api/store/orders/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: id, status }),
      });

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === id ? { ...o, currentStatus: status } : o
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4">Loading Orders...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Store Orders</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Order ID</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Update</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-t text-center">
              <td className="p-2">{order.orderId}</td>
              <td className="p-2">{order.customerName}</td>
              <td className="p-2">₹{order.totalAmount}</td>
              <td className="p-2">{order.currentStatus}</td>

              <td className="p-2">
                <select
                  value={order.currentStatus}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                  className="border px-2 py-1"
                >
                  <option>Packed</option>
                  <option>Shipped</option>
                  <option>Out For Delivery</option>
                  <option>Delivered</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
