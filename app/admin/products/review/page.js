"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [rejectionMap, setRejectionMap] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const router = useRouter();

  /* ================= LOAD ================= */
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

  /* ================= ACTIONS ================= */

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

  /* ================= FILTER ================= */

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    if (filter === "review") return p.status === "review";
    if (filter === "approved") return p.status === "approved";
    if (filter === "rejected") return p.status === "rejected";
    return true;
  });

  /* ================= STATS ================= */

  const stats = {
    total: products.length,
    review: products.filter(p => p.status === "review").length,
    approved: products.filter(p => p.status === "approved").length,
    rejected: products.filter(p => p.status === "rejected").length,
  };

  return (
    <div className="container">
      <h1>🧾 Product Review Engine</h1>

      {/* ================= DASHBOARD ================= */}
      <div className="stats">
        <div>Total: {stats.total}</div>
        <div>🟡 Review: {stats.review}</div>
        <div>🟢 Approved: {stats.approved}</div>
        <div>🔴 Rejected: {stats.rejected}</div>
      </div>

      {/* ================= FILTER ================= */}
      <div className="filters">
        {["all", "review", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "active" : ""}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ================= GRID ================= */}
      {filteredProducts.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid">
          {filteredProducts.map((p) => (
            <div key={p._id} className="card">

              {/* IMAGE */}
              <img
                src={p.images?.[0] || "/no-image.png"}
                alt={p.name}
              />

              {/* BASIC */}
              <h3>{p.name}</h3>

              <p><b>Category:</b> {p.category}</p>
              <p><b>SKU:</b> {p.primaryVariant?.sku || "-"}</p>
              <p><b>Price:</b> ₹{p.primaryVariant?.sellingPrice || 0}</p>

              {/* STATUS */}
              <span className={`status ${p.status}`}>
                {p.status}
              </span>

              {/* ================= REJECTION ================= */}
              {p.status === "review" && (
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
                    <option value="">Select reason</option>
                    <option value="Bad description">Bad description</option>
                    <option value="Incorrect pricing">Incorrect pricing</option>
                    <option value="Missing legal info">Missing legal info</option>
                    <option value="Image quality issue">Image issue</option>
                    <option value="Duplicate product">Duplicate</option>
                    <option value="Other">Other</option>
                  </select>

                  {rejectionMap[p.productKey] === "Other" && (
                    <input
                      placeholder="Custom reason"
                      onChange={(e) =>
                        setRejectionMap({
                          ...rejectionMap,
                          [p.productKey]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              )}

              {/* ================= ACTIONS ================= */}
              <div className="actions">

                {p.status === "review" && (
                  <>
                    <button
                      disabled={loadingId === p.productKey}
                      onClick={() => approve(p.productKey)}
                      className="approve"
                    >
                      {loadingId === p.productKey ? "..." : "Approve"}
                    </button>

                    <button
                      disabled={loadingId === p.productKey}
                      onClick={() => reject(p.productKey)}
                      className="reject"
                    >
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() =>
                    router.push(`/admin/products/view/${p.productKey}`)
                  }
                  className="view"
                >
                  View
                </button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: auto;
        }

        h1 {
          margin-bottom: 20px;
        }

        .stats {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          font-weight: bold;
        }

        .filters button {
          margin-right: 10px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          border-radius: 6px;
        }

        .filters .active {
          background: black;
          color: white;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .card {
          background: white;
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #eee;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 8px;
        }

        .status {
          display: inline-block;
          margin-top: 10px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
        }

        .status.review {
          background: #fff3cd;
        }

        .status.approved {
          background: #d4edda;
        }

        .status.rejected {
          background: #f8d7da;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        button {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
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

        select, input {
          width: 100%;
          margin-top: 10px;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
}
