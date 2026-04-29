"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductView() {
  const params = useParams();
  const router = useRouter();

  // supports both /[id] or /[productId]
  const id = params?.id || params?.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();

      if (!data.success) {
        setProduct(null);
        setError(data.message || "Product not found");
        return;
      }

      setProduct(data.product);
    } catch (err) {
      console.error(err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function action(type) {
    try {
      await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          action: type,
        }),
      });

      await load();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading product...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        ❌ {error}
      </div>
    );
  }

  if (!product) {
    return <div style={{ padding: 20 }}>Product not found</div>;
  }

  // SAFE VARIANT RESOLUTION
  const v =
    product?.primaryVariant ||
    product?.variants?.[0] ||
    {};

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "auto" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📦 Product Ops View</h2>

        <button onClick={() => router.back()}>
          Back
        </button>
      </div>

      {/* BASIC INFO */}
      <div style={card}>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </div>

      {/* FULL RAW DEBUG (IMPORTANT FOR APPROVERS) */}
      <div style={card}>
        <h3>🧠 Full Product Data</h3>
        <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(product, null, 2)}
        </pre>
      </div>

      {/* IMAGES */}
      <div style={card}>
        <h3>Images</h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(product.images || []).map((img, i) => (
            <img
              key={i}
              src={img}
              width={100}
              height={100}
              alt={`product-${i}`}
              style={{ objectFit: "cover", borderRadius: 6 }}
            />
          ))}
        </div>
      </div>

      {/* VARIANT */}
      <div style={card}>
        <h3>Variant</h3>

        <p><b>SKU:</b> {v.sku || "N/A"}</p>
        <p><b>Price:</b> ₹{v.sellingPrice || 0}</p>
        <p><b>Stock:</b> {v.stock || 0}</p>
      </div>

      {/* INGREDIENTS (if exists) */}
      {product.ingredients?.length > 0 && (
        <div style={card}>
          <h3>Ingredients</h3>
          <ul>
            {product.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.name} - {ing.qty} {ing.unit} ({ing.percent}%)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ACTIONS */}
      <div style={card}>
        <h3>Actions</h3>

        <button onClick={() => action("approve")}>
          Approve
        </button>

        <button onClick={() => action("reject")}>
          Reject
        </button>

        <button onClick={() => action("list")}>
          List
        </button>

        <button onClick={() => action("delist")}>
          Delist
        </button>
      </div>

    </div>
  );
}

const card = {
  padding: 15,
  marginBottom: 15,
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};
