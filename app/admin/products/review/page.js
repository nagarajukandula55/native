"use client";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState({});
  const [aiScores, setAiScores] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  /* ================= LOAD ================= */

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products/review");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= ACTION ================= */

  async function action(productKey, type, extra = {}) {
    setLoadingId(productKey);

    try {
      await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productKey,
          action: type,
          ...extra,
        }),
      });

      await loadProducts();
    } catch (err) {
      console.error("Action error:", err);
    }

    setLoadingId(null);
  }

  /* ================= INLINE EDIT ================= */

  function startEdit(p) {
    setEditing((prev) => ({
      ...prev,
      [p.productKey]: {
        name: p.name || "",
        price: p.primaryVariant?.sellingPrice || "",
      },
    }));
  }

  function cancelEdit(productKey) {
    setEditing((prev) => {
      const copy = { ...prev };
      delete copy[productKey];
      return copy;
    });
  }

  async function saveEdit(productKey) {
    const edit = editing[productKey];

    try {
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

      cancelEdit(productKey);
      await loadProducts();
    } catch (err) {
      console.error("Edit error:", err);
    }
  }

  /* ================= AI ================= */

  async function runAI(p) {
    setAiScores((prev) => ({
      ...prev,
      [p.productKey]: { loading: true },
    }));

    try {
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

      /* ================= AUTO DECISION ================= */

      if (data.decision === "APPROVE" && data.score > 85) {
        await action(p.productKey, "approve");
      }

      if (data.decision === "REJECT" && data.score < 40) {
        await action(p.productKey, "reject", {
          reason: (data.issues || []).join(", "),
        });
      }

    } catch (err) {
      console.error("AI error:", err);
    }
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
              <th>AI Insight</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="8">No products for review</td>
              </tr>
            ) : (
              products.map((p) => {
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
                            setEditing((prev) => ({
                              ...prev,
                              [p.productKey]: {
                                ...edit,
                                name: e.target.value,
                              },
                            }))
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
                    <td>{p.primaryVariant?.sku || "-"}</td>

                    {/* PRICE */}
                    <td>
                      {edit ? (
                        <input
                          type="number"
                          value={edit.price}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [p.productKey]: {
                                ...edit,
                                price: e.target.value,
                              },
                            }))
                          }
                        />
                      ) : (
                        `₹${p.primaryVariant?.sellingPrice || 0}`
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
                    <td>{ai?.decision || "-"}</td>

                    {/* AI INSIGHT */}
                    <td style={{ maxWidth: 220 }}>
                      {ai?.summary || "-"}
                      {ai?.issues?.length > 0 && (
                        <ul style={{ paddingLeft: 15 }}>
                          {ai.issues.map((i, idx) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="actions">

                      {/* EDIT */}
                      {edit ? (
                        <>
                          <button onClick={() => saveEdit(p.productKey)}>
                            💾
                          </button>
                          <button onClick={() => cancelEdit(p.productKey)}>
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
                            disabled={loadingId === p.productKey}
                            onClick={() => action(p.productKey, "approve")}
                          >
                            ✅
                          </button>

                          <button
                            className="reject"
                            disabled={loadingId === p.productKey}
                            onClick={() => {
                              const reason = prompt("Enter rejection reason");
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= STYLES ================= */}

      <style jsx>{`
        .wrap {
          padding: 20px;
          max-width: 1400px;
          margin: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
        }

        th,
        td {
          padding: 10px;
          border-bottom: 1px solid #eee;
          text-align: left;
          vertical-align: top;
        }

        th {
          background: #fafafa;
        }

        input {
          width: 100%;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
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
          font-weight: bold;
        }

        .status.approved {
          color: green;
          font-weight: bold;
        }

        .status.rejected {
          color: red;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
