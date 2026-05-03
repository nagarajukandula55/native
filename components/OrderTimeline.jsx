"use client";

const steps = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "ASSIGNED_TO_WH",
  "SHIPPED",
  "DELIVERED",
];

const labels = {
  PENDING: "Order Placed",
  PAID: "Payment Received",
  PROCESSING: "Processing",
  ASSIGNED_TO_WH: "Warehouse Assigned",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

export default function OrderTimeline({ order }) {
  const currentIndex = steps.indexOf(order.status);

  return (
    <div style={{ padding: 10 }}>
      {steps.map((step, index) => {
        const done = index <= currentIndex;

        return (
          <div key={step} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            {/* DOT */}
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: done ? "#22c55e" : "#d1d5db",
                marginTop: 5,
                transition: "0.3s",
              }}
            />

            {/* LINE + TEXT */}
            <div>
              <div style={{ fontWeight: done ? 700 : 400 }}>
                {labels[step]}
              </div>
              {done && (
                <small style={{ color: "#666" }}>
                  Completed
                </small>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
