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

  /* ================= FETCH COUPONS ================= */
  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/coupons");
      const data = await res.json();

      if (data.success) {
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

  /* ================= CREATE COUPON ================= */
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

      if (!data.success) {
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
      alert("Coupon Created");
    } catch (err) {
      console.error(err);
      alert("Error creating coupon");
    }
  };

  /* ================= TOGGLE ================= */
  const toggleStatus = async (id, active) => {
    try {
      await fetch("/api/coupons/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });

      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DELETE ================= */
  const deleteCoupon = async (id) => {
    try {
      await fetch("/api/coupons/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>🎟️ Coupon Dashboard</h2>

      {loading && <p>Loading...</p>}

      {/* CREATE COUPON */}
      <div style={{ marginBottom: 20 }}>
        <h3>Create Coupon</h3>

        <input
          placeholder="Code"
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

        <input
          placeholder="Value"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
        />

        <input
          placeholder="Min Cart Value"
          value={form.minCartValue}
          onChange={(e) =>
            setForm({ ...form, minCartValue: e.target.value })
          }
        />

        <input
          placeholder="Max Discount"
          value={form.maxDiscount}
          onChange={(e) =>
            setForm({ ...form, maxDiscount: e.target.value })
          }
        />

        <input
          placeholder="Usage Limit"
          value={form.usageLimit}
          onChange={(e) =>
            setForm({ ...form, usageLimit: e.target.value })
          }
        />

        <input
          type="date"
          value={form.expiry}
          onChange={(e) => setForm({ ...form, expiry: e.target.value })}
        />

        <button onClick={handleCreate}>Create Coupon</button>
      </div>

      {/* LIST */}
      <h3>All Coupons</h3>

      {coupons.length === 0 && <p>No coupons found</p>}

      {coupons.map((c) => (
        <div
          key={c._id}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <b>{c.code}</b> ({c.type}) - {c.value}

          <div>Used: {c.usedBy?.length || 0}</div>
          <div>Status: {c.active ? "Active" : "Disabled"}</div>

          <button onClick={() => toggleStatus(c._id, !c.active)}>
            {c.active ? "Disable" : "Enable"}
          </button>

          <button onClick={() => deleteCoupon(c._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
