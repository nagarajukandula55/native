"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);

  async function loadProducts() {
    const res = await fetch("/api/admin/products/review");
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleAction(id, action) {
    await fetch("/api/admin/products/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, action }),
    });

    loadProducts(); // refresh
  }

  return (
    <div className="container">

      <h1>🛠 Review Products</h1>

      <div className="grid">
        {products.map(p => (
          <div key={p._id} className="card">

            <img src={p.images?.[0]} />

            <h3>{p.name}</h3>

            <p>₹{p.sellingPrice}</p>

            <div className="actions">
              <button
                className="approve"
                onClick={() => handleAction(p._id, "approve")}
              >
                Approve
              </button>

              <button
                className="reject"
                onClick={() => handleAction(p._id, "reject")}
              >
                Reject
              </button>
            </div>

          </div>
        ))}
      </div>

      <style jsx>{`
        .container { padding: 20px; max-width: 1100px; margin: auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 20px; }
        .card { padding: 10px; border: 1px solid #eee; border-radius: 10px; background:#fff; }
        img { width:100%; height:160px; object-fit:cover; border-radius:8px; }
        .actions { display:flex; gap:10px; margin-top:10px; }
        button { flex:1; padding:8px; border:none; cursor:pointer; }
        .approve { background:green; color:#fff; }
        .reject { background:red; color:#fff; }
      `}</style>

    </div>
  );
}
