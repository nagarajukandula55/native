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
    await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    mutate(); // 🔥 instant refresh
  }

  async function deleteProduct(id) {
    if (!confirm("Delete product?")) return;

    await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    mutate(); // 🔥 instant refresh
  }

  /* ================= FILTER ================= */

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    if (filter === "review") return p.status === "review";
    if (filter === "approved") return p.status === "approved";
    if (filter === "listed") return p.isListed;
    if (filter === "delisted") return !p.isListed;
    return true;
  });

  return (
    <div className="wrap">
      <h1>📦 Product Management</h1>

      {/* FILTERS */}
      <div className="filters">
        {["all", "review", "approved", "listed", "delisted"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}>
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
              <tr><td colSpan="6">Loading...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="6">No products</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <b>{p.name}</b>
                    <br />
                    <small>{p.category}</small>
                  </td>

                  <td>{p.variant?.sku || "—"}</td>

                  <td>₹ {p.variant?.sellingPrice || 0}</td>

                  <td>
                    <span className={`status ${p.status}`}>
                      {p.status}
                    </span>
                  </td>

                  <td>{p.isListed ? "✅" : "❌"}</td>

                  <td>
                    {p.status === "review" && (
                      <>
                        <button onClick={() => updateProduct(p._id, "approve")}>
                          Approve
                        </button>
                        <button onClick={() => updateProduct(p._id, "reject")}>
                          Reject
                        </button>
                      </>
                    )}

                    {p.status === "approved" && !p.isListed && (
                      <button onClick={() => updateProduct(p._id, "list")}>
                        List
                      </button>
                    )}

                    {p.isListed && (
                      <button onClick={() => updateProduct(p._id, "delist")}>
                        Delist
                      </button>
                    )}

                    <button onClick={() => deleteProduct(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

      {/* STYLES */}
      <style jsx>{`
        .wrap {
          max-width: 1200px;
          margin: auto;
          padding: 20px;
        }

        h1 {
          margin-bottom: 20px;
        }

        .filters {
          margin-bottom: 15px;
        }

        .filters button {
          margin-right: 10px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
        }

        .tableWrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
        }

        th, td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          text-align: left;
        }

        th {
          background: #fafafa;
        }

        .actions button {
          margin: 3px;
          padding: 6px 10px;
          border: none;
          cursor: pointer;
          border-radius: 4px;
          background: #eee;
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
