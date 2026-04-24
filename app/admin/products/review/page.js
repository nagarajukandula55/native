"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {

  const [products, setProducts] = useState([]);

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

  async function approve(productKey) {
    await fetch("/api/admin/products/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey }),
    });

    loadProducts();
  }

  async function reject(productKey) {
    await fetch("/api/admin/products/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey }),
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

            {/* IMAGE */}
            {p.images?.[0] && (
              <img src={p.images[0]} />
            )}

            <h3>{p.name}</h3>

            <p><b>Category:</b> {p.category}</p>
            <p><b>GST:</b> {p.gstCategory}</p>
            <p><b>HSN:</b> {p.hsn}</p>
            <p><b>Tax:</b> {p.tax}%</p>

            <p><b>Variant:</b> {p.variant}</p>
            <p><b>SKU:</b> {p.sku}</p>

            <p><b>MRP:</b> ₹{p.mrp}</p>
            <p><b>Selling:</b> ₹{p.sellingPrice}</p>

            <p><b>Description:</b> {p.description}</p>
            <p><b>Ingredients:</b> {p.ingredients}</p>
            <p><b>Shelf Life:</b> {p.shelfLife}</p>

            {/* ACTIONS */}
            <div className="actions">
              <button onClick={() => approve(p.productKey)} className="approve">
                Approve
              </button>

              <button onClick={() => reject(p.productKey)} className="reject">
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
          margin-top: 10px;
          display: flex;
          gap: 10px;
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
