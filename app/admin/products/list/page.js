"use client";

import { useEffect, useState } from "react";

export default function ProductList() {

  const [products, setProducts] = useState([]);

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function toggleStatus(id, current) {
    const newStatus = current === "listed" ? "delisted" : "listed";

    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    loadProducts();
  }

  return (
    <div className="wrap">

      <h1>📦 Products</h1>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>
                <span className={`status ${p.status}`}>
                  {p.status}
                </span>
              </td>

              <td>
                {p.status === "approved" || p.status === "listed" ? (
                  <button onClick={() => toggleStatus(p._id, p.status)}>
                    {p.status === "listed" ? "Delist" : "List"}
                  </button>
                ) : (
                  <span>Waiting Approval</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .wrap { padding:20px; }
        table { width:100%; border-collapse:collapse; }
        th,td { padding:10px; border-bottom:1px solid #eee; }
        .status.review { color:orange; }
        .status.approved { color:green; }
        .status.listed { color:blue; }
        .status.delisted { color:red; }
      `}</style>

    </div>
  );
}
