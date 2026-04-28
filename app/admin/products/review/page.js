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

  /* ================= SAFE ID RESOLVER ================= */

  function getProductId(p) {
    return p.productId || p.productKey || p._id;
  }

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
      alert("Select or enter rejection reason");
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

  return (
    <div style={{ padding: 20 }}>

      <h2>🧾 Product Review Queue</h2>

      {products.length === 0 && (
        <p style={{ color: "#777" }}>
          No products waiting for review
        </p>
      )}

      {products.length > 0 && (
        <table width="100%" border="1" cellPadding="10">
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th>Product</th>
              <th>Image</th>
              <th>Product ID</th>
              <th>Price</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const id = getProductId(p);

              return (
                <tr key={id}>

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

                  {/* PRODUCT ID (NOT SKU) */}
                  <td>
                    <code>{id}</code>
                  </td>

                  {/* PRICE */}
                  <td>₹ {p.primaryVariant?.sellingPrice || 0}</td>

                  {/* STATUS */}
                  <td>
                    <b>{p.status}</b>
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

                    {rejectionMap[id] === "Other" && (
                      <input
                        placeholder="Custom reason"
                        onChange={(e) =>
                          setRejectionMap((prev) => ({
                            ...prev,
                            [id]: e.target.value,
                          }))
                        }
                        style={{ marginTop: 5, width: "100%" }}
                      />
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td style={{ display: "flex", gap: 6 }}>

                    <button
                      onClick={() => approve(id)}
                      disabled={loadingId === id}
                      style={{
                        background: "green",
                        color: "#fff",
                        border: "none",
                        padding: 6,
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      {loadingId === id ? "..." : "Approve"}
                    </button>

                    <button
                      onClick={() => reject(id)}
                      disabled={loadingId === id}
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

                    {/* FIXED VIEW ROUTE */}
                    <button
                      onClick={() => router.push(`/admin/products/view/${id}`)}
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
              );
            })}
          </tbody>
        </table>
      )}

    </div>
  );
}
