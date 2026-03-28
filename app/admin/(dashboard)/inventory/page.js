"use client";

import { useEffect, useState } from "react";

export default function InventoryAdmin() {
  const [warehouses, setWarehouses] = useState([]);
  const [skus, setSkus] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [form, setForm] = useState({
    skuId: "",
    warehouseId: "",
    qty: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /* ================= LOAD DATA (SAFE) ================= */
  async function loadData() {
    setLoading(true);

    try {
      // Load Warehouses
      try {
        const res = await fetch("/api/admin/warehouses");
        const json = await res.json();
        if (json.success) {
          setWarehouses(json.warehouses || []);
        } else {
          console.warn("Warehouse API failed");
        }
      } catch (err) {
        console.error("Warehouse fetch error:", err);
      }

      // Load SKUs (SAFE - may not exist yet)
      try {
        const res = await fetch("/api/admin/sku");
        const json = await res.json();
        if (json.success) {
          setSkus(json.skus || []);
        } else {
          console.warn("SKU API failed");
        }
      } catch (err) {
        console.warn("⚠ SKU API missing");
        setSkus([]); // prevent crash
      }

      // Load Inventory
      try {
        const res = await fetch("/api/admin/inventory/list");
        const json = await res.json();
        if (json.success) {
          setInventory(json.inventory || []);
        } else {
          console.warn("Inventory API failed");
        }
      } catch (err) {
        console.error("Inventory fetch error:", err);
      }

    } catch (err) {
      console.error("GLOBAL LOAD ERROR:", err);
      alert("❌ Failed to load data");
    }

    setLoading(false);
  }

  /* ================= ADD INVENTORY ================= */
  async function handleSubmit() {
    if (!form.skuId || !form.warehouseId || !form.qty) {
      alert("⚠ All fields required");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          qty: Number(form.qty),
        }),
      });

      const json = await res.json();

      if (json.success) {
        alert("✅ Inventory added successfully");
        setForm({ skuId: "", warehouseId: "", qty: "" });
        loadData();
      } else {
        alert(json.message || "Failed to add inventory");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    }

    setSubmitting(false);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Inventory...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Inventory Management
      </h1>

      {/* ================= ADD INVENTORY ================= */}
      <div style={card}>
        <h3>Add Inventory</h3>

        {/* ⚠ SHOW MESSAGE IF SKU MISSING */}
        {skus.length === 0 && (
          <p style={{ color: "red" }}>
            ⚠ No SKU found. Create SKU first.
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          
          {/* SKU */}
          <select
            value={form.skuId}
            onChange={(e) =>
              setForm({ ...form, skuId: e.target.value })
            }
          >
            <option value="">Select SKU</option>
            {skus.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name || s.code || "Unnamed SKU"}
              </option>
            ))}
          </select>

          {/* Warehouse */}
          <select
            value={form.warehouseId}
            onChange={(e) =>
              setForm({ ...form, warehouseId: e.target.value })
            }
          >
            <option value="">Select Warehouse</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>

          {/* Quantity */}
          <input
            type="number"
            placeholder="Quantity"
            value={form.qty}
            onChange={(e) =>
              setForm({ ...form, qty: e.target.value })
            }
          />

          <button
            onClick={handleSubmit}
            style={btn}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "➕ Add Stock"}
          </button>
        </div>
      </div>

      {/* ================= INVENTORY LIST ================= */}
      <div style={{ marginTop: 20 }}>
        <h3>📊 Inventory List</h3>

        {inventory.length === 0 ? (
          <p>No inventory found</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((i) => (
                <tr key={i._id}>
                  <td>{i.skuId?.name || "N/A"}</td>
                  <td>
                    {i.warehouseId?.name} ({i.warehouseId?.code})
                  </td>
                  <td>{i.qty}</td>
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
