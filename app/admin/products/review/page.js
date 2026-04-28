"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState({});
  const [aiScores, setAiScores] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  /* ================= LOAD ================= */

  async function loadProducts() {
    const res = await fetch("/api/admin/products/review");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= ACTION ================= */

  async function action(productKey, type, extra = {}) {
    setLoadingId(productKey);

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: productKey,
        action: type,
        ...extra,
      }),
    });

    loadProducts();
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

  /* ================= AI ANALYSIS ================= */

  async function runAI(p) {
    setAiScores((prev) => ({
      ...prev,
      [p.productKey]: { loading: true },
    }));

    const res = await fetch("/api/ai/moderate-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: p.name,
        price: p.primaryVariant?.sellingPrice,
        category: p.category,
        description: p.description,
      }),
    });

    const data = await res.json();

    setAiScores((prev) => ({
      ...prev,
      [p.productKey]: data,
    }));
  }

  /* ================= UI ================= */

  return (
    <div className="wrap">
      <h1>🧾 AI Product Moderation Panel</h1>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Status</th>
              <th>AI Score</th>
              <th>AI Decision</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const edit = editing[p.productKey];
              const ai = aiScores[p.productKey];

              return (
                <tr key={p._id}>

                  {/* PRODUCT */}
                  <td>
                    {edit ? (
                      <input
                        value={edit.name}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [p.productKey]: {
                              ...edit,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      <>
                        <b>{p.name}</b>
                        <br />
                        <small>{p.category}</small>
                      </>
                    )}
                  </td>

                  {/* SKU */}
                  <td>{p.primaryVariant?.sku}</td>

                  {/* PRICE */}
                  <td>
                    {edit ? (
                      <input
                        type="number"
                        value={edit.price}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [p.productKey]: {
                              ...edit,
                              price: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      `₹${p.primaryVariant?.sellingPrice}`
                    )}
                  </td>

                  {/* STATUS */}
                  <td className={`status ${p.status}`}>
                    {p.status}
                  </td>

                  {/* AI SCORE */}
                  <td>
                    {ai?.loading
                      ? "..."
                      : ai?.score
                      ? `${ai.score}/100`
                      : "-"}
                  </td>

                  {/* AI DECISION */}
                  <td>
                    {ai?.decision || "-"}
                  </td>

                  {/* ACTIONS */}
                  <td className="actions">

                    {/* EDIT */}
                    {edit ? (
                      <>
                        <button onClick={() => saveEdit(p.productKey)}>
                          💾
                        </button>
                        <button onClick={() => setEditing({})}>
                          ❌
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(p)}>✏</button>
                    )}

                    {/* AI */}
                    <button onClick={() => runAI(p)}>🤖</button>

                    {/* APPROVE / REJECT */}
                    {p.status === "review" && (
                      <>
                        <button
                          className="approve"
                          onClick={() => action(p.productKey, "approve")}
                        >
                          ✅
                        </button>

                        <button
                          className="reject"
                          onClick={() => {
                            const reason = prompt("Reason?");
                            if (!reason) return;
                            action(p.productKey, "reject", { reason });
                          }}
                        >
                          ❌
                        </button>
                      </>
                    )}

                    {/* LIST */}
                    {p.status === "approved" && !p.isListed && (
                      <button onClick={() => action(p.productKey, "list")}>
                        📤
                      </button>
                    )}

                    {/* DELIST */}
                    {p.isListed && (
                      <button onClick={() => action(p.productKey, "delist")}>
                        📥
                      </button>
                    )}

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= STYLES ================= */}

      <style jsx>{`
        .wrap {
          padding: 20px;
          max-width: 1300px;
          margin: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
        }

        th, td {
          padding: 10px;
          border-bottom: 1px solid #eee;
          text-align: left;
        }

        th {
          background: #fafafa;
        }

        input {
          width: 100%;
          padding: 5px;
        }

        .actions button {
          margin: 2px;
          padding: 5px 8px;
          border: none;
          border-radius: 4px;
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
      `}</style>
    </div>
  );
}
