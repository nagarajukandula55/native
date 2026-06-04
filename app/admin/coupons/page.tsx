"use client";

import { useEffect, useState } from "react";

type CouponType = {
  _id: string;
  code: string;
  type: string;
  value: number;

  minCartValue?: number;
  maxDiscount?: number;

  usageLimit?: number;

  usedCount?: number;   // ← ADD THIS

  usedBy?: string[];

  active: boolean;

  expiry?: string;

  createdAt?: string;
  updatedAt?: string;
};

export default function CouponDashboard() {
  const [coupons, setCoupons] =
    useState<CouponType[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "flat",
    value: "",
    minCartValue: "",
    maxDiscount: "",
    usageLimit: "",
    expiry: "",
  });

  /* =========================================================
     FETCH COUPONS
  ========================================================= */

  const fetchCoupons =
    async () => {
      try {
        setLoading(true);

        const res =
          await fetch(
            "/api/coupons"
          );

        let data: any;

        try {
          data =
            await res.json();
        } catch {
          throw new Error(
            "Invalid response"
          );
        }

        if (
          res.ok &&
          data.success
        ) {
          setCoupons(
            data.coupons || []
          );
        } else {
          setCoupons([]);
        }

      } catch (err) {
        console.error(
          "FETCH COUPONS ERROR:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* =========================================================
     CREATE COUPON
  ========================================================= */

  const handleCreate =
    async () => {
      try {
        if (!form.code) {
          alert(
            "Coupon code required"
          );
          return;
        }

        setCreating(true);

        const res =
          await fetch(
            "/api/coupons/create",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                ...form,

                code:
                  form.code.toUpperCase(),

                value: Number(
                  form.value || 0
                ),

                minCartValue:
                  Number(
                    form.minCartValue ||
                      0
                  ),

                maxDiscount:
                  Number(
                    form.maxDiscount ||
                      0
                  ),

                usageLimit:
                  Number(
                    form.usageLimit ||
                      0
                  ),
              }),
            }
          );

        let data: any;

        try {
          data =
            await res.json();
        } catch {
          throw new Error(
            "Invalid API response"
          );
        }

        if (
          !res.ok ||
          !data.success
        ) {
          alert(
            data.message ||
              "Failed to create coupon"
          );
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

        await fetchCoupons();

      } catch (err) {
        console.error(err);

        alert(
          "Error creating coupon"
        );
      } finally {
        setCreating(false);
      }
    };

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const toggleStatus =
    async (
      id: string,
      active: boolean
    ) => {
      try {
        const res =
          await fetch(
            "/api/coupons/toggle",
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                id,
                active,
              }),
            }
          );

        const data =
          await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          alert(
            data.message ||
              "Update failed"
          );

          return;
        }

        await fetchCoupons();

      } catch (err) {
        console.error(err);
      }
    };

  /* =========================================================
     EXTEND EXPIRY
  ========================================================= */

  const extendExpiry =
    async (id: string) => {
      const newDate =
        prompt(
          "Enter expiry date (YYYY-MM-DD)"
        );

      if (!newDate) return;

      try {
        const res =
          await fetch(
            "/api/coupons/toggle",
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                id,
                expiry: newDate,
              }),
            }
          );

        const data =
          await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          alert(
            data.message ||
              "Failed"
          );

          return;
        }

        await fetchCoupons();

      } catch (err) {
        console.error(err);
      }
    };

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteCoupon =
    async (id: string) => {
      const confirmDelete =
        confirm(
          "Delete this coupon permanently?"
        );

      if (!confirmDelete)
        return;

      try {
        const res =
          await fetch(
            "/api/coupons/delete",
            {
              method: "DELETE",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                id,
              }),
            }
          );

        const data =
          await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          alert(
            data.message ||
              "Delete failed"
          );

          return;
        }

        await fetchCoupons();

      } catch (err) {
        console.error(err);
      }
    };

  return (
    <div
      style={{
        padding: 24,
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          marginBottom: 20,
        }}
      >
        🎟️ Coupon Dashboard
      </h2>

      {/* =====================================================
          CREATE
      ===================================================== */}

      <div style={cardStyle}>
        <h3>Create Coupon</h3>

        <div style={grid}>
          <input
            placeholder="Code"
            value={form.code}
            onChange={(e) =>
              setForm({
                ...form,
                code:
                  e.target.value,
              })
            }
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type:
                  e.target.value,
              })
            }
          >
            <option value="flat">
              Flat
            </option>

            <option value="percent">
              Percent
            </option>
          </select>

          <input
            placeholder="Value"
            value={form.value}
            onChange={(e) =>
              setForm({
                ...form,
                value:
                  e.target.value,
              })
            }
          />

          <input
            placeholder="Min Cart"
            value={
              form.minCartValue
            }
            onChange={(e) =>
              setForm({
                ...form,
                minCartValue:
                  e.target.value,
              })
            }
          />

          <input
            placeholder="Max Discount"
            value={
              form.maxDiscount
            }
            onChange={(e) =>
              setForm({
                ...form,
                maxDiscount:
                  e.target.value,
              })
            }
          />

          <input
            placeholder="Usage Limit"
            value={
              form.usageLimit
            }
            onChange={(e) =>
              setForm({
                ...form,
                usageLimit:
                  e.target.value,
              })
            }
          />

          <input
            type="date"
            value={form.expiry}
            onChange={(e) =>
              setForm({
                ...form,
                expiry:
                  e.target.value,
              })
            }
          />
        </div>

        <button
          style={btnPrimary}
          onClick={
            handleCreate
          }
          disabled={
            creating
          }
        >
          {creating
            ? "Creating..."
            : "Create Coupon"}
        </button>
      </div>

      {/* =====================================================
          LIST
      ===================================================== */}

      <h3
        style={{
          marginTop: 30,
        }}
      >
        All Coupons
      </h3>

      {loading && (
        <p>Loading...</p>
      )}

      {!loading &&
        coupons.length ===
          0 && (
          <p>
            No coupons found
          </p>
        )}

      {coupons.map((c) => (
        <div
          key={c._id}
          style={couponCard}
        >
          <div>
            <h4
              style={{
                margin: 0,
              }}
            >
              {c.code}
            </h4>

            <p style={{ margin: 4 }}>
              {c.type.toUpperCase()} |
              Value: {c.value}
            </p>

            <p style={{ margin: 4 }}>
              Used:
              {c.usedCount || 0}
            </p>
            
            <p style={{ margin: 4 }}>
              Remaining:
              {c.usageLimit > 0
                ? c.usageLimit -
                  (c.usedCount || 0)
                : "Unlimited"}
            </p>

            <p style={{ margin: 4 }}>
              Expiry:{" "}
              {c.expiry
                ? new Date(
                    c.expiry
                  ).toDateString()
                : "N/A"}
            </p>

            <span
              style={{
                padding:
                  "4px 8px",

                background:
                  c.active
                    ? "green"
                    : "red",

                color: "white",

                borderRadius: 6,

                fontSize: 12,
              }}
            >
              {c.active
                ? "ACTIVE"
                : "DISABLED"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              style={btn}
              onClick={() =>
                toggleStatus(
                  c._id,
                  !c.active
                )
              }
            >
              {c.active
                ? "Disable"
                : "Enable"}
            </button>

            <button
              style={btn}
              onClick={() =>
                extendExpiry(
                  c._id
                )
              }
            >
              Extend
            </button>

            <button
              style={{
                ...btn,
                background:
                  "crimson",
                color: "white",
              }}
              onClick={() =>
                deleteCoupon(
                  c._id
                )
              }
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const cardStyle = {
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 12,
  marginBottom: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
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
  justifyContent:
    "space-between",
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
