"use client";

import { useEffect, useState } from "react";
import {
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
} from "@/lib/an-sdk/vendors";
import { ApiError } from "@/lib/an-sdk/client";
import { logEvent } from "@/lib/eventLogger";

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", description: "" });
  const [editSaving, setEditSaving] = useState(false);

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
      logEvent("product_created", `Product "${form.name}" created`, { name: form.name, price: form.price });
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
      const target = products.find((p) => (p._id || p.id) === id);
      await deleteVendorProduct(id);
      logEvent("product_deleted", `Product "${target?.name || id}" deleted`, { id });
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't delete product");
    }
  }

  function startEdit(p) {
    const id = p._id || p.id;
    setEditingId(id);
    setEditForm({
      name: p.name || "",
      price: p.price ?? "",
      description: p.description || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleEditSave(e, id) {
    e.preventDefault();
    if (!editForm.name || !editForm.price) return;
    setEditSaving(true);
    try {
      const payload = {
        name: editForm.name,
        price: Number(editForm.price),
        description: editForm.description,
      };
      await updateVendorProduct(id, payload);
      logEvent("product_updated", `Product "${payload.name}" updated`, { id, ...payload });
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, ...payload } : p))
      );
      setEditingId(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't update product");
    } finally {
      setEditSaving(false);
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
          {products.map((p) => {
            const id = p._id || p.id;
            if (editingId === id) {
              return (
                <form className="formCard" key={id} onSubmit={(e) => handleEditSave(e, id)}>
                  <input
                    placeholder="Product name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input"
                  />
                  <input
                    placeholder="Price (₹)"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="input"
                  />
                  <textarea
                    placeholder="Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="input"
                    rows={3}
                  />
                  <div className="editActions">
                    <button className="btn" disabled={editSaving}>
                      {editSaving ? "Saving..." : "Save"}
                    </button>
                    <button type="button" className="cancel" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              );
            }
            return (
              <div className="row" key={id}>
                <div>
                  <p className="name">{p.name}</p>
                  <p className="price">₹{p.price}</p>
                </div>
                <div className="actions">
                  <button className="edit" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button className="del" onClick={() => handleDelete(id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
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
        .actions {
          display: flex;
          gap: 8px;
        }
        .edit {
          background: none;
          border: 1px solid #c28b45;
          color: #c28b45;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
        }
        .del {
          background: none;
          border: 1px solid #e11d48;
          color: #e11d48;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
        }
        .editActions {
          display: flex;
          gap: 10px;
        }
        .cancel {
          background: none;
          border: 1px solid #ddd;
          color: #555;
          padding: 10px 18px;
          border-radius: 30px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
