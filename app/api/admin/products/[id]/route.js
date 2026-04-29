"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductView() {
  const { productId } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json();

      setProduct(data.product);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (productId) load();
  }, [productId]);

  async function action(type) {
    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        action: type,
      }),
    });

    load();
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!product) return <div style={{ padding: 20 }}>Product not found</div>;

  const v = product.primaryVariant || {};

  const card = {
    padding: 15,
    marginBottom: 15,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "auto" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📦 Product Full Review</h2>

        <button onClick={() => router.back()}>
          Back
        </button>
      </div>

      {/* BASIC INFO */}
      <div style={card}>
        <h3>Basic Info</h3>
        <p><b>Name:</b> {product.name}</p>
        <p><b>Slug:</b> {product.slug}</p>
        <p><b>Product Key:</b> {product.productKey}</p>
        <p><b>Brand:</b> {product.brand}</p>
        <p><b>Category:</b> {product.category}</p>
        <p><b>Subcategory:</b> {product.subcategory}</p>
        <p><b>Status:</b> {product.status}</p>
      </div>

      {/* DESCRIPTION */}
      <div style={card}>
        <h3>Description</h3>
        <p>{product.description}</p>
        <p>{product.shortDescription}</p>
      </div>

      {/* IMAGES */}
      <div style={card}>
        <h3>Images</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {product.images?.length ? (
            product.images.map((img, i) => (
              <img key={i} src={img} width={100} height={100} />
            ))
          ) : (
            <p>No images</p>
          )}
        </div>
      </div>

      {/* VARIANT */}
      <div style={card}>
        <h3>Variant</h3>
        <p><b>SKU:</b> {v.sku}</p>
        <p><b>Price:</b> ₹{v.sellingPrice}</p>
        <p><b>Stock:</b> {v.stock}</p>
      </div>

      {/* INGREDIENTS */}
      <div style={card}>
        <h3>Ingredients</h3>
        {product.ingredients?.length ? (
          product.ingredients.map((ing, i) => (
            <div key={i}>
              {ing.name} - {ing.qty} {ing.unit} ({ing.percent}%)
            </div>
          ))
        ) : (
          <p>No ingredients</p>
        )}
      </div>

      {/* MANUFACTURER */}
      <div style={card}>
        <h3>Manufacturer</h3>
        <p>{product.manufacturerName}</p>
        <p>{product.manufacturerAddress}</p>
        <p>Country: {product.countryOfOrigin}</p>
        <p>FSSAI: {product.fssaiNumber}</p>
      </div>

      {/* GST / TAX */}
      <div style={card}>
        <h3>Tax Info</h3>
        <p>HSN: {product.hsn}</p>
        <p>GST: {product.tax}%</p>
        <p>Category: {product.gstCategory}</p>
      </div>

      {/* FLAGS */}
      <div style={card}>
        <h3>System Flags</h3>
        <p>Active: {String(product.isActive)}</p>
        <p>Listed: {String(product.isListed)}</p>
        <p>Deleted: {String(product.isDeleted)}</p>
        <p>Created By: {product.createdBy}</p>
      </div>

      {/* RAW DATA (VERY IMPORTANT FOR APPROVAL SYSTEM) */}
      <div style={card}>
        <h3>🧠 Full Raw JSON (Audit View)</h3>
        <pre style={{ fontSize: 12, overflow: "auto" }}>
          {JSON.stringify(product, null, 2)}
        </pre>
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
