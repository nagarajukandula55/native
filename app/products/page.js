"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/ProductGrid";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data?.products || []);
    }

    load();
  }, []);

  return (
    <div className="container">
      <h1>All Products</h1>
      <ProductGrid products={products} />

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
