"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminProductsList() {
  const [filter, setFilter] = useState("all");

  const { data, isLoading, mutate } = useSWR(
    "/api/admin/products",
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const products = data?.products || [];

  /* ================= ACTION ================= */

  async function updateProduct(id, action) {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      mutate();
    } catch (err) {
      console.error("Update error:", err);
    }
  }

  async function deleteProduct(id) {
    if (!confirm("Delete product?")) return;

    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      mutate();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  /* ================= FILTER ================= */

  const filteredProducts = products.filter((p) => {
    switch (filter) {
      case "review":
        return p.status === "review";
      case "approved":
        return p.status === "approved";
      case "listed":
        return p.isListed === true;
      case "delisted":
        return p.isListed === false;
      default:
        return true;
    }
  });

  return (
    <div className="wrap">
      <h1>📦 Product Management</h1>

      {/* FILTERS */}
      <div className="filters">
        {["all", "review", "approved", "listed", "delisted"].map((f) => (
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
              <th>Status</th>
              <th>Listed</th>
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

                  {/* PRODUCT */}
                  <td>
                    <b>{p.name}</b>
                    <br />
                    <small>{p.category}</small>
                  </td>

                  {/* SKU */}
                  <td>{p.primaryVariant?.sku || "—"}</td>

                  {/* PRICE */}
                  <td>₹ {p.primaryVariant?.sellingPrice || 0}</td>

                  {/* STATUS */}
                  <td>
                    <span className={`status ${p.status}`}>
                      {p.status}
                    </span>
                  </td>

                  {/* LISTED */}
                  <td>{p.isListed ? "✅" : "❌"}</td>

                  {/* ACTIONS */}
                  <td className="actions">

                    {/* REVIEW */}
                    {p.status === "review" && (
                      <>
                        <button
                          className="approve"
                          onClick={() => updateProduct(p._id, "approve")}
                        >
                          Approve
                        </button>

                        <button
                          className="reject"
                          onClick={() => updateProduct(p._id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* APPROVED → LIST */}
                    {p.status === "approved" && !p.isListed && (
                      <button onClick={() => updateProduct(p._id, "list")}>
                        List
                      </button>
                    )}

                    {/* LISTED → DELIST */}
                    {p.isListed && (
                      <button onClick={() => updateProduct(p._id, "delist")}>
                        Delist
                      </button>
                    )}

                    {/* DELETE */}
                    <button
                      className="delete"
                      onClick={() => deleteProduct(p._id)}
                    >
                      Delete
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
        }

        .approve {
          background: #28a745;
          color: #fff;
        }

        .reject {
          background: #dc3545;
          color: #fff;
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

        .status.review {
          background: #fff3cd;
        }

        .status.approved {
          background: #d4edda;
        }

        .status.rejected {
          background: #f8d7da;
        }
      `}</style>
    </div>
  );
}
