"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [rejectionMap, setRejectionMap] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [selected, setSelected] = useState(null);

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

  /* ================= FLAGS ================= */

  function getFlags(p) {
    const flags = [];

    const price = p.primaryVariant?.sellingPrice || 0;
    const cost =
      Number(p.baseCost || 0) +
      Number(p.packagingCost || 0) +
      Number(p.logisticsCost || 0) +
      Number(p.marketingCost || 0);

    if (price < cost) flags.push("LOSS");
    if (!p.fssaiNumber) flags.push("NO FSSAI");
    if (!p.images?.length) flags.push("NO IMAGE");
    if (!p.nutrition?.energy) flags.push("NO NUTRITION");

    return flags;
  }

  function getRiskScore(p) {
    let score = 100;

    if (!p.fssaiNumber) score -= 30;
    if (!p.images?.length) score -= 20;
    if (!p.nutrition?.energy) score -= 20;

    const price = p.primaryVariant?.sellingPrice || 0;
    const cost =
      Number(p.baseCost || 0) +
      Number(p.packagingCost || 0) +
      Number(p.logisticsCost || 0) +
      Number(p.marketingCost || 0);

    if (price < cost) score -= 40;

    return score;
  }

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

  return (
    <div className="container">
      <h1>🧾 Product Review Panel</h1>

      {products.length === 0 && <p>No products for review</p>}

      <div className="grid">
        {products.map((p) => {
          const flags = getFlags(p);
          const score = getRiskScore(p);

          return (
            <div key={p._id} className="card">

              {/* IMAGE */}
              <img src={p.images?.[0] || "/no-image.png"} />

              {/* NAME */}
              <h3>{p.name}</h3>

              {/* FLAGS */}
              <div className="flags">
                {flags.map((f, i) => (
                  <span key={i} className={`flag ${f.toLowerCase()}`}>
                    {f}
                  </span>
                ))}
              </div>

              {/* BASIC INFO */}
              <p><b>Category:</b> {p.category}</p>
              <p><b>SKU:</b> {p.primaryVariant?.sku}</p>
              <p><b>Price:</b> ₹{p.primaryVariant?.sellingPrice}</p>

              {/* RISK */}
              <p>
                <b>Risk:</b>{" "}
                <span
                  style={{
                    color:
                      score > 80
                        ? "green"
                        : score > 50
                        ? "orange"
                        : "red",
                  }}
                >
                  {score}/100
                </span>
              </p>

              {/* REJECTION */}
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
                <option value="Image issue">Image issue</option>
                <option value="Duplicate">Duplicate</option>
                <option value="Other">Other</option>
              </select>

              {rejectionMap[p.productKey] === "Other" && (
                <input
                  placeholder="Enter reason"
                  onChange={(e) =>
                    setRejectionMap({
                      ...rejectionMap,
                      [p.productKey]: e.target.value,
                    })
                  }
                />
              )}

              {/* ACTIONS */}
              <div className="actions">

                <button
                  disabled={loadingId === p.productKey || score < 50}
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

                <button onClick={() => setSelected(p)} className="view">
                  View
                </button>

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="modal">
          <div className="modalContent">

            <h2>{selected.name}</h2>

            <p>{selected.description}</p>

            <p>
              <b>Ingredients:</b>{" "}
              {selected.ingredients?.map(i => i.name).join(", ")}
            </p>

            <p>
              <b>FSSAI:</b>{" "}
              {selected.fssaiNumber || "Missing"}
            </p>

            <div className="gallery">
              {(selected.images || []).map((img, i) => (
                <img key={i} src={img} />
              ))}
            </div>

            <button onClick={() => setSelected(null)}>Close</button>

          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          padding: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 15px;
        }

        img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 8px;
        }

        .flags {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin: 5px 0;
        }

        .flag {
          font-size: 10px;
          padding: 3px 6px;
          border-radius: 5px;
          font-weight: bold;
        }

        .flag.loss { background: #ffd6d6; color: red; }
        .flag.no { background: #eee; }

        .actions {
          display: flex;
          gap: 5px;
          margin-top: 10px;
        }

        button {
          flex: 1;
          padding: 6px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .approve { background: green; color: #fff; }
        .reject { background: red; color: #fff; }
        .view { background: black; color: #fff; }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modalContent {
          background: white;
          padding: 20px;
          border-radius: 10px;
          max-width: 600px;
          width: 100%;
        }

        .gallery {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .gallery img {
          width: 80px;
          height: 80px;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
