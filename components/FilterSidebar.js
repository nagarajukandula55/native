"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  /* ================= LOAD FROM URL ================= */
  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSort(searchParams.get("sort") || "");
  }, [searchParams]);

  /* ================= APPLY FILTER ================= */
  function applyFilters() {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);

    router.push(`/products?${params.toString()}`);
  }

  /* ================= RESET ================= */
  function resetFilters() {
    router.push("/products");
  }

  const categories = [
    "Instant Mixes",
    "Spices & Masalas",
    "Cold Pressed Oils",
    "Flours & Millets",
    "Ready to Cook",
    "Ready to Eat",
    "Pickles & Chutneys",
    "Snacks & Namkeen",
  ];

  return (
    <div className="sidebar">
      <h3>Filters</h3>

      {/* CATEGORY */}
      <div className="section">
        <h4>Category</h4>
        {categories.map((c) => (
          <label key={c}>
            <input
              type="radio"
              checked={category === c}
              onChange={() => setCategory(c)}
            />
            {c}
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
          <option value="price_asc">Price Low → High</option>
          <option value="price_desc">Price High → Low</option>
        </select>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button onClick={applyFilters}>Apply</button>
        <button onClick={resetFilters} className="reset">
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

        button {
          flex: 1;
          padding: 10px;
          border: none;
          background: black;
          color: white;
          cursor: pointer;
        }

        .reset {
          background: #ccc;
          color: black;
        }
      `}</style>
    </div>
  );
}
