"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  async function fetchProducts() {
    setLoading(true);

    const res = await fetch("/api/admin/products/review");
    const data = await res.json();

    if (data.success) {
      setProducts(data.products);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= GROUP VARIANTS ================= */
  const grouped = Object.values(
    products.reduce((acc, p) => {
      if (!acc[p.productKey]) {
        acc[p.productKey] = {
          ...p,
          variants: [],
        };
      }

      acc[p.productKey].variants.push({
        id: p._id,
        variant: p.variant,
        sku: p.sku,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
      });

      return acc;
    }, {})
  );

  /* ================= ACTION ================= */
  async function handleAction(productKey, action) {
    await fetch("/api/admin/products/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productKey, action }),
    });

    fetchProducts();
  }

  /* ================= UI ================= */

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div className="container">
      <h1>🧾 Product Review Panel</h1>

      {grouped.length === 0 && <p>No products pending review</p>}

      <div className="grid">
        {grouped.map((p) => (
          <div key={p.productKey} className="card">

            {/* IMAGE */}
            <img src={p.images?.[0]} className="image" />

            {/* BASIC */}
            <h2>{p.name}</h2>
            <p><b>Category:</b> {p.category}</p>
            <p><b>HSN:</b> {p.hsn}</p>
            <p><b>Tax:</b> {p.tax}%</p>

            {/* DESCRIPTION */}
            <p><b>Description:</b> {p.description || "-"}</p>
            <p><b>Short:</b> {p.shortDescription || "-"}</p>
            <p><b>Ingredients:</b> {p.ingredients || "-"}</p>
            <p><b>Shelf Life:</b> {p.shelfLife || "-"}</p>

            {/* VARIANTS */}
            <div className="variants">
              <h3>Variants</h3>

              {p.variants.map((v, i) => (
                <div key={i} className="variantRow">
                  <span>{v.variant}</span>
                  <span>₹{v.sellingPrice}</span>
                  <span className="mrp">₹{v.mrp}</span>
                  <span className="sku">{v.sku}</span>
                </div>
              ))}
            </div>

            {/* ACTION */}
            <div className="actions">
              <button
                className="approve"
                onClick={() => handleAction(p.productKey, "approve")}
              >
                ✅ Approve
              </button>

              <button
                className="reject"
                onClick={() => handleAction(p.productKey, "reject")}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* STYLE */}
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .card {
          border: 1px solid #eee;
          padding: 15px;
          border-radius: 10px;
          background: #fff;
        }

        .image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
        }

        .variants {
          margin-top: 10px;
        }

        .variantRow {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 5px;
          border-bottom: 1px dashed #eee;
          padding-bottom: 5px;
        }

        .mrp {
          text-decoration: line-through;
          color: #999;
        }

        .sku {
          font-size: 11px;
          color: #666;
        }

        .actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }

        .approve {
          background: green;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 5px;
          cursor: pointer;
        }

        .reject {
          background: red;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
