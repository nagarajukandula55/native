"use client";

import { useEffect, useState } from "react";

export default function AdminProductsList() {

  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= ACTION ================= */

  async function updateProduct(id, action) {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      fetchProducts(); // refresh
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteProduct(id) {
    if (!confirm("Delete product?")) return;

    await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    fetchProducts();
  }

  /* ================= FILTER ================= */

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    if (filter === "review") return p.status === "review";
    if (filter === "approved") return p.status === "approved";
    if (filter === "listed") return p.isListed === true;
    if (filter === "delisted") return p.isListed === false;
    return true;
  });

  /* ================= UI ================= */

  return (
    <div className="wrap">

      <h1>📦 Product Management</h1>

      {/* FILTERS */}
      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("review")}>Review</button>
        <button onClick={() => setFilter("approved")}>Approved</button>
        <button onClick={() => setFilter("listed")}>Listed</button>
        <button onClick={() => setFilter("delisted")}>Delisted</button>
      </div>

      {/* TABLE */}
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>Price</th>
              <th>Status</th>
              <th>Listed</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="6">Loading...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="6">No products</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id}>
                  
                  {/* PRODUCT */}
                  <td>
                    <b>{p.name}</b>
                    <br />
                    <small>{p.category}</small>
                  </td>

                  {/* VARIANT */}
                  <td>{p.variant}</td>

                  {/* PRICE */}
                  <td>₹ {p.sellingPrice}</td>

                  {/* STATUS */}
                  <td>
                    <span className={`status ${p.status}`}>
                      {p.status}
                    </span>
                  </td>

                  {/* LIST */}
                  <td>
                    {p.isListed ? "✅ Listed" : "❌ Hidden"}
                  </td>

                  {/* ACTIONS */}
                  <td className="actions">

                    {/* APPROVE */}
                    {p.status === "review" && (
                      <button onClick={() => updateProduct(p._id, "approve")}>
                        ✅ Approve
                      </button>
                    )}

                    {/* REJECT */}
                    {p.status === "review" && (
                      <button onClick={() => updateProduct(p._id, "reject")}>
                        ❌ Reject
                      </button>
                    )}

                    {/* LIST */}
                    {p.status === "approved" && !p.isListed && (
                      <button onClick={() => updateProduct(p._id, "list")}>
                        🚀 List
                      </button>
                    )}

                    {/* DELIST */}
                    {p.isListed && (
                      <button onClick={() => updateProduct(p._id, "delist")}>
                        ⛔ Delist
                      </button>
                    )}

                    {/* DELETE */}
                    <button onClick={() => deleteProduct(p._id)}>
                      🗑 Delete
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
