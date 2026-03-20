"use client";

import { useEffect, useState } from "react";

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/store/orders", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch("/api/store/orders/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ orderId: id, status }),
      });

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === id ? { ...o, status } : o
          )
        );
      }
    } catch (err) {
      console.error("UPDATE ERROR:", err);
    }
  };

  /* ================= PAYMENT ================= */
  const handlePayment = async (order) => {
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: order.totalAmount }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Payment init failed");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: data.order.amount,
        currency: "INR",
        name: "Native Store",
        description: `Order ${order.orderId}`,
        order_id: data.order.id,

        handler: function () {
          alert("✅ Payment Successful");
          fetchOrders(); // refresh
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
    }
  };

  /* ================= COLORS ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "Packed":
        return "bg-yellow-200 text-yellow-800";
      case "Shipped":
        return "bg-blue-200 text-blue-800";
      case "Out For Delivery":
        return "bg-purple-200 text-purple-800";
      case "Delivered":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200";
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-200 text-green-800";
      case "Failed":
        return "bg-red-200 text-red-800";
      default:
        return "bg-yellow-200 text-yellow-800";
    }
  };

  if (loading) return <p className="p-4">Loading Orders...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Store Orders</h1>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Update</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Method</th>
              <th className="p-2 border">Print</th>
              <th className="p-2 border">Courier</th>
              <th className="p-2 border">Invoice</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="11" className="p-4 text-center">
                  No Orders Found
                </td>
              </tr>
            )}

            {orders.map((order) => (
              <tr key={order._id} className="text-center border-t">

                <td className="p-2 border">{order.orderId}</td>

                <td className="p-2 border">{order.customerName}</td>

                <td className="p-2 border">₹{order.totalAmount}</td>

                {/* ORDER STATUS */}
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>

                {/* UPDATE */}
                <td className="p-2 border">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order._id, e.target.value)
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option>Packed</option>
                    <option>Shipped</option>
                    <option>Out For Delivery</option>
                    <option>Delivered</option>
                  </select>
                </td>

                {/* PAYMENT STATUS */}
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>

                {/* PAYMENT METHOD */}
                <td className="p-2 border">
                  {order.paymentMethod || "-"}
                </td>

                {/* PRINT */}
                <td className="p-2 border">
                  <a
                    href={`/admin/(dashboard)/orders/print/${order._id}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Print
                  </a>
                </td>

                {/* COURIER */}
                <td className="p-2 border">
                  <a
                    href={`/admin/(dashboard)/orders/courier/${order._id}`}
                    target="_blank"
                    className="text-green-600 underline"
                  >
                    Courier
                  </a>
                </td>

                {/* INVOICE */}
                <td className="p-2 border">
                  <a
                    href={`/admin/(dashboard)/invoice/${order._id}`}
                    target="_blank"
                    className="text-purple-600 underline"
                  >
                    Invoice
                  </a>
                </td>

                {/* PAYMENT BUTTON */}
                <td className="p-2 border">
                  {order.paymentStatus !== "Paid" ? (
                    <button
                      onClick={() => handlePayment(order)}
                      className="bg-black text-white px-2 py-1 rounded text-xs"
                    >
                      Pay
                    </button>
                  ) : (
                    <span className="text-green-600 font-semibold text-xs">
                      Paid
                    </span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
