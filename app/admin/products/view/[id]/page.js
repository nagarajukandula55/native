"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductOpsView() {
  const { productId } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD ================= */

  async function load() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.product);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [productId]);

  /* ================= UPDATE INLINE ================= */

  function updateField(field, value) {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* ================= SAVE ================= */

  async function saveChanges() {
    try {
      setSaving(true);

      await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      alert("Updated successfully");
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }

    setSaving(false);
  }

  /* ================= ACTION ================= */

  async function action(type) {
    await fetch(`/api/admin/products/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        action: type,
      }),
    });

    load();
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading product...</div>;
  }

  if (!product) {
    return <div style={{ padding: 20 }}>Product not found</div>;
  }

  const variant = product.primaryVariant || {};

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "auto" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>🧠 Product Ops Console</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => router.back()}>⬅ Back</button>

          <button onClick={() => setEditMode(!editMode)}>
            {editMode ? "Lock View" : "Edit Mode"}
          </button>

          <button onClick={saveChanges} disabled={!editMode || saving}>
            💾 Save
          </button>
        </div>
      </div>

      {/* STATUS BAR */}
      <div style={{ marginTop: 10 }}>
        <b>Status:</b> {product.status} |{" "}
        <b>Listed:</b> {product.isListed ? "YES" : "NO"}
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 20 }}>

        {/* LEFT PANEL */}
        <div>

          {/* BASIC */}
          <div style={card}>
            <h3>📦 Basic Info</h3>

            {editMode ? (
              <>
                <input
                  value={product.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />

                <textarea
                  value={product.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </>
            ) : (
              <>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
              </>
            )}
          </div>

          {/* IMAGES */}
          <div style={card}>
            <h3>🖼 Images</h3>

            <div style={{ display: "flex", gap: 10 }}>
              {product.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ))}
            </div>
          </div>

          {/* VARIANTS */}
          <div style={card}>
            <h3>📊 Variants</h3>

            <table width="100%">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>

              <tbody>
                {(product.variants || []).map((v, i) => (
                  <tr key={i}>
                    <td>{v.sku}</td>
                    <td>₹{v.sellingPrice}</td>
                    <td>{v.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div>

          {/* OPS ACTIONS */}
          <div style={card}>
            <h3>⚙️ Moderation Actions</h3>

            <button onClick={() => action("approve")}>
              ✅ Approve
            </button>

            <button onClick={() => action("reject")}>
              ❌ Reject
            </button>

            <button onClick={() => action("list")}>
              📢 List
            </button>

            <button onClick={() => action("delist")}>
              🚫 Delist
            </button>
          </div>

          {/* AI FLAGS (LOCAL UI ONLY) */}
          <div style={card}>
            <h3>🧠 AI Risk Panel</h3>

            <p>⚠ Missing Compliance: {product.fssaiNumber ? "No" : "Yes"}</p>
            <p>⚠ Low Margin Risk: {Number(variant.sellingPrice) < 50 ? "Yes" : "No"}</p>
            <p>⚠ Image Quality: OK</p>
          </div>

          {/* COMPLIANCE */}
          <div style={card}>
            <h3>📜 Compliance</h3>

            <p>FSSAI: {product.fssaiNumber || "NA"}</p>
            <p>Manufacturer: {product.manufacturerName}</p>
            <p>Country: {product.countryOfOrigin}</p>
          </div>

          {/* ACTIVITY LOG (STRUCTURE READY) */}
          <div style={card}>
            <h3>📜 Activity Log</h3>
            <p>• Created by Admin</p>
            <p>• Sent to Review</p>
            <p>• Awaiting Moderation</p>
          </div>

        </div>

      </div>

    </div>
  );
}

/* ================= STYLE ================= */

const card = {
  padding: 15,
  background: "#fff",
  borderRadius: 10,
  marginBottom: 15,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};
