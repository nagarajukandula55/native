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
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /* ================= LOAD DATA ================= */
  async function loadData() {
    setLoading(true);
    setUnauthorized(false);

    try {
      // Fetch Warehouses
      const wRes = await fetch("/api/admin/warehouses");
      if (wRes.status === 401) throw new Error("Unauthorized");
      const wJson = await wRes.json();
      setWarehouses(Array.isArray(wJson.warehouses) ? wJson.warehouses : []);

      // Fetch Products
      const pRes = await fetch("/api/admin/products");
      if (pRes.status === 401) throw new Error("Unauthorized");
      const pJson = await pRes.json();
      setProducts(Array.isArray(pJson.products) ? pJson.products : []);

      // Fetch Inventory
      const iRes = await fetch("/api/admin/inventory/list");
      if (iRes.status === 401) throw new Error("Unauthorized");
      const iJson = await iRes.json();
      setInventory(Array.isArray(iJson.inventory) ? iJson.inventory : []);

    } catch (err) {
      console.error("Load Data Error:", err);
      if (err.message.includes("Unauthorized")) {
        setUnauthorized(true);
      } else {
        alert("❌ Failed to load inventory data");
      }
    }

    setLoading(false);
  }

  /* ================= ADD INVENTORY ================= */
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

      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }

      const json = await res.json();
      if (json.success) {
        alert("✅ Inventory added successfully");
        setForm({ productId: "", warehouseId: "", qty: "" });
        loadData();
      } else {
        alert(json.message || "❌ Failed to add inventory");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    }

    setSubmitting(false);
  }

  /* ================= RENDER ================= */
  if (loading) return <h2 style={{ padding: 40 }}>Loading Inventory...</h2>;

  if (unauthorized) return (
    <div style={{ padding: 40, textAlign: "center", color: "red" }}>
      ⚠ You are not authorized to view this page. Please log in as Admin.
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Inventory Management
      </h1>

      {/* ================= ADD INVENTORY ================= */}
      <div style={card}>
        <h3>Add Inventory</h3>

        {products.length === 0 && (
          <p style={{ color: "red" }}>
            ⚠ No products found. Create products first.
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* PRODUCT */}
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name || p.sku || "Unnamed Product"}
              </option>
            ))}
          </select>

          {/* WAREHOUSE */}
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

          {/* QTY */}
          <input
            type="number"
            placeholder="Quantity"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
          />

          <button onClick={handleSubmit} style={btn} disabled={submitting}>
            {submitting ? "Adding..." : "➕ Add Stock"}
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
