"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductView() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id; // 👈 IMPORTANT FIX

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();

      setProduct(data.product || null);
    } catch (err) {
      console.error("Load error:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function action(type) {
    if (!id) return;

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        action: type,
      }),
    });

    load();
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!product) return <div style={{ padding: 20 }}>Product not found</div>;

  const v = product.primaryVariant || {};

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "auto" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📦 Product Ops View</h2>
        <button onClick={() => router.back()}>Back</button>
      </div>

      {/* BASIC */}
      <div style={card}>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <p><b>Category:</b> {product.category}</p>
        <p><b>Brand:</b> {product.brand}</p>
        <p><b>Status:</b> {product.status}</p>
      </div>

      {/* FULL DETAILS */}
      <div style={card}>
        <h3>📦 Full Product Data</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(product, null, 2)}
        </pre>
      </div>

      {/* IMAGES */}
      <div style={card}>
        <h3>Images</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={img || "/no-image.png"}
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
            />
          ))}
        </div>
      </div>

      {/* VARIANT */}
      <div style={card}>
        <h3>Variant</h3>
        <p><b>SKU:</b> {v.sku}</p>
        <p><b>Price:</b> ₹{v.sellingPrice}</p>
        <p><b>Stock:</b> {v.stock}</p>
      </div>

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
