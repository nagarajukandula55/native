"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [rejectionMap, setRejectionMap] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const router = useRouter();

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products/review");
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= APPROVE ================= */

  async function approve(productKey) {
    if (!confirm("Approve this product?")) return;

    setLoadingId(productKey);

    try {
      await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productKey,
          action: "approve",
        }),
      });

      loadProducts();
    } catch (err) {
      console.error(err);
    }

    setLoadingId(null);
  }

  /* ================= REJECT ================= */

  async function reject(productKey) {
    const reason = rejectionMap[productKey];

    if (!reason) {
      alert("Please select rejection reason");
      return;
    }

    if (!confirm("Reject this product?")) return;

    setLoadingId(productKey);

    try {
      await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productKey,
          action: "reject",
          reason,
        }),
      });

      loadProducts();
    } catch (err) {
      console.error(err);
    }

    setLoadingId(null);
  }

  return (
    <div className="container">
      <h1>🧾 Product Review Panel</h1>

      {products.length === 0 && <p>No products for review</p>}

      <div className="grid">
        {products.map((p) => (
          <div key={p._id} className="card">

            {/* IMAGE */}
            <img
              src={p.images?.[0] || "/no-image.png"}
              alt={p.name}
            />

            {/* BASIC INFO */}
            <h3>{p.name}</h3>

            <p><b>Category:</b> {p.category}</p>
            <p><b>SKU:</b> {p.primaryVariant?.sku}</p>
            <p><b>Price:</b> ₹{p.primaryVariant?.sellingPrice}</p>

            {/* STATUS */}
            <p>
              <b>Status:</b>{" "}
              <span
                style={{
                  color:
                    p.status === "approved"
                      ? "green"
                      : p.status === "rejected"
                      ? "red"
                      : "orange",
                  fontWeight: "bold"
                }}
              >
                {p.status}
              </span>
            </p>

            {/* ================= REJECTION ================= */}
            <div className="reasons">
              <select
                value={rejectionMap[p.productKey] || ""}
                onChange={(e) =>
                  setRejectionMap({
                    ...rejectionMap,
                    [p.productKey]: e.target.value,
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

              {/* CUSTOM REASON */}
              {rejectionMap[p.productKey] === "Other" && (
                <input
                  placeholder="Enter custom reason"
                  onChange={(e) =>
                    setRejectionMap({
                      ...rejectionMap,
                      [p.productKey]: e.target.value,
                    })
                  }
                />
              )}
            </div>

            {/* ================= ACTIONS ================= */}
            <div className="actions">

              <button
                disabled={loadingId === p.productKey}
                onClick={() => approve(p.productKey)}
                className="approve"
              >
                {loadingId === p.productKey ? "..." : "✅ Approve"}
              </button>

              <button
                disabled={loadingId === p.productKey}
                onClick={() => reject(p.productKey)}
                className="reject"
              >
                ❌ Reject
              </button>

              {/* OPTIONAL VIEW BUTTON */}
              <button
                onClick={() =>
                  router.push(`/admin/products/view/${p.productKey}`)
                }
                className="view"
              >
                👁 View
              </button>

            </div>

          </div>
        ))}
      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .container {
          padding: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .card {
          border: 1px solid #eee;
          padding: 15px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        select,
        input {
          width: 100%;
          margin-top: 10px;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        button {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .approve {
          background: green;
          color: white;
        }

        .reject {
          background: red;
          color: white;
        }

        .view {
          background: black;
          color: white;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
