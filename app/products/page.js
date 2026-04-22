"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const searchParams = useSearchParams();

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const query = searchParams.toString();
        const res = await fetch(`/api/products?${query}`);

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();

        setProducts(data?.products || []);
        setPagination(data?.pagination || {});
      } catch (err) {
        console.error("PRODUCT LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [searchParams]);

  return (
    <div className="layout">
      
      {/* ✅ FILTER SIDEBAR (NEW) */}
      <FilterSidebar />

      <div className="container">
        <h1>All Products</h1>

        {/* ✅ RESULT COUNT */}
        {!loading && pagination?.total && (
          <p className="count">
            {pagination.total} products found
          </p>
        )}

        {/* ✅ LOADING */}
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <ProductGrid products={products} />
        )}

        {/* ✅ PAGINATION */}
        {!loading && pagination?.totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const page = i + 1;

              const params = new URLSearchParams(searchParams.toString());
              params.set("page", page);

              return (
                <a
                  key={page}
                  href={`/products?${params.toString()}`}
                  className={pagination.page === page ? "active" : ""}
                >
                  {page}
                </a>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .layout {
          display: flex;
        }

        .container {
          flex: 1;
          max-width: 1200px;
          margin: auto;
          padding: 30px 20px;
        }

        .count {
          margin-bottom: 10px;
          color: #666;
        }

        .pagination {
          margin-top: 30px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pagination a {
          padding: 8px 12px;
          border: 1px solid #ddd;
          text-decoration: none;
          color: black;
          border-radius: 6px;
        }

        .pagination a.active {
          background: black;
          color: white;
          border-color: black;
        }
      `}</style>
    </div>
  );
}
