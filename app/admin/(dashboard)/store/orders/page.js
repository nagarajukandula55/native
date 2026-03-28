"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/store/orders", {
      headers: {
        authorization: localStorage.getItem("storeToken"),
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-4">Orders</h1>

      <div className="bg-white shadow rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-2">{o.orderId}</td>
                <td>{o.customerName}</td>
                <td>₹{o.totalAmount}</td>
                <td>{o.currentStatus}</td>
                <td>
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <Link
                    href={`/store/orders/${o._id}`}
                    className="text-blue-600"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
