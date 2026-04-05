"use client";

import { useEffect, useState } from "react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    type: "ADD",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadInventory();
    loadWarehouses();
    loadProducts();
  }, []);

  async function loadInventory() {
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.success) setInventory(data.inventory);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function loadWarehouses() {
    const res = await fetch("/api/admin/warehouses");
    const data = await res.json();
    if (data.success) setWarehouses(data.warehouses);
  }

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  }

  /* ================= HANDLE CHANGE ================= */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.productId || !form.warehouseId || !form.quantity) {
      return alert("All fields required");
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          warehouseId: form.warehouseId,
          quantity: Number(form.quantity),
          type: form.type,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
      } else {
        alert("✅ Inventory updated");
        setForm({
          productId: "",
          warehouseId: "",
          quantity: "",
          type: "ADD",
        });
        loadInventory();
      }
    } catch (err) {
      console.error(err);
      alert("Error updating inventory");
    }

    setSaving(false);
  }

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Inventory Management
      </h1>

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 10,
          border: "1px solid #eee",
          padding: 20,
          borderRadius: 10,
        }}
      >
        {/* PRODUCT */}
        <select
          name="productId"
          value={form.productId}
          onChange={handleChange}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>

        {/* WAREHOUSE */}
        <select
          name="warehouseId"
          value={form.warehouseId}
          onChange={handleChange}
        >
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        {/* TYPE */}
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="ADD">Add Stock</option>
          <option value="REMOVE">Remove Stock</option>
        </select>

        {/* QUANTITY */}
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
        />

        <button
          disabled={saving}
          style={{
            gridColumn: "span 4",
            padding: 12,
            background: "#1e40af",
            color: "#fff",
            borderRadius: 6,
          }}
        >
          {saving ? "Saving..." : "Update Inventory"}
        </button>
      </form>

      {/* ================= TABLE ================= */}
      {loading ? (
        <p style={{ marginTop: 20 }}>Loading...</p>
      ) : (
        <div style={{ marginTop: 30 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th>Product</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Shipped</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((inv) => (
                <tr key={inv._id} style={{ textAlign: "center" }}>
                  <td>{inv.productId?.name}</td>
                  <td>{inv.productId?.sku}</td>
                  <td>{inv.warehouseId?.name}</td>
                  <td>{inv.availableQty}</td>
                  <td>{inv.reservedQty}</td>
                  <td>{inv.shippedQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
