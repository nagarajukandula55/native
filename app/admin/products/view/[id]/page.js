"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductModerationConsole() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD ================= */

  async function load() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.product);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  /* ================= INLINE UPDATE ================= */

  async function update(field, value) {
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });

      const data = await res.json();

      if (data.success) setProduct(data.product);
    } finally {
      setSaving(false);
    }
  }

  /* ================= ACTION ================= */

  async function action(type) {
    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        action: type,
      }),
    });

    await load();
  }

  /* ================= AI-STYLE RULE ENGINE (LOCAL) ================= */

  function getRiskFlags(p) {
    const flags = [];

    if (!p?.images?.length) flags.push("❌ No product images");
    if (!p?.description) flags.push("⚠️ Missing description");
    if (!p?.primaryVariant?.sellingPrice)
      flags.push("❌ Missing selling price");

    if (
      Number(p?.primaryVariant?.sellingPrice || 0) <
      Number(p?.primaryVariant?.mrp || 0) * 0.5
    ) {
      flags.push("⚠️ Price unusually low (possible loss / error)");
    }

    if (!p?.fssaiNumber) flags.push("⚠️ Compliance missing (FSSAI)");

    return flags;
  }

  /* ================= LOADING ================= */

  if (loading) {
    return <div style={{ padding: 20 }}>Loading moderation console...</div>;
  }

  if (!product) {
    return <div style={{ padding: 20 }}>Product not found</div>;
  }

  const flags = getRiskFlags(product);

  return (
    <div style={{ padding: 20, maxWidth: 1300, margin: "auto" }}>

      {/* ================= HEADER ================= */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2>🧠 Moderation Console</h2>
          <p>
            Product ID: <b>{id}</b>
          </p>
        </div>

        <button onClick={() => router.back()}>
          ⬅ Back
        </button>
      </div>

      {/* ================= STATUS STRIP ================= */}
      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        <span>Status: <b>{product.status}</b></span>
        <span>Listed: {product.isListed ? "YES" : "NO"}</span>
      </div>

      {/* ================= ACTION BAR ================= */}
      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        <button onClick={() => action("approve")}>✅ Approve</button>
        <button onClick={() => action("reject")}>❌ Reject</button>
        <button onClick={() => action("list")}>📢 List</button>
        <button onClick={() => action("delist")}>🚫 Delist</button>
      </div>

      {/* ================= GRID ================= */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 20 }}>

        {/* ================= LEFT: PRODUCT ================= */}
        <div style={{ background: "#fff", padding: 15, borderRadius: 10 }}>

          <h3>📦 Product Editor</h3>

          <label>Name</label>
          <input
            value={product.name || ""}
            onChange={(e) => update("name", e.target.value)}
            style={{ width: "100%" }}
          />

          <label>Description</label>
          <textarea
            value={product.description || ""}
            onChange={(e) => update("description", e.target.value)}
            style={{ width: "100%", height: 100 }}
          />

          <label>Price</label>
          <input
            value={product.primaryVariant?.sellingPrice || ""}
            onChange={(e) => update("sellingPrice", e.target.value)}
          />

          <label>MRP</label>
          <input
            value={product.primaryVariant?.mrp || ""}
            onChange={(e) => update("mrp", e.target.value)}
          />

          <h4>🖼 Images</h4>
          <div style={{ display: "flex", gap: 10 }}>
            {(product.images || []).map((img, i) => (
              <img
                key={i}
                src={img}
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }}
              />
            ))}
          </div>

        </div>

        {/* ================= RIGHT: MODERATION PANEL ================= */}
        <div>

          {/* ================= RISK PANEL ================= */}
          <div style={{ background: "#fff3f3", padding: 15, borderRadius: 10 }}>
            <h3>⚠️ Risk Analysis</h3>

            {flags.length === 0 ? (
              <p style={{ color: "green" }}>No issues detected</p>
            ) : (
              <ul>
                {flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
          </div>

          {/* ================= QUICK INFO ================= */}
          <div style={{ marginTop: 15, background: "#f6f6f6", padding: 15, borderRadius: 10 }}>
            <h3>📊 Quick Summary</h3>

            <p>Category: {product.category}</p>
            <p>SKU: {product.primaryVariant?.sku || "—"}</p>
            <p>Stock: {product.primaryVariant?.stock || 0}</p>
          </div>

          {/* ================= AUDIT LOG ================= */}
          <div style={{ marginTop: 15, background: "#fff", padding: 15, borderRadius: 10 }}>
            <h3>📜 Decision Log</h3>

            <ul>
              <li>Created: {product.createdAt || "—"}</li>
              <li>Last Updated: {product.updatedAt || "—"}</li>
              <li>Current Status: {product.status}</li>
            </ul>
          </div>

        </div>
      </div>

      {saving && (
        <div style={{ marginTop: 10, color: "orange" }}>
          Saving changes...
        </div>
      )}

    </div>
  );
}
