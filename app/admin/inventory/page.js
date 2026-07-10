"use client";

import { useEffect, useState } from "react";
import { getInventory, updateInventory } from "@/lib/an-sdk/inventory";

export default function InventoryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getInventory()
      .then(data => setItems(data.items || []))
      .catch(err => console.log(err));
  }, []);

  async function updateStock(sku, stock) {
    try {
      await updateInventory({ sku, stock: Number(stock) });
      alert("Stock Updated");
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
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
