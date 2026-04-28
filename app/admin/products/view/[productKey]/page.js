"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductViewPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProduct() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json();

      console.log("VIEW API RESPONSE:", data);

      if (data?.product) {
        setProduct(data.product);
      } else {
        setProduct(null);
      }

    } catch (err) {
      console.error("View load error:", err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h3>Loading product...</h3>
      </div>
    );
  }

  /* ================= NOT FOUND ================= */

  if (!product) {
    return (
      <div style={{ padding: 20 }}>
        <h3>❌ Product not found</h3>
        <p>Check API or productId: {productId}</p>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20 }}>

      <h2>📦 Product View</h2>

      <div style={{ display: "grid", gap: 10 }}>

        <h3>{product.name}</h3>

        <p><b>Product ID:</b> {product.productId}</p>

        <p><b>Category:</b> {product.category}</p>

        <p><b>Status:</b> {product.status}</p>

        <p><b>Price:</b> ₹{product.primaryVariant?.sellingPrice}</p>

        <p><b>SKU (secondary):</b> {product.primaryVariant?.sku}</p>

        <div>
          <img
            src={product.images?.[0] || "/no-image.png"}
            width={200}
            style={{ borderRadius: 8 }}
          />
        </div>

      </div>

    </div>
  );
}
