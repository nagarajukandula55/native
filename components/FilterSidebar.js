"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getCategories } from "@/lib/an-sdk/products";

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [categories, setCategories] = useState([]);

  /* ================= LOAD FROM URL ================= */
  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSort(searchParams.get("sort") || "");
  }, [searchParams]);

  /* ================= LOAD REAL CATEGORIES =================
     NOTE: this used to be a hardcoded list of category *names* (e.g.
     "Cold Pressed Oils"), but every product's `category` field is a
     category _id (e.g. "cat_1") — so filtering by the hardcoded names
     silently matched zero products. Fetching the real list from
     GET /api/categories and filtering by _id fixes that for real. */
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data?.categories || []);
      })
      .catch((err) => {
        console.error("Category fetch error:", err);
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= APPLY FILTER ================= */
  function applyFilters() {
    const params = new URLSearchParams();

    // Preserve an active search query — filters narrow the search, they
    // don't replace it.
    const search = searchParams.get("search");
    if (search) params.set("search", search);

    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);

    router.push(`/products?${params.toString()}`);
  }

  /* ================= RESET ================= */
  function resetFilters() {
    const search = searchParams.get("search");
    router.push(search ? `/products?search=${encodeURIComponent(search)}` : "/products");
  }

  return (
    <div className="sidebar">
      <h3>Filters</h3>

      {/* CATEGORY */}
      <div className="section">
        <h4>Category</h4>
        <label>
          <input
            type="radio"
            checked={category === ""}
            onChange={() => setCategory("")}
          />
          All Categories
        </label>
        {categories.map((c) => (
          <label key={c._id}>
            <input
              type="radio"
              checked={category === c._id}
              onChange={() => setCategory(c._id)}
            />
            {c.name}
          </label>
        ))}
      </div>

      {/* PRICE */}
      <div className="section">
        <h4>Price</h4>
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* SORT */}
      <div className="section">
        <h4>Sort By</h4>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Latest</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price Low → High</option>
          <option value="price_desc">Price High → Low</option>
        </select>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button onClick={applyFilters} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Apply</button>
        <button onClick={resetFilters} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
          Reset
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 250px;
          padding: 20px;
          border-right: 1px solid #eee;
        }

        h3 {
          margin-bottom: 15px;
        }

        .section {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin: 5px 0;
          cursor: pointer;
        }

        input, select {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
        }

        .actions {
          display: flex;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}
