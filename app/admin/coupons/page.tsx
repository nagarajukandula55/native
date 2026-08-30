"use client";

import { useEffect, useState } from "react";
import {
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "@/lib/an-sdk/coupons";

// Matches ANgroup's real Coupon schema (src/models/Coupon.ts) -- the
// previous version of this page assumed a fictional shape
// (type/value/active/expiry/usedCount) that never matched any real backend.
type CouponType = {
  _id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;

  minOrderValue?: number;
  maxDiscountAmount?: number;

  usageLimit?: number;
  usageCount?: number;

  status: "ACTIVE" | "PAUSED" | "EXPIRED" | string;

  validFrom?: string;
  validUntil?: string;

  createdAt?: string;
  updatedAt?: string;
};

export default function CouponDashboard() {
  const [coupons, setCoupons] = useState<CouponType[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    usageLimit: "",
    validUntil: "",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data: any = await adminListCoupons();
      setCoupons(data.success ? data.coupons || [] : []);
    } catch (err) {
      console.error("FETCH COUPONS ERROR:", err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    try {
      if (!form.code) {
        alert("Coupon code required");
        return;
      }

      setCreating(true);

      const data: any = await adminCreateCoupon({
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue || 0),
        minOrderValue: Number(form.minOrderValue || 0),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        validUntil: form.validUntil || undefined,
      });

      if (!data.success) {
        alert(data.error || data.message || "Failed to create coupon");
        return;
      }

      setForm({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderValue: "",
        maxDiscountAmount: "",
        usageLimit: "",
        validUntil: "",
      });

      await fetchCoupons();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Error creating coupon");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
      const data: any = await adminUpdateCoupon(id, { status: nextStatus });
      if (!data.success) {
        alert(data.error || data.message || "Update failed");
        return;
      }
      await fetchCoupons();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Update failed");
    }
  };

  const extendExpiry = async (id: string) => {
    const newDate = prompt("Enter new expiry date (YYYY-MM-DD)");
    if (!newDate) return;

    try {
      const data: any = await adminUpdateCoupon(id, { validUntil: newDate });
      if (!data.success) {
        alert(data.error || data.message || "Failed");
        return;
      }
      await fetchCoupons();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed");
    }
  };

  const deleteCoupon = async (id: string) => {
    const confirmDelete = confirm("Delete this coupon permanently?");
    if (!confirmDelete) return;

    try {
      const data: any = await adminDeleteCoupon(id);
      if (!data.success) {
        alert(data.error || data.message || "Delete failed");
        return;
      }
      await fetchCoupons();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: 20 }}>🎟️ Coupon Dashboard</h2>

      <div style={cardStyle}>
        <h3>Create Coupon</h3>

        <div style={grid}>
          <input
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed</option>
          </select>

          <input
            placeholder="Discount Value"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
          />

          <input
            placeholder="Min Order Value"
            value={form.minOrderValue}
            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
          />

          <input
            placeholder="Max Discount Amount"
            value={form.maxDiscountAmount}
            onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
          />

          <input
            placeholder="Usage Limit"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          />

          <input
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
          />
        </div>

        <button style={btnPrimary} onClick={handleCreate} disabled={creating}>
          {creating ? "Creating..." : "Create Coupon"}
        </button>
      </div>

      <h3 style={{ marginTop: 30 }}>All Coupons</h3>

      {loading && <p>Loading...</p>}
      {!loading && coupons.length === 0 && <p>No coupons found</p>}

      {coupons.map((c) => (
        <div key={c._id} style={couponCard}>
          <div>
            <h4 style={{ margin: 0 }}>{c.code}</h4>

            <p style={{ margin: 4 }}>
              {c.discountType} | Value: {c.discountValue}
            </p>

            <p style={{ margin: 4 }}>Used: {c.usageCount || 0}</p>

            <p style={{ margin: 4 }}>
              Remaining: {c.usageLimit ? c.usageLimit - (c.usageCount || 0) : "Unlimited"}
            </p>

            <p style={{ margin: 4 }}>
              Expiry: {c.validUntil ? new Date(c.validUntil).toDateString() : "N/A"}
            </p>

            <span
              style={{
                padding: "4px 8px",
                background: c.status === "ACTIVE" ? "green" : "red",
                color: "white",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              {c.status}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={btn} onClick={() => toggleStatus(c._id, c.status)}>
              {c.status === "ACTIVE" ? "Disable" : "Enable"}
            </button>

            <button style={btn} onClick={() => extendExpiry(c._id)}>
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

const cardStyle = {
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 12,
  marginBottom: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 10,
  marginBottom: 14,
};

const btnPrimary = {
  padding: "10px 14px",
  background: "black",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const couponCard = {
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 12,
  marginBottom: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap" as const,
  background: "#fafafa",
};

const btn = {
  padding: "8px 12px",
  border: "1px solid #ccc",
  borderRadius: 8,
  background: "white",
  cursor: "pointer",
};
