"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Barcode from "react-barcode";

export default function CourierLabel() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [awb, setAwb] = useState("");
  const [courierName, setCourierName] = useState("");

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/order/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
        }
      });
  }, [id]);

  /* ================= GENERATE / GET AWB ================= */
  useEffect(() => {
    if (!id) return;

    fetch("/api/admin/order/generate-awb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAwb(data.awb);
          setCourierName(data.courier);
        }
      });
  }, [id]);

  if (!order) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 bg-white text-black">
      <div className="border p-4 max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">COURIER LABEL</h2>

          <div className="text-right text-sm">
            <p><b>Courier:</b> {courierName || "-"}</p>
            <p><b>AWB:</b> {awb || "-"}</p>
          </div>
        </div>

        {/* BARCODE */}
        {awb && (
          <div className="flex justify-center mb-4">
            <Barcode value={awb} height={60} />
          </div>
        )}

        <hr className="my-3" />

        {/* FROM (Warehouse) */}
        <div className="mb-3 text-sm">
          <h3 className="font-semibold">From:</h3>
          <p>Your Warehouse Name</p>
          <p>Warehouse Address Line</p>
          <p>Phone: 9999999999</p>
        </div>

        <hr className="my-3" />

        {/* TO (Customer) */}
        <div className="mb-3 text-sm">
          <h3 className="font-semibold">To:</h3>
          <p>{order.customerName}</p>
          <p>{order.address}</p>
          <p>Pincode: {order.pincode}</p>
          <p>Phone: {order.phone}</p>
        </div>

        <hr className="my-3" />

        {/* ITEMS */}
        <h3 className="font-semibold mb-2 text-sm">Items:</h3>

        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border p-2">Product</th>
              <th className="border p-2">Qty</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">
                  {item.name || "Product"}
                </td>
                <td className="border p-2 text-center">
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-3" />

        {/* FOOTER */}
        <div className="flex justify-between text-sm">
          <p><b>Order ID:</b> {order.orderId}</p>
          <p><b>Total:</b> ₹{order.totalAmount}</p>
        </div>

        {/* PRINT */}
        <div className="text-center">
          <button
            onClick={() => window.print()}
            className="mt-4 bg-black text-white px-4 py-2"
          >
            Print Label
          </button>
        </div>

      </div>
    </div>
  );
}
