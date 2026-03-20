"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/order/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrder(data.order);
      });
  }, [id]);

  if (!order) return <p className="p-4">Loading Invoice...</p>;

  /* ================= CALCULATIONS ================= */

  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const gstRate = 18; // change if needed
  const gstAmount = (subtotal * gstRate) / 100;

  const total = subtotal + gstAmount;

  return (
    <div className="p-6 bg-white text-black max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">INVOICE</h1>
          <p>Invoice #: {order.orderId}</p>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="text-right">
          <h2 className="font-bold">Your Company Name</h2>
          <p>Company Address Line</p>
          <p>GSTIN: XXXXXXXX</p>
        </div>
      </div>

      <hr className="mb-4" />

      {/* CUSTOMER */}
      <div className="mb-4">
        <h3 className="font-semibold">Bill To:</h3>
        <p>{order.customerName}</p>
        <p>{order.address}</p>
        <p>Pincode: {order.pincode}</p>
        <p>Phone: {order.phone}</p>
      </div>

      <hr className="mb-4" />

      {/* ITEMS */}
      <table className="w-full border text-sm mb-4">
        <thead>
          <tr>
            <th className="border p-2">Product</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2 text-center">{item.quantity}</td>
              <td className="border p-2 text-center">₹{item.price}</td>
              <td className="border p-2 text-center">
                ₹{item.price * item.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div className="text-right space-y-1">
        <p>Subtotal: ₹{subtotal}</p>
        <p>GST ({gstRate}%): ₹{gstAmount}</p>
        <h2 className="font-bold text-lg">Total: ₹{total}</h2>
      </div>

      {/* PRINT */}
      <div className="text-center mt-6">
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-4 py-2"
        >
          Print Invoice
        </button>
      </div>

    </div>
  );
}
