"use client";

import { useEffect, useState } from "react";

export default function CouponDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "flat",
    value: "",
    minCartValue: "",
    maxDiscount: "",
    usageLimit: "",
    expiry: "",
  });

  /* ================= FETCH ================= */
  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/coupons");
      const data = await res.json();

      if (res.ok && data.success) {
        setCoupons(data.coupons || []);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error("Fetch coupons error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/coupons/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minCartValue: Number(form.minCartValue || 0),
          maxDiscount: Number(form.maxDiscount || 0),
          usageLimit: Number(form.usageLimit || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to create coupon");
        return;
      }

      setForm({
        code: "",
        type: "flat",
        value: "",
        minCartValue: "",
        maxDiscount: "",
        usageLimit: "",
        expiry: "",
      });

      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert("Error creating coupon");
    }
  };

  /* ================= TOGGLE (FIXED DB SYNC) ================= */
  const toggleStatus = async (id, active) => {
    try {
      const res = await fetch("/api/coupons/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });

      const data = await res.json();

      if (res.ok && data.success !== false) {
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, active } : c
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= EXTEND EXPIRY ================= */
  const extendExpiry = async (id) => {
    const newDate = prompt("Enter new expiry date (YYYY-MM-DD)");

    if (!newDate) return;

    try {
      const res = await fetch("/api/coupons/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          expiry: newDate,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success !== false) {
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, expiry: newDate } : c
          )
        );
      } else {
        alert("Failed to extend expiry");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DELETE ================= */
  const deleteCoupon = async (id) => {
    try {
      const res = await fetch("/api/coupons/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok && data.success !== false) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>

      <h2 style={{ marginBottom: 20 }}>🎟️ Coupon Dashboard</h2>

      {/* CREATE CARD */}
      <div style={cardStyle}>
        <h3>Create Coupon</h3>

        <div style={grid}>
          <input placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="flat">Flat</option>
            <option value="percent">Percent</option>
          </select>

          <input placeholder="Value"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />

          <input placeholder="Min Cart"
            value={form.minCartValue}
            onChange={(e) => setForm({ ...form, minCartValue: e.target.value })}
          />

          <input placeholder="Max Discount"
            value={form.maxDiscount}
            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
          />

          <input placeholder="Usage Limit"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          />

          <input type="date"
            value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: e.target.value })}
          />
        </div>

        <button style={btnPrimary} onClick={handleCreate}>
          Create Coupon
        </button>
      </div>

      {/* LIST */}
      <h3 style={{ marginTop: 30 }}>All Coupons</h3>

      {loading && <p>Loading...</p>}
      {coupons.length === 0 && !loading && <p>No coupons found</p>}

      {coupons.map((c) => (
        <div key={c._id} style={couponCard}>

          <div>
            <h4 style={{ margin: 0 }}>{c.code}</h4>
            <p style={{ margin: 4 }}>
              {c.type.toUpperCase()} | Value: {c.value}
            </p>

            <p style={{ margin: 4 }}>
              Used: {c.usedBy?.length || 0}
            </p>

            <p style={{ margin: 4 }}>
              Expiry: {c.expiry ? new Date(c.expiry).toDateString() : "N/A"}
            </p>

            <span
              style={{
                padding: "4px 8px",
                background: c.active ? "green" : "red",
                color: "white",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              {c.active ? "ACTIVE" : "DISABLED"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>

            <button
              style={btn}
              onClick={() => toggleStatus(c._id, !c.active)}
            >
              {c.active ? "Disable" : "Enable"}
            </button>

            <button
              style={btn}
              onClick={() => extendExpiry(c._id)}
            >
              Extend
            </button>

            <button
              style={{ ...btn, background: "crimson", color: "white" }}
              onClick={() => deleteCoupon(c._id)}
            >
              Delete
            </button>

          </div>

        </div>
      ))}
    </div>
  );
}

/* ================= STYLES ================= */
const cardStyle = {
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 10,
  marginBottom: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
  marginBottom: 10,
};

const btnPrimary = {
  padding: "8px 12px",
  background: "black",
  color: "white",
  border: "none",
  borderRadius: 6,
};

const couponCard = {
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 12,
  marginBottom: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#fafafa",
};

const btn = {
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "white",
  cursor: "pointer",
};
