"use client";

import { useEffect, useState } from "react";

export default function ReviewProducts() {

  const [products, setProducts] = useState([]);

  async function load() {
    const res = await fetch("/api/admin/products?status=review");
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    load();
  }

  return (
    <div className="wrap">

      <h1>🧾 Review Products</h1>

      {products.map(p => (
        <div key={p._id} className="card">

          <h3>{p.name}</h3>
          <p>{p.category}</p>

          <div className="actions">
            <button onClick={() => updateStatus(p._id, "approved")}>
              ✅ Approve
            </button>

            <button onClick={() => updateStatus(p._id, "rejected")}>
              ❌ Reject
            </button>
          </div>

        </div>
      ))}

      <style jsx>{`
        .wrap{padding:20px;}
        .card{border:1px solid #eee;padding:15px;margin-bottom:10px;}
        .actions{display:flex;gap:10px;}
      `}</style>

    </div>
  );
}
