"use client";

import { useEffect, useState } from "react";

export default function CouponDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    type: "flat",
    value: "",
    minCartValue: "",
    maxDiscount: "",
    usageLimit: "",
    expiry: "",
  });

  const fetchCoupons = async () => {
    const res = await fetch("/api/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    await fetch("/api/coupons/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

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
  };

  const toggleStatus = async (id, active) => {
    await fetch("/api/coupons/toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });

    fetchCoupons();
  };

  const deleteCoupon = async (id) => {
    await fetch("/api/coupons/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchCoupons();
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>🎟️ Coupon Dashboard</h2>

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
          placeholder="Max Discount (optional)"
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
