"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [log, setLog] = useState([]);

  const router = useRouter();

  /* ================= LOAD ================= */

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products/review");
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= AI MODERATION (LOCAL ENGINE) ================= */

  function aiScore(p) {
    let score = 100;

    if (!p.images?.length) score -= 25;
    if (!p.description) score -= 15;
    if (!p.primaryVariant?.sellingPrice) score -= 20;
    if (p.primaryVariant?.sellingPrice < 10) score -= 15;

    const risk =
      score >= 85 ? "LOW" :
      score >= 60 ? "MEDIUM" :
      "HIGH";

    return { score, risk };
  }

  /* ================= ACTIVITY LOG ================= */

  function pushLog(action, productId) {
    setLog((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        action,
        productId,
      },
      ...prev,
    ]);
  }

  /* ================= ACTIONS ================= */

  async function approve(productId) {
    if (!confirm("Approve product?")) return;

    setLoadingId(productId);

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, action: "approve" }),
    });

    pushLog("APPROVED", productId);
    await loadProducts();
    setLoadingId(null);
  }

  async function reject(productId) {
    if (!confirm("Reject product?")) return;

    setLoadingId(productId);

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        action: "reject",
        reason: "Manual review rejection",
      }),
    });

    pushLog("REJECTED", productId);
    await loadProducts();
    setLoadingId(null);
  }

  /* ================= INLINE UPDATE ================= */

  async function updateField(productId, field, value) {
    const updated = products.map((p) =>
      p.productId === productId
        ? { ...p, [field]: value }
        : p
    );

    setProducts(updated);

    // optional backend sync hook
    await fetch("/api/admin/products/update-inline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, field, value }),
    });

    pushLog(`UPDATED ${field}`, productId);
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20, background: "#f4f6f8" }}>

      <h2>🧠 AI Product Moderation Console</h2>

      {/* ================= TABLE ================= */}
      <div style={{ overflowX: "auto" }}>
        <table width="100%" border="1" cellPadding="10" style={{ background: "#fff" }}>
          <thead style={{ background: "#111", color: "#fff" }}>
            <tr>
              <th>Product</th>
              <th>Product ID</th>
              <th>Image</th>
              <th>Price</th>
              <th>AI Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const ai = aiScore(p);

              return (
                <tr key={p.productId}>

                  {/* PRODUCT */}
                  <td>
                    {editRow === p.productId ? (
                      <input
                        value={p.name}
                        onChange={(e) =>
                          updateField(p.productId, "name", e.target.value)
                        }
                      />
                    ) : (
                      <b>{p.name}</b>
                    )}
                    <br />
                    <small>{p.category}</small>
                  </td>

                  {/* PRODUCT ID */}
                  <td>
                    <code>{p.productId}</code>
                  </td>

                  {/* IMAGE */}
                  <td>
                    <img
                      src={p.images?.[0] || "/no-image.png"}
                      width={60}
                      height={60}
                      style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                  </td>

                  {/* PRICE INLINE EDIT */}
                  <td>
                    {editRow === p.productId ? (
                      <input
                        type="number"
                        value={p.primaryVariant?.sellingPrice || 0}
                        onChange={(e) =>
                          updateField(
                            p.productId,
                            "primaryVariant.sellingPrice",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <>₹ {p.primaryVariant?.sellingPrice || 0}</>
                    )}
                  </td>

                  {/* AI SCORE */}
                  <td>
                    <div>
                      <b>{ai.score}/100</b>
                      <br />
                      <span
                        style={{
                          color:
                            ai.risk === "HIGH"
                              ? "red"
                              : ai.risk === "MEDIUM"
                              ? "orange"
                              : "green",
                        }}
                      >
                        {ai.risk} RISK
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td>
                    <b>{p.status}</b>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ display: "flex", gap: 6 }}>

                    <button
                      onClick={() => approve(p.productId)}
                      disabled={loadingId === p.productId}
                      style={{ background: "green", color: "#fff" }}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(p.productId)}
                      disabled={loadingId === p.productId}
                      style={{ background: "red", color: "#fff" }}
                    >
                      Reject
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/admin/products/view/${p.productId}`)
                      }
                      style={{ background: "black", color: "#fff" }}
                    >
                      View
                    </button>

                    <button
                      onClick={() =>
                        setEditRow(
                          editRow === p.productId ? null : p.productId
                        )
                      }
                    >
                      Edit
                    </button>

                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= ACTIVITY LOG ================= */}
      <div style={{ marginTop: 30 }}>
        <h3>📜 Activity Log</h3>

        <div style={{ background: "#fff", padding: 10 }}>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 12 }}>
              [{l.time}] {l.action} → {l.productId}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
