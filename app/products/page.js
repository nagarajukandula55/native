"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/ProductGrid";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setProducts(data?.products || []);
      } catch (err) {
        console.error("PRODUCT LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="container">
      <h1>All Products</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <ProductGrid products={products} />
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 30px 20px;
        }
      `}</style>
    </div>
  );
}
