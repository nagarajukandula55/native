"use client";

import { useEffect, useState } from "react";

export default function InventoryAdmin() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    qty: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /* ===================== LOAD DATA ===================== */
  async function loadData() {
    setLoading(true);
    try {
      const [wRes, pRes, iRes] = await Promise.all([
        fetch("/api/admin/warehouses"),
        fetch("/api/admin/products"),
        fetch("/api/admin/inventory"),
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

  /* ===================== ADD / UPDATE INVENTORY ===================== */
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
        alert("✅ Stock added successfully");
        setForm({ productId: "", warehouseId: "", qty: "" });

        // Update frontend instantly
        const updatedInventory = inventory.filter(
          (i) =>
            !(
              i.productId._id === json.inventory.productId._id &&
              i.warehouseId._id === json.inventory.warehouseId._id
            )
        );
        setInventory([json.inventory, ...updatedInventory]);
      } else {
        alert(json.message || "❌ Failed to add stock");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    }

    setSubmitting(false);
  }

  if (loading)
    return (
      <h2 style={{ padding: 40, textAlign: "center" }}>Loading Inventory...</h2>
    );

  return (
    <div style={{ maxWidth: 1300, margin: "auto", padding: 20 }}>
      <h1 style={title}>📦 Inventory Management</h1>

      {/* ================= ADD INVENTORY ================= */}
      <div style={card}>
        <h3>Add / Update Stock</h3>

        {products.length === 0 && (
          <p style={{ color: "red" }}>
            ⚠ No products found. Please create products first.
          </p>
        )}

        <div style={formRow}>
          {/* Product */}
          <select
            value={form.productId}
            onChange={(e) =>
              setForm({ ...form, productId: e.target.value })
            }
            style={selectInput}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          {/* Warehouse */}
          <select
            value={form.warehouseId}
            onChange={(e) =>
              setForm({ ...form, warehouseId: e.target.value })
            }
            style={selectInput}
          >
            <option value="">Select Warehouse</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>

          {/* Qty */}
          <input
            type="number"
            placeholder="Quantity"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
            style={inputField}
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={btn}
          >
            {submitting ? "Adding..." : "➕ Add / Update Stock"}
          </button>
        </div>
      </div>

      {/* ================= INVENTORY TABLE ================= */}
      <div style={{ marginTop: 30 }}>
        <h3>📊 Current Inventory</h3>
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
                <tr key={`${i.productId._id}-${i.warehouseId._id}`}>
                  <td>{i.productId?.name || "N/A"}</td>
                  <td>{i.productId?.sku || "N/A"}</td>
                  <td>
                    {i.warehouseId?.name} ({i.warehouseId?.code})
                  </td>
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

const title = {
  fontSize: 28,
  fontWeight: "bold",
  marginBottom: 20,
};

const card = {
  background: "#fefefe",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const formRow = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
  marginTop: 10,
};

const selectInput = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  minWidth: 200,
};

const inputField = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  width: 120,
};

const btn = {
  padding: "10px 16px",
  background: "#1e40af",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 15,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

table.th = {
  background: "#f3f4f6",
  padding: "10px",
  textAlign: "left",
};

table.td = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
};
