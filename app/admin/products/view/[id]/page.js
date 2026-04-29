"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductView() {
  const params = useParams();
  const router = useRouter();

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
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function action(type) {
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

  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

  if (!product) return <div style={{ padding: 20 }}>Product not found</div>;

  const v = product.primaryVariant || {};
  const pricing = product.pricing || {};

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "auto" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📦 Product Review Panel</h2>
        <button onClick={() => router.back()}>Back</button>
      </div>

      {/* BASIC INFO */}
      <div style={card}>
        <h3>🧾 Basic Info</h3>
        <p><b>Name:</b> {product.name}</p>
        <p><b>Slug:</b> {product.slug}</p>
        <p><b>Product Key:</b> {product.productKey}</p>
        <p><b>Category:</b> {product.category}</p>
        <p><b>Brand:</b> {product.brand}</p>
        <p><b>Subcategory:</b> {product.subcategory}</p>
        <p><b>Description:</b> {product.description}</p>
      </div>

      {/* PRICING */}
      <div style={card}>
        <h3>💰 Pricing</h3>
        <p>MRP: ₹{pricing.mrp}</p>
        <p>Selling Price: ₹{pricing.sellingPrice}</p>
        <p>GST Price: ₹{pricing.priceWithGST}</p>
        <p>Base Cost: ₹{pricing.baseCost}</p>
        <p>Packaging: ₹{pricing.packagingCost}</p>
        <p>Logistics: ₹{pricing.logisticsCost}</p>
      </div>

      {/* VARIANT */}
      <div style={card}>
        <h3>📦 Variant</h3>
        <p>SKU: {v.sku}</p>
        <p>Stock: {v.stock}</p>
        <p>Barcode: {v.barcode}</p>
        <p>Value: {v.value} {v.unit}</p>
      </div>

      {/* IMAGES */}
      <div style={card}>
        <h3>🖼 Images</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(product.images || []).map((img, i) => (
            <img
              key={i}
              src={img}
              width={100}
              height={100}
              style={{ objectFit: "cover", borderRadius: 6 }}
            />
          ))}
        </div>
      </div>

      {/* INGREDIENTS */}
      <div style={card}>
        <h3>🥗 Ingredients</h3>
        {(product.ingredients || []).length === 0 ? (
          <p>No ingredients</p>
        ) : (
          product.ingredients.map((ing, i) => (
            <div key={i}>
              {ing.name} - {ing.qty} {ing.unit} ({ing.percent}%)
            </div>
          ))
        )}
      </div>

      {/* AI DATA */}
      <div style={card}>
        <h3>🧠 AI Data</h3>
        <pre style={{ fontSize: 12 }}>
          {JSON.stringify(product.ai || {}, null, 2)}
        </pre>
      </div>

      {/* TAGS */}
      <div style={card}>
        <h3>🏷 Tags</h3>
        <p>{product.tags}</p>
      </div>

      {/* RAW DEBUG (VERY IMPORTANT FOR ADMIN) */}
      <div style={card}>
        <h3>🔍 Full Raw Data</h3>
        <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(product, null, 2)}
        </pre>
      </div>

      {/* ACTIONS */}
      <div style={card}>
        <h3>⚡ Actions</h3>

        <button onClick={() => action("approve")}>Approve</button>
        <button onClick={() => action("reject")}>Reject</button>
        <button onClick={() => action("list")}>List</button>
        <button onClick={() => action("delist")}>Delist</button>
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
