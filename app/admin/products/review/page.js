"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [rejectionMap, setRejectionMap] = useState({});

  async function loadProducts() {
    const res = await fetch("/api/admin/products/review");
    const data = await res.json();

    if (data.success) {
      setProducts(data.products);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= APPROVE ================= */

  async function approve(productId) {
    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        action: "approve",
      }),
    });

    loadProducts();
  }

  /* ================= REJECT ================= */

  async function reject(productId) {
    const reason = rejectionMap[productId];

    if (!reason) {
      alert("Please select rejection reason");
      return;
    }

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        action: "reject",
        reason,
      }),
    });

    loadProducts();
  }

  return (
    <div className="container">
      <h1>🧾 Product Review Panel</h1>

      {products.length === 0 && <p>No products for review</p>}

      <div className="grid">
        {products.map((p) => (
          <div key={p._id} className="card">

            {p.images?.[0] && <img src={p.images[0]} />}

            <h3>{p.name}</h3>

            <p><b>Category:</b> {p.category}</p>
            <p><b>SKU:</b> {p.primaryVariant?.sku}</p>
            <p><b>Price:</b> ₹{p.primaryVariant?.sellingPrice}</p>

            {/* ================= REJECTION REASONS ================= */}
            <div className="reasons">
              <select
                onChange={(e) =>
                  setRejectionMap({
                    ...rejectionMap,
                    [p._id]: e.target.value,
                  })
                }
              >
                <option value="">Select rejection reason</option>
                <option value="Bad description">Bad description</option>
                <option value="Incorrect pricing">Incorrect pricing</option>
                <option value="Missing legal info">Missing legal info</option>
                <option value="Image quality issue">Image quality issue</option>
                <option value="Duplicate product">Duplicate product</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* ================= ACTIONS ================= */}
            <div className="actions">
              <button onClick={() => approve(p._id)} className="approve">
                ✅ Approve
              </button>

              <button onClick={() => reject(p._id)} className="reject">
                ❌ Reject
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
        }

        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        select {
          width: 100%;
          margin-top: 10px;
          padding: 6px;
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
      `}</style>
    </div>
  );
}
