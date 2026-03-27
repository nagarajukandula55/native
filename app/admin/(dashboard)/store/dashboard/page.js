"use client";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function StoreDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= PROTECT PAGE ================= */
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "store")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/store/orders", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error(data.msg);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ORDER ================= */
  const updateOrder = async (id, updates) => {
    setUpdatingId(id);

    try {
      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? data.order : o))
        );
      } else {
        console.error(data.msg);
      }
    } catch (err) {
      console.error("Update error:", err);
    }

    setUpdatingId(null);
  };

  /* ================= PRINT ================= */
  const printLabel = (order, type = "packing") => {
    const content = `
      <div style="font-family: Arial; padding: 20px">
        <h2>${type === "packing" ? "Packing Slip" : "Courier Label"}</h2>
        <h3>Order: ${order.orderId}</h3>

        <p><b>Name:</b> ${order.customerName}</p>
        <p><b>Phone:</b> ${order.phone}</p>
        <p><b>Address:</b> ${order.address}</p>

        ${
          type === "courier"
            ? `
          <hr/>
          <p><b>Courier:</b> ${order.courierName || "-"}</p>
          <p><b>AWB:</b> ${order.awbNumber || "-"}</p>
          `
            : ""
        }

        <hr/>
        ${order.items
          .map(
            (i) =>
              `<p>${i.name} × ${i.quantity} = ₹${i.price * i.quantity}</p>`
          )
          .join("")}
      </div>
    `;

    const win = window.open("", "", "width=800,height=600");
    win.document.write(content);
    win.document.close();
    win.print();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= UI ================= */

  if (authLoading || loading) {
    return (
      <div className="p-6 text-gray-500">Loading orders...</div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No orders assigned yet 🚀
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Store Dashboard
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white border shadow-sm rounded-xl p-5"
          >
            {/* HEADER */}
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

              {/* STATUS */}
              <div>
                <p className="mb-2 text-sm text-gray-600">
                  Status
                </p>

                <select
                  value={order.status}
                  disabled={updatingId === order._id}
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

                {updatingId === order._id && (
                  <p className="text-xs text-blue-500 mt-1">
                    Updating...
                  </p>
                )}
              </div>
            </div>

            {/* ITEMS */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">Items</h3>
              {order.items.map((item, i) => (
                <div key={i} className="text-sm">
                  {item.name} × {item.quantity} = ₹
                  {item.price * item.quantity}
                </div>
              ))}
            </div>

            {/* PAYMENT */}
            <div className="mt-4 text-sm">
              Payment:{" "}
              <span className="font-medium">
                {order.paymentStatus}
              </span>{" "}
              ({order.paymentMethod})
            </div>

            {/* COURIER */}
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

            {/* TIMELINE */}
            <div className="mt-4 text-sm text-gray-600">
              <h3 className="font-medium">Timeline</h3>
              {order.statusHistory.map((s, i) => (
                <div key={i}>
                  {s.status} →{" "}
                  {new Date(s.time).toLocaleString()}
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => printLabel(order, "packing")}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Print Packing
              </button>

              <button
                onClick={() => printLabel(order, "courier")}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Print Courier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
