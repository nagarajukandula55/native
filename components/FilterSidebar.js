"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { getCategories } from "@/lib/an-sdk/products";

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [categories, setCategories] = useState([]);
  // Below 900px the page stacks the sidebar above the product grid (see
  // ProductsPageClient's .page media query), but this component used to
  // keep its fixed 250px desktop width even then -- a cramped strip with
  // the rest of the row empty. Now it's a collapsed-by-default toggle on
  // mobile that expands to the full width; unaffected on desktop, where
  // this state is simply never read (CSS always shows .sidebar there).
  const [mobileOpen, setMobileOpen] = useState(false);

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
    setMobileOpen(false);
  }

  /* ================= RESET ================= */
  function resetFilters() {
    const search = searchParams.get("search");
    router.push(search ? `/products?search=${encodeURIComponent(search)}` : "/products");
    setMobileOpen(false);
  }

  return (
    <div className={`sidebar ${mobileOpen ? "mobileOpen" : ""}`}>
      <button type="button" className="mobileToggle" onClick={() => setMobileOpen((o) => !o)}>
        <span>
          <SlidersHorizontal size={16} /> Filters
        </span>
        {mobileOpen && <X size={16} />}
      </button>

      <div className="sidebarBody">
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
      </div>

      <style jsx>{`
        .sidebar {
          width: 250px;
          flex-shrink: 0;
          padding: 20px;
          border-right: 1px solid #eee;
        }

        .mobileToggle {
          display: none;
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
          box-sizing: border-box;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 100%;
            padding: 0;
            border-right: none;
            border-bottom: 1px solid #eee;
            margin-bottom: 16px;
          }

          .mobileToggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 12px 16px;
            background: #fafafa;
            border: 1px solid #eee;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
          }

          .mobileToggle span {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .sidebarBody {
            display: none;
            padding: 16px;
          }

          .sidebar.mobileOpen .sidebarBody {
            display: block;
          }

          .sidebar.mobileOpen .mobileToggle {
            border-radius: 10px 10px 0 0;
            border-bottom: none;
          }
        }
      `}</style>
    </div>
  );
}
