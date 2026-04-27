"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [aiMap, setAiMap] = useState({});

  async function loadProducts() {
    const res = await fetch("/api/admin/products/review");
    const data = await res.json();

    if (data.success) setProducts(data.products);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function action(productKey, action) {
    await fetch("/api/admin/products/approve-reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey, action }),
    });

    loadProducts();
  }

  async function getAI(product) {
    const res = await fetch("/api/admin/products/ai-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    });

    const data = await res.json();

    setAiMap((prev) => ({
      ...prev,
      [product._id]: data.ai,
    }));
  }

  return (
    <div className="container">
      <h1>🧾 Product Review Panel</h1>

      {products.length === 0 && <p>No products for review</p>}

      <div className="grid">
        {products.map((p) => (
          <div key={p._id} className="card">

            {/* IMAGE */}
            {p.images?.[0] && <img src={p.images[0]} />}

            <h3>{p.name}</h3>

            <p><b>Category:</b> {p.category}</p>
            <p><b>HSN:</b> {p.hsn}</p>
            <p><b>GST:</b> {p.tax}%</p>

            <p><b>SKU:</b> {p.variants?.[0]?.sku}</p>
            <p><b>MRP:</b> ₹{p.variants?.[0]?.mrp}</p>
            <p><b>Selling:</b> ₹{p.variants?.[0]?.sellingPrice}</p>

            {/* AI BUTTON */}
            <button onClick={() => getAI(p)}>
              🤖 AI Summary
            </button>

            {/* AI OUTPUT */}
            {aiMap[p._id] && (
              <div className="aiBox">
                <p><b>Summary:</b> {aiMap[p._id].summary}</p>
                <p><b>Risk:</b> {aiMap[p._id].risk}</p>

                <p><b>Issues:</b></p>
                <ul>
                  {aiMap[p._id].issues.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>

                <p><b>Recommendation:</b> {aiMap[p._id].recommendation}</p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="actions">
              <button
                className="approve"
                onClick={() => action(p.productKey, "approve")}
              >
                Approve
              </button>

              <button
                className="reject"
                onClick={() => action(p.productKey, "reject")}
              >
                Reject
              </button>
            </div>

          </div>
        ))}
      </div>

      <style jsx>{`
        .container { padding: 20px; }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
          gap: 20px;
        }
        .card {
          border: 1px solid #eee;
          padding: 15px;
          border-radius: 10px;
          background: #fff;
        }
        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          margin-bottom: 10px;
        }
        .actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .approve {
          background: green;
          color: white;
          padding: 8px;
          border: none;
        }
        .reject {
          background: red;
          color: white;
          padding: 8px;
          border: none;
        }
        .aiBox {
          background: #f7f7f7;
          padding: 10px;
          margin-top: 10px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
