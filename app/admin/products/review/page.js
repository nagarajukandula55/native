"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [rejectionMap, setRejectionMap] = useState({});
  const [loadingId, setLoadingId] = useState(null);

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

  /* ================= APPROVE ================= */

  async function approve(productId) {
    if (!confirm("Approve this product?")) return;

    setLoadingId(productId);

    try {
      await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          action: "approve",
        }),
      });

      await loadProducts();
    } catch (err) {
      console.error(err);
    }

    setLoadingId(null);
  }

  /* ================= REJECT ================= */

  async function reject(productId) {
    const reason = rejectionMap[productId];

    if (!reason) {
      alert("Select rejection reason");
      return;
    }

    if (!confirm("Reject this product?")) return;

    setLoadingId(productId);

    try {
      await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          action: "reject",
          reason,
        }),
      });

      await loadProducts();
    } catch (err) {
      console.error(err);
    }

    setLoadingId(null);
  }

  /* ================= AI DECISION PLACEHOLDER ================= */
  function aiDecision(p) {
    if (!p) return "Unknown";

    if (!p.primaryVariant?.sellingPrice) return "Reject (No Price)";
    if (!p.images?.length) return "Reject (No Images)";
    if (p.name?.length < 3) return "Reject (Bad Title)";

    return "Approve (AI Safe)";
  }

  return (
    <div style={{ padding: 20 }}>

      <h2>🧠 AI Product Moderation Console</h2>

      {/* ================= TABLE ================= */}
      <table width="100%" border="1" cellPadding="10">
        <thead style={{ background: "#f5f5f5" }}>
          <tr>
            <th>Product</th>
            <th>ID</th>
            <th>Image</th>
            <th>Price</th>
            <th>Status</th>
            <th>AI Suggestion</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => {
            const id = p._id; // 🔥 FIXED: SINGLE SOURCE OF TRUTH

            return (
              <tr key={id}>

                {/* PRODUCT */}
                <td>
                  <b>{p.name}</b>
                  <br />
                  <small>{p.category}</small>
                </td>

                {/* PRODUCT ID */}
                <td style={{ fontSize: 12, color: "#666" }}>
                  {id}
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

                {/* PRICE */}
                <td>₹{p.primaryVariant?.sellingPrice || 0}</td>

                {/* STATUS */}
                <td>
                  <b>{p.status}</b>
                </td>

                {/* AI SUGGESTION */}
                <td>
                  <span style={{ color: "#0070f3" }}>
                    {aiDecision(p)}
                  </span>
                </td>

                {/* REASON */}
                <td>
                  <select
                    value={rejectionMap[id] || ""}
                    onChange={(e) =>
                      setRejectionMap((prev) => ({
                        ...prev,
                        [id]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select reason</option>
                    <option value="Bad description">Bad description</option>
                    <option value="Incorrect pricing">Incorrect pricing</option>
                    <option value="Missing info">Missing info</option>
                    <option value="Image issue">Image issue</option>
                    <option value="Duplicate">Duplicate</option>
                    <option value="Other">Other</option>
                  </select>
                </td>

                {/* ACTIONS */}
                <td style={{ display: "flex", gap: 6 }}>

                  <button
                    onClick={() => approve(id)}
                    disabled={loadingId === id}
                    style={{ background: "green", color: "#fff" }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => reject(id)}
                    disabled={loadingId === id}
                    style={{ background: "red", color: "#fff" }}
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => router.push(`/admin/products/view/${id}`)}
                    style={{ background: "black", color: "#fff" }}
                  >
                    View
                  </button>

                </td>

              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
}
