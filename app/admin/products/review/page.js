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

      await loadProducts();
    } catch (err) {
      console.error(err);
    }

    setLoadingId(null);
  }

  /* ================= REJECT ================= */

  async function reject(productKey) {
    const reason = rejectionMap[productKey];

    if (!reason) {
      alert("Select or enter rejection reason");
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

      await loadProducts();
    } catch (err) {
      console.error(err);
    }

    setLoadingId(null);
  }

  return (
    <div style={{ padding: 20 }}>

      <h2>🧾 Product Review Queue</h2>

      {/* ================= EMPTY STATE ================= */}
      {products.length === 0 && (
        <p style={{ color: "#777" }}>
          No products waiting for review
        </p>
      )}

      {/* ================= TABLE ================= */}
      {products.length > 0 && (
        <table width="100%" border="1" cellPadding="10">
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th>Product</th>
              <th>Image</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p._id}>

                {/* PRODUCT */}
                <td>
                  <b>{p.name}</b>
                  <br />
                  <small>{p.category}</small>
                </td>

                {/* IMAGE */}
                <td>
                  <img
                    src={p.images?.[0] || "/no-image.png"}
                    alt="product"
                    width={60}
                    height={60}
                    style={{ objectFit: "cover", borderRadius: 6 }}
                  />
                </td>

                {/* SKU */}
                <td>{p.primaryVariant?.sku || "—"}</td>

                {/* PRICE */}
                <td>₹ {p.primaryVariant?.sellingPrice || 0}</td>

                {/* STATUS */}
                <td>
                  <span style={{ fontWeight: "bold" }}>
                    {p.status}
                  </span>
                </td>

                {/* REJECTION REASON INPUT */}
                <td>
                  <select
                    value={rejectionMap[p.productKey] || ""}
                    onChange={(e) =>
                      setRejectionMap((prev) => ({
                        ...prev,
                        [p.productKey]: e.target.value,
                      }))
                    }
                    style={{ width: "100%" }}
                  >
                    <option value="">Select reason</option>
                    <option value="Bad description">Bad description</option>
                    <option value="Incorrect pricing">Incorrect pricing</option>
                    <option value="Missing compliance info">
                      Missing compliance info
                    </option>
                    <option value="Image issue">Image issue</option>
                    <option value="Duplicate product">Duplicate product</option>
                    <option value="Other">Other</option>
                  </select>

                  {/* CUSTOM INPUT */}
                  {rejectionMap[p.productKey] === "Other" && (
                    <input
                      placeholder="Custom reason"
                      onChange={(e) =>
                        setRejectionMap((prev) => ({
                          ...prev,
                          [p.productKey]: e.target.value,
                        }))
                      }
                      style={{ marginTop: 5, width: "100%" }}
                    />
                  )}
                </td>

                {/* ACTIONS */}
                <td style={{ display: "flex", gap: 6 }}>

                  <button
                    onClick={() => approve(p.productKey)}
                    disabled={loadingId === p.productKey}
                    style={{
                      background: "green",
                      color: "#fff",
                      border: "none",
                      padding: 6,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    {loadingId === p.productKey ? "..." : "Approve"}
                  </button>

                  <button
                    onClick={() => reject(p.productKey)}
                    disabled={loadingId === p.productKey}
                    style={{
                      background: "red",
                      color: "#fff",
                      border: "none",
                      padding: 6,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/admin/products/view/${p.productKey}`)
                    }
                    style={{
                      background: "black",
                      color: "#fff",
                      border: "none",
                      padding: 6,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
