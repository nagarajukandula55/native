"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminListNativeProducts, adminSetNativeProductFlags } from "@/lib/an-sdk/products";

const fetcher = () => adminListNativeProducts();

/**
 * Manages already-approved storefront products (ANgroup's NativeProduct
 * collection via /api/admin/native-products) -- isActive is the field that
 * actually controls storefront visibility, so "Live" here means
 * isActive:true. Pre-approval vendor submissions are a separate flow, see
 * app/admin/products/review/page.js. This page previously called a
 * nonexistent /api/admin/products endpoint and filtered on a fictional
 * `isListed` field that never existed on any real product, so the "Live"
 * (then "listed") tab always showed nothing even for genuinely live
 * products.
 */
export default function AdminProductsList() {
  const [filter, setFilter] = useState("all");

  const { data, isLoading, mutate } = useSWR(
    "admin-native-products-list",
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const products = data?.data || [];

  async function toggleLive(id, isActive) {
    try {
      await adminSetNativeProductFlags(id, { isActive: !isActive });
      mutate();
    } catch (err) {
      console.error("Toggle live error:", err);
    }
  }

  async function toggleFeatured(id, isFeatured) {
    try {
      await adminSetNativeProductFlags(id, { isFeatured: !isFeatured });
      mutate();
    } catch (err) {
      console.error("Toggle featured error:", err);
    }
  }

  async function deleteProduct(id) {
    if (!confirm("Remove this product from the storefront?")) return;

    try {
      await adminSetNativeProductFlags(id, { isDeleted: true });
      mutate();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  const filteredProducts = products.filter((p) => {
    switch (filter) {
      case "live":
        return p.isActive === true;
      case "hidden":
        return p.isActive === false;
      case "featured":
        return p.isFeatured === true;
      default:
        return true;
    }
  });

  return (
    <div className="wrap">
      <h1>📦 Product Management</h1>

      {/* FILTERS */}
      <div className="filters">
        {["all", "live", "hidden", "featured"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "active" : ""}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Live</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6">No products</td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <b>{p.name}</b>
                  </td>

                  <td>{p.sku || "—"}</td>

                  <td>₹ {p.basePrice || 0}</td>

                  <td>
                    <span className={`status ${p.isActive ? "live" : "hidden"}`}>
                      {p.isActive ? "Live" : "Hidden"}
                    </span>
                  </td>

                  <td>{p.isFeatured ? "⭐" : "—"}</td>

                  <td className="actions">
                    <button onClick={() => toggleLive(p._id, p.isActive)}>
                      {p.isActive ? "Hide" : "Make Live"}
                    </button>

                    <button onClick={() => toggleFeatured(p._id, p.isFeatured)}>
                      {p.isFeatured ? "Unfeature" : "Feature"}
                    </button>

                    <button className="delete" onClick={() => deleteProduct(p._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .wrap {
          max-width: 1200px;
          margin: auto;
          padding: 20px;
        }

        .filters button {
          margin-right: 10px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 6px;
          cursor: pointer;
        }

        .filters .active {
          background: #000;
          color: #fff;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
        }

        th,
        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #fafafa;
        }

        .actions button {
          margin: 3px;
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: #eee;
        }

        .delete {
          background: #333;
          color: #fff;
        }

        .status {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
        }

        .status.live {
          background: #d4edda;
        }

        .status.hidden {
          background: #f8d7da;
        }
      `}</style>
    </div>
  );
}
