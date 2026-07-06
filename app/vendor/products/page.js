"use client";

import { useEffect, useState } from "react";
import {
  getVendorProducts,
  createVendorProduct,
  deleteVendorProduct,
} from "@/lib/an-sdk/vendors";
import { ApiError } from "@/lib/an-sdk/client";

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    getVendorProducts()
      .then((data) => setProducts(data?.products || (Array.isArray(data) ? data : [])))
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load your products — this endpoint is pending on the AN group backend."
        );
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      await createVendorProduct({
        name: form.name,
        price: Number(form.price),
        description: form.description,
      });
      setForm({ name: "", price: "", description: "" });
      setShowForm(false);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't create product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteVendorProduct(id);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't delete product");
    }
  }

  return (
    <div>
      <div className="header">
        <h1>My Products</h1>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Add product"}
        </button>
      </div>

      {showForm && (
        <form className="formCard" onSubmit={handleCreate}>
          <input
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
          <input
            placeholder="Price (₹)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
            rows={3}
          />
          <button className="btn" disabled={saving}>
            {saving ? "Saving..." : "Save product"}
          </button>
        </form>
      )}

      {error && <p className="notice">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : !products.length ? (
        <p className="empty">You haven't listed any products yet.</p>
      ) : (
        <div className="list">
          {products.map((p) => (
            <div className="row" key={p._id || p.id}>
              <div>
                <p className="name">{p.name}</p>
                <p className="price">₹{p.price}</p>
              </div>
              <button className="del" onClick={() => handleDelete(p._id || p.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .btn {
          padding: 10px 20px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn:disabled {
          opacity: 0.7;
        }
        .formCard {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 420px;
        }
        .input {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-family: inherit;
          font-size: 14px;
        }
        .notice {
          background: #fff8ec;
          border: 1px solid #f2d9ad;
          color: #8a5a12;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .empty {
          color: #888;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .row {
          background: #fff;
          border-radius: 10px;
          padding: 14px 18px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .name {
          margin: 0;
          font-weight: 600;
        }
        .price {
          margin: 2px 0 0;
          color: #c28b45;
          font-weight: 600;
        }
        .del {
          background: none;
          border: 1px solid #e11d48;
          color: #e11d48;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
