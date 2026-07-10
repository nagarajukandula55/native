"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

/** Storefront search box — used in the navbar and at the top of the
 *  products listing. Submitting pushes to /products?search=... so the
 *  products page (which already reads searchParams) picks it up.
 *  Takes `defaultValue` instead of reading useSearchParams itself so it
 *  can be dropped into the navbar without forcing the whole layout into
 *  a Suspense boundary. */
export default function SearchBar({ className = "", defaultValue = "" }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`searchBar ${className}`}>
      <Search size={16} />
      <input
        type="search"
        placeholder="Search products..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <style jsx>{`
        .searchBar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f2f2f2;
          border-radius: 20px;
          padding: 6px 14px;
        }

        input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          width: 100%;
        }
      `}</style>
    </form>
  );
}
