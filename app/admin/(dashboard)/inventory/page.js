"use client";

import { useEffect, useState } from "react";

export default function InventoryAdmin() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    qty: "",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [wRes, pRes, iRes] = await Promise.all([
        fetch("/api/admin/warehouses"),
        fetch("/api/admin/products"),
        fetch("/api/admin/inventory/list"),
      ]);

      const wJson = await wRes.json();
      const pJson = await pRes.json();
      const iJson = await iRes.json();

      setWarehouses(wJson.warehouses || []);
      setProducts(pJson.products || []);
      setInventory(iJson.inventory || []);
    } catch (err) {
      console.error("LOAD DATA ERROR:", err);
      alert("❌ Failed to load inventory data");
    }
    setLoading(false);
  }

  // ================= ADD / UPDATE INVENTORY =================
  async function handleSubmit() {
    if (!form.productId || !form.warehouseId || !form.qty) {
      alert("⚠ All fields required");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          warehouseId: form.warehouseId,
          qty: Number(form.qty),
        }),
      });

      const json = await res.json();

      if (json.success) {
        // ✅ Update inventory list instantly
        const existingIndex = inventory.findIndex(
          (i) =>
            i.productId._id === form.productId &&
            i.warehouseId._id === form.warehouseId
        );

        if (existingIndex >= 0) {
          // Update existing
          const updatedInventory = [...inventory];
          updatedInventory[existingIndex] = json.inventory;
          setInventory(updatedInventory);
        } else {
          // Add new
          setInventory([json.inventory, ...inventory]);
        }

        alert("✅ Stock added successfully");
        setForm({ productId: "", warehouseId: "", qty: "" });
      } else {
        alert(json.message || "❌ Failed to add stock");
      }
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("❌ Server error");
    }

    setSubmitting(false);
  }

  if (loading)
    return <h2 style={{ padding: 40 }}>Loading Inventory Dashboard...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Inventory Management
      </h1>

      {/* ================= ADD INVENTORY ================= */}
      <div style={card}>
        <h3>Add / Update Stock</h3>

        {products.length === 0 && (
          <p style={{ color: "red" }}>⚠ No products found. Create products first.</p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          <select
            value={form.warehouseId}
            onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
          >
            <option value="">Select Warehouse</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
          />

          <button onClick={handleSubmit} style={btn} disabled={submitting}>
            {submitting ? "Adding..." : "➕ Add / Update Stock"}
          </button>
        </div>
      </div>

      {/* ================= INVENTORY TABLE ================= */}
      <div style={{ marginTop: 20 }}>
        <h3>📊 Inventory List</h3>

        {inventory.length === 0 ? (
          <p>No inventory found</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Shipped</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((i) => (
                <tr key={i._id}>
                  <td>{i.productId?.name || "N/A"}</td>
                  <td>{i.productId?.sku || "N/A"}</td>
                  <td>{i.warehouseId?.name} ({i.warehouseId?.code})</td>
                  <td>{i.availableQty}</td>
                  <td>{i.reservedQty}</td>
                  <td>{i.shippedQty}</td>
                  <td>{i.totalQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const card = {
  background: "#f9fafb",
  padding: 15,
  borderRadius: 10,
  marginTop: 20,
};

const btn = {
  padding: "8px 12px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
};
