"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PrintLabel() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/order/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrder(data.order);
      });
  }, [id]);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white text-black">
      <div className="border p-4 max-w-2xl mx-auto">

        <h2 className="text-xl font-bold mb-2">PACKING LABEL</h2>

        <p><b>Order ID:</b> {order.orderId}</p>
        <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>

        <hr className="my-3" />

        <p><b>Customer:</b> {order.customerName}</p>
        <p><b>Phone:</b> {order.customerPhone}</p>
        <p><b>Address:</b> {order.shippingAddress}</p>

        <hr className="my-3" />

        <h3 className="font-semibold mb-2">Items:</h3>

        <table className="w-full border">
          <thead>
            <tr className="border">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border">
                <td className="p-2 border">
                  {item.productId?.name || "Product"}
                </td>
                <td className="p-2 border text-center">
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-3" />

        <p><b>Total:</b> ₹{order.totalAmount}</p>

        <button
          onClick={() => window.print()}
          className="mt-4 bg-black text-white px-4 py-2"
        >
          Print
        </button>
      </div>
    </div>
  );
}
