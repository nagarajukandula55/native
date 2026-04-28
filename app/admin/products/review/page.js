"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const [products, setProducts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [rejectionMap, setRejectionMap] = useState({});
  const [autoMode, setAutoMode] = useState(false);

  const router = useRouter();

  /* ================= LOAD ================= */

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products/review");
      const data = await res.json();

      setProducts(data.products || []);
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= AUTONOMOUS MODE ================= */

  async function autoModerate(product) {
    try {
      await fetch("/api/admin/products/auto-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      await loadProducts();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!autoMode) return;

    const interval = setInterval(() => {
      products.forEach((p) => {
        if (p.status === "review") {
          autoModerate(p);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoMode, products]);

  /* ================= ACTION ================= */

  async function action(productId, type, reason = "") {
    try {
      setLoadingId(productId);

      await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId, // ✅ FIXED
          action: type,
          reason,
        }),
      });

      await loadProducts();
    } catch (err) {
      console.error(err);
    }

    setLoadingId(null);
  }

  /* ================= AI SCAN ================= */

  async function runAIScan(product) {
    try {
      const res = await fetch("/api/ai/moderation-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      alert(
        `AI Verdict: ${data.result.verdict}\nScore: ${data.result.score}`
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ padding: 20 }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>🧠 Amazon-Style Moderation Console</h2>

        <button
          onClick={() => setAutoMode(!autoMode)}
          style={{
            background: autoMode ? "green" : "black",
            color: "#fff",
            padding: 10,
            borderRadius: 6,
          }}
        >
          🤖 Auto Mode: {autoMode ? "ON" : "OFF"}
        </button>
      </div>

      {/* TABLE */}
      <table width="100%" border="1" cellPadding="10" style={{ marginTop: 20 }}>

        <thead style={{ background: "#f5f5f5" }}>
          <tr>
            <th>Product</th>
            <th>Product ID</th>
            <th>Price</th>
            <th>Status</th>
            <th>AI</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan="6">No products</td>
            </tr>
          )}

          {products.map((p) => (
            <tr key={p._id}>

              {/* PRODUCT */}
              <td>
                <b>{p.name}</b>
                <br />
                <small>{p.category}</small>
              </td>

              {/* ✅ FIXED ID */}
              <td>{p.productId}</td>

              {/* PRICE */}
              <td>₹{p.primaryVariant?.sellingPrice || 0}</td>

              {/* STATUS */}
              <td>{p.status}</td>

              {/* AI */}
              <td>
                <button onClick={() => runAIScan(p)}>
                  Run AI
                </button>
              </td>

              {/* ACTIONS */}
              <td style={{ display: "flex", gap: 5 }}>

                <button
                  onClick={() => action(p.productId, "approve")}
                  disabled={loadingId === p.productId}
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    const reason = prompt("Rejection reason:");
                    action(p.productId, "reject", reason);
                  }}
                  disabled={loadingId === p.productId}
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    router.push(`/admin/products/view/${p.productId}`)
                  }
                >
                  View
                </button>

              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}
