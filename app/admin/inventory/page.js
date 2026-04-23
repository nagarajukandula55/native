"use client";

import { useEffect, useState } from "react";

export default function InventoryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/inventory")
      .then(res => res.json())
      .then(data => setItems(data.items || []));
  }, []);

  async function updateStock(sku, stock) {
    await fetch("/api/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sku, stock: Number(stock) }),
    });

    alert("Stock Updated");
  }

  return (
    <div>
      <h1>Inventory</h1>

      {items.map(i => (
        <div key={i._id}>
          <p>{i.sku}</p>
          <input
            placeholder="Add Stock"
            onBlur={(e) => updateStock(i.sku, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
