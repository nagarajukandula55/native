"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      const found = data.products.find(p => p.slug === slug);
      setProduct(found || null);
    };
    if (slug) loadProduct();
  }, [slug]);

  if (!product) return <div style={{ padding: "40px" }}>Product not found. <Link href="/products">Back</Link></div>;

  return (
    <div style={{ padding: "40px" }}>
      <Link href="/products" style={{ color: "#1890ff" }}>&larr; Back</Link>
      <h1>{product.name}</h1>
      {product.image && <img src={product.image} alt={product.alt || product.name} style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "10px" }} />}
      <p>₹{product.price}</p>
      <p>{product.description}</p>
      <p>Stock: {product.stock}</p>
      <p>Category: {product.category}</p>
      {product.featured && <p style={{ color: "#ff4d4f" }}>★ Featured</p>}
      <button style={{ padding: "10px 15px", background: "#1890ff", color: "#fff", borderRadius: "5px" }}>Add to Cart</button>
    </div>
  );
}
