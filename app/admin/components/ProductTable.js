"use client";

import { useState } from "react";

export default function ProductTable({ products, onEdit, refresh }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (status ? p.status === status : true)
  );

  async function remove(id) {
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <div className="flex gap-4">
        <input
          placeholder="Search..."
          className="border p-2"
          onChange={e => setSearch(e.target.value)}
        />

        <select onChange={e => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="out_of_stock">Out</option>
        </select>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(p => (
            <tr key={p._id} className="border-b">
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>₹{p.sellingPrice}</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => onEdit(p)}>Edit</button>
                <button onClick={() => remove(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
