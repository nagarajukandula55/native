"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState({});
  const [logs, setLogs] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  async function loadProducts() {
    const res = await fetch("/api/admin/products/review");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= ACTION ================= */

  async function action(productId, type, extra = {}) {
    setLoadingId(productId);

    try {
      await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          action: type,
          ...extra,
        }),
      });

      // ✅ refresh + optimistic feel
      setProducts((prev) =>
        prev.map((p) =>
          p.productKey === productId
            ? {
                ...p,
                status:
                  type === "approve"
                    ? "approved"
                    : type === "reject"
                    ? "rejected"
                    : p.status,
              }
            : p
        )
      );

      loadProducts();

    } catch (err) {
      console.error(err);
    }

    setLoadingId(null);
  }

  /* ================= INLINE EDIT ================= */

  function startEdit(p) {
    setEditing({
      ...editing,
      [p.productKey]: {
        name: p.name,
        price: p.primaryVariant?.sellingPrice,
      },
    });
  }

  async function saveEdit(productKey) {
    const edit = editing[productKey];

    await fetch("/api/admin/products/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: productKey,
        updates: {
          name: edit.name,
          "primaryVariant.sellingPrice": Number(edit.price),
        },
      }),
    });

    setEditing((prev) => {
      const copy = { ...prev };
      delete copy[productKey];
      return copy;
    });

    loadProducts();
  }

  /* ================= UI ================= */

  return (
    <div className="wrap">
      <h1>🧾 Product Moderation Panel</h1>

      <div className="grid">
        {products.map((p) => {
          const isEditing = editing[p.productKey];

          return (
            <div key={p._id} className="card">

              {/* IMAGE */}
              <img src={p.images?.[0] || "/no-image.png"} />

              {/* NAME */}
              {isEditing ? (
                <input
                  value={isEditing.name}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      [p.productKey]: {
                        ...isEditing,
                        name: e.target.value,
                      },
                    })
                  }
                />
              ) : (
                <h3>{p.name}</h3>
              )}

              {/* PRICE */}
              {isEditing ? (
                <input
                  type="number"
                  value={isEditing.price}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      [p.productKey]: {
                        ...isEditing,
                        price: e.target.value,
                      },
                    })
                  }
                />
              ) : (
                <p>₹ {p.primaryVariant?.sellingPrice}</p>
              )}

              <p><b>SKU:</b> {p.primaryVariant?.sku}</p>

              <p>
                <b>Status:</b>{" "}
                <span className={`status ${p.status}`}>
                  {p.status}
                </span>
              </p>

              {/* ================= ACTIONS ================= */}

              <div className="actions">

                {isEditing ? (
                  <>
                    <button onClick={() => saveEdit(p.productKey)}>
                      💾 Save
                    </button>
                    <button onClick={() => setEditing({})}>
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => startEdit(p)}>
                    ✏ Edit
                  </button>
                )}

                {p.status === "review" && (
                  <>
                    <button
                      className="approve"
                      onClick={() => action(p.productKey, "approve")}
                    >
                      ✅ Approve
                    </button>

                    <button
                      className="reject"
                      onClick={() => {
                        const reason = prompt("Enter rejection reason");
                        if (!reason) return;
                        action(p.productKey, "reject", { reason });
                      }}
                    >
                      ❌ Reject
                    </button>
                  </>
                )}

                {p.status === "approved" && !p.isListed && (
                  <button onClick={() => action(p.productKey, "list")}>
                    📤 List
                  </button>
                )}

                {p.isListed && (
                  <button onClick={() => action(p.productKey, "delist")}>
                    📥 Delist
                  </button>
                )}

              </div>

              {/* ================= ACTIVITY LOG ================= */}

              <div className="log">
                <h4>📜 Activity</h4>
                {(p.activity || []).slice(0, 3).map((l, i) => (
                  <p key={i}>
                    {l.action} • {new Date(l.time).toLocaleString()}
                  </p>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* ================= STYLES ================= */}

      <style jsx>{`
        .wrap {
          padding: 20px;
          max-width: 1300px;
          margin: auto;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .card {
          background: #fff;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }

        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 10px;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        button {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
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

        .status.review {
          color: orange;
        }

        .status.approved {
          color: green;
        }

        .status.rejected {
          color: red;
        }

        .log {
          margin-top: 10px;
          font-size: 12px;
          color: #555;
        }

        input {
          width: 100%;
          padding: 6px;
          margin-top: 5px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
}
