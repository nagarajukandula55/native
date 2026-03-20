"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/order/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrder(data.order);
      });
  }, [id]);

  if (!order) return <p className="p-4">Loading Invoice...</p>;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gst = subtotal * 0.05; // 5% example
  const total = subtotal + gst;

  return (
    <div className="p-6 bg-white text-black">
      <div className="max-w-3xl mx-auto border p-6">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Order ID: {order.orderId}</p>
          </div>

          <div className="text-right">
            <h2 className="font-bold text-lg">Native Store</h2>
            <p>Healthy Natural Products</p>
            <p>India</p>
          </div>
        </div>

        <hr className="my-4" />

        {/* CUSTOMER */}
        <div className="mb-4">
          <h3 className="font-semibold">Bill To:</h3>
          <p>{order.customerName}</p>
          <p>{order.address}</p>
          <p>Pincode: {order.pincode}</p>
          <p>Phone: {order.phone}</p>
        </div>

        <hr className="my-4" />

        {/* ITEMS */}
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Item</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">₹{item.price}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2">
                  ₹{item.price * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-4" />

        {/* TOTALS */}
        <div className="text-right space-y-1">
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>GST (5%): ₹{gst.toFixed(2)}</p>
          <h2 className="text-lg font-bold">Total: ₹{total.toFixed(2)}</h2>
        </div>

        <hr className="my-4" />

        {/* FOOTER */}
        <div className="text-center text-sm">
          <p>Thank you for shopping with us ❤️</p>
        </div>

        {/* PRINT */}
        <div className="text-center mt-4">
          <button
            onClick={() => window.print()}
            className="bg-black text-white px-4 py-2"
          >
            Print Invoice
          </button>
        </div>

      </div>
    </div>
  );
}
