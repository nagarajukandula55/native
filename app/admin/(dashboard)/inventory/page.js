"use client";

import { useEffect, useState } from "react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    setInventory(data.data || []);
  }

  return (
    <div>
      <h1>Inventory</h1>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Available</th>
            <th>Reserved</th>
            <th>Shipped</th>
          </tr>
        </thead>

        <tbody>
          {inventory.map((i) => (
            <tr key={i._id}>
              <td>{i.productId?.name}</td>
              <td>{i.availableQty}</td>
              <td>{i.reservedQty}</td>
              <td>{i.shippedQty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
