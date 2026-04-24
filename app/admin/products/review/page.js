"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const res = await fetch("/api/admin/products/review");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function approve(productKey) {
    await fetch("/api/admin/products/approve", {
      method: "POST",
      body: JSON.stringify({ productKey }),
    });

    loadData();
  }

  async function reject(productKey) {
    await fetch("/api/admin/products/reject", {
      method: "POST",
      body: JSON.stringify({ productKey }),
    });

    loadData();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">

      <h1>🧾 Product Review Panel</h1>

      {products.map((p, index) => (
        <div key={index} className="card">

          {/* IMAGE */}
          <img src={p.images?.[0]} className="mainImg" />

          {/* BASIC */}
          <h2>{p.name}</h2>
          <p><b>Category:</b> {p.category}</p>
          <p><b>Slug:</b> {p.slug}</p>

          {/* GST */}
          <p><b>HSN:</b> {p.hsn}</p>
          <p><b>Tax:</b> {p.tax}%</p>
          <p><b>GST Desc:</b> {p.gstDescription}</p>

          {/* TEXT DETAILS */}
          <p><b>Description:</b> {p.description}</p>
          <p><b>Short Desc:</b> {p.shortDescription}</p>
          <p><b>Ingredients:</b> {p.ingredients}</p>
          <p><b>Shelf Life:</b> {p.shelfLife}</p>

          {/* SEO */}
          <p><b>SEO Title:</b> {p.seo?.title}</p>
          <p><b>SEO Desc:</b> {p.seo?.description}</p>

          {/* VARIANTS */}
          <h3>Variants</h3>

          <table>
            <thead>
              <tr>
                <th>Variant</th>
                <th>SKU</th>
                <th>MRP</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{p.variant}</td>
                <td>{p.sku}</td>
                <td>{p.mrp}</td>
                <td>{p.sellingPrice}</td>
              </tr>
            </tbody>
          </table>

          {/* ACTIONS */}
          <div className="actions">
            <button onClick={() => approve(p.productKey)}>✅ Approve</button>
            <button onClick={() => reject(p.productKey)}>❌ Reject</button>
          </div>

        </div>
      ))}

      <style jsx>{`
        .container { padding: 20px; max-width: 1100px; margin:auto; }
        .card { border:1px solid #eee; padding:15px; margin-bottom:20px; border-radius:10px; }
        .mainImg { width:150px; height:150px; object-fit:cover; }
        table { width:100%; margin-top:10px; border-collapse:collapse; }
        td,th { border:1px solid #ddd; padding:8px; }
        .actions { margin-top:10px; display:flex; gap:10px; }
      `}</style>

    </div>
  );
}
