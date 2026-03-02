"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "60px" }}>
      <h1>Admin Dashboard</h1>
      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p._id}>
            {p.name} — ₹{p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
