"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);

  async function loadData() {
    const res = await fetch("/api/products?status=review");
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function approve(productKey) {
    await fetch("/api/admin/products/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey }),
    });

    loadData();
  }

  async function reject(productKey) {
    await fetch("/api/admin/products/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey }),
    });

    loadData();
  }

  return (
    <div className="container">

      <h1>🧑‍💼 Review Products</h1>

      <div className="grid">
        {products.map((p) => (
          <div key={p.productKey} className="card">

            <img src={p.images?.[0]} />

            <h3>{p.name}</h3>
            <p>{p.category}</p>

            <div className="variants">
              {p.variants.map((v, i) => (
                <div key={i}>
                  {v.variant} - ₹{v.sellingPrice}
                </div>
              ))}
            </div>

            <div className="actions">
              <button onClick={() => approve(p.productKey)}>
                ✅ Approve
              </button>

              <button onClick={() => reject(p.productKey)}>
                ❌ Reject
              </button>
            </div>

          </div>
        ))}
      </div>

      <style jsx>{`
        .container { padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(250px,1fr)); gap: 20px; }

        .card {
          border: 1px solid #eee;
          padding: 12px;
          border-radius: 10px;
        }

        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .variants {
          font-size: 14px;
          margin-top: 8px;
        }

        .actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }

        button {
          padding: 6px 10px;
          cursor: pointer;
        }
      `}</style>

    </div>
  );
}
