"use client";

import { useMemo } from "react";

export default function OrderTimeline({ order }) {
  const steps = useMemo(() => {
    return [
      {
        key: "PLACED",
        label: "Order Placed",
        time: order?.createdAt,
      },
      {
        key: "PAID",
        label: "Payment Confirmed",
        time: order?.payment?.paidAt,
      },
      {
        key: "PACKED",
        label: "Packed",
        time: order?.packedAt,
      },
      {
        key: "DISPATCHED",
        label: "Dispatched",
        time: order?.dispatchedAt,
      },
      {
        key: "OUT_FOR_DELIVERY",
        label: "Out for Delivery",
        time: order?.outForDeliveryAt,
      },
      {
        key: "DELIVERED",
        label: "Delivered",
        time: order?.deliveredAt,
      },
    ];
  }, [order]);

  const currentIndex = steps.findIndex(
    (s) => s.key === order?.status
  );

  return (
    <div style={{ padding: 20, border: "1px solid #eee", borderRadius: 12 }}>
      <h3 style={{ marginBottom: 16 }}>📦 Order Timeline</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((step, index) => {
          const isDone = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              {/* DOT */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  marginTop: 4,
                  background: isDone ? "#22c55e" : "#d1d5db",
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(34,197,94,0.2)"
                    : "none",
                }}
              />

              {/* CONTENT */}
              <div>
                <div style={{ fontWeight: 600 }}>
                  {step.label}
                </div>

                <div style={{ fontSize: 12, color: "#666" }}>
                  {step.time
                    ? new Date(step.time).toLocaleString()
                    : "Pending"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PROGRESS BAR */}
      <div
        style={{
          marginTop: 20,
          height: 6,
          background: "#eee",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((currentIndex + 1) / steps.length) * 100}%`,
            background: "#22c55e",
            transition: "0.3s",
          }}
        />
      </div>
    </div>
  );
}
