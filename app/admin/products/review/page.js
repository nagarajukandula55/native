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

  /* ================= SCORE ================= */
  function aiScore(p) {
    let score = 100;

    if (!p.images?.length) score -= 25;
    if (!p.description) score -= 15;
    if (!p.primaryVariant?.sellingPrice) score -= 20;
    if ((p.primaryVariant?.sellingPrice || 0) < 10) score -= 15;

    return {
      score,
      risk:
        score >= 85 ? "LOW" :
        score >= 60 ? "MEDIUM" :
        "HIGH",
    };
  }

  /* ================= LOG ================= */
  function pushLog(action, id) {
    setLog((prev) => [
      { time: new Date().toLocaleTimeString(), action, id },
      ...prev,
    ]);
  }

  /* ================= ACTIONS ================= */
  async function approve(id) {
    if (!confirm("Approve product?")) return;

    setLoadingId(id);

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, action: "approve" }),
    });

    pushLog("APPROVED", id);
    await loadProducts();
    setLoadingId(null);
  }

  async function reject(id) {
    if (!confirm("Reject product?")) return;

    setLoadingId(id);

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, action: "reject" }),
    });

    pushLog("REJECTED", id);
    await loadProducts();
    setLoadingId(null);
  }

  /* ================= INLINE UPDATE ================= */
  async function updateField(id, field, value) {
    const updated = products.map((p) =>
      p._id === id ? { ...p, [field]: value } : p
    );

    setProducts(updated);

    await fetch("/api/admin/products/update-inline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, field, value }),
    });

    pushLog(`UPDATED ${field}`, id);
  }

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20, background: "#f4f6f8" }}>
      <h2>🧠 AI Product Moderation Console</h2>

      <div style={{ overflowX: "auto" }}>
        <table width="100%" border="1" cellPadding="10" style={{ background: "#fff" }}>
          <thead style={{ background: "#111", color: "#fff" }}>
            <tr>
              <th>Product</th>
              <th>Product Key</th>
              <th>Image</th>
              <th>Price</th>
              <th>AI Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const id = p._id;
              const ai = aiScore(p);

              return (
                <tr key={id}>

                  <td>
                    {editRow === id ? (
                      <input
                        value={p.name}
                        onChange={(e) =>
                          updateField(id, "name", e.target.value)
                        }
                      />
                    ) : (
                      <b>{p.name}</b>
                    )}
                    <br />
                    <small>{p.category}</small>
                  </td>

                  {/* IMPORTANT: productKey only display */}
                  <td>
                    <code>{p.productKey}</code>
                  </td>

                  <td>
                    <img
                      src={p.images?.[0] || "/no-image.png"}
                      width={60}
                      height={60}
                      style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                  </td>

                  <td>
                    ₹ {p.primaryVariant?.sellingPrice || 0}
                  </td>

                  <td>
                    <b>{ai.score}/100</b>
                    <br />
                    <span style={{ color: ai.risk === "HIGH" ? "red" : ai.risk === "MEDIUM" ? "orange" : "green" }}>
                      {ai.risk}
                    </span>
                  </td>

                  <td>
                    <b>{p.status}</b>
                  </td>

                  <td style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => approve(id)} disabled={loadingId === id}>Approve</button>
                    <button onClick={() => reject(id)} disabled={loadingId === id}>Reject</button>

                    <button
                      onClick={() => router.push(`/admin/products/view/${id}`)}
                    >
                      View
                    </button>

                    <button onClick={() => setEditRow(editRow === id ? null : id)}>
                      Edit
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* LOG */}
      <div style={{ marginTop: 30 }}>
        <h3>📜 Activity Log</h3>
        <div style={{ background: "#fff", padding: 10 }}>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 12 }}>
              [{l.time}] {l.action} → {l.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
