"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        const found = data.products.find((p) => p.slug === slug);
        setProduct(found || null);
      } catch (err) {
        console.error(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) loadProduct();
  }, [slug]);

  const addToCart = () => {
    if (!product) return;
    const exists = cart.find((p) => p.id === product.id);
    if (!exists) setCart([...cart, { ...product, quantity: 1 }]);
    else setCart(cart.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)));
    alert(`${product.name} added to cart`);
  };

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;
  if (!product)
    return (
      <div style={{ padding: "40px" }}>
        <p>Product not found.</p>
        <Link href="/products" style={{ color: "#1890ff" }}>
          Back to Products
        </Link>
      </div>
    );

  return (
    <div style={{ padding: "40px", fontFamily: "'Arial', sans-serif'" }}>
      <Link href="/products" style={{ color: "#1890ff", marginBottom: "20px", display: "inline-block" }}>
        &larr; Back
      </Link>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {product.image && (
          <img
            src={product.image}
            alt={product.alt || product.name}
            style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "10px" }}
          />
        )}
        <h1>{product.name}</h1>
        <p style={{ fontWeight: "bold", fontSize: "20px" }}>₹{product.price}</p>
        <p>{product.description}</p>
        <p>Stock: {product.stock}</p>
        <p>Category: {product.category}</p>
        {product.featured && <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>★ Featured Product</p>}
        <button
          onClick={addToCart}
          style={{ padding: "10px 15px", background: "#1890ff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
