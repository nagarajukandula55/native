"use client";

import { useEffect, useState } from "react";
import { adminLogisticsOverview } from "@/lib/an-sdk/shipping";

/**
 * "Logistics maintenance" tab -- previously there was no page for this at
 * all in native's admin. ANgroup already has a working
 * GET /api/logistics/overview (active shipments, warehouse count, courier
 * partners in use, average delivery time, recent shipments) backing its
 * own src/app/admin/logistics/page.tsx -- this reuses that same endpoint
 * via the service-key proxy rather than re-deriving the numbers.
 */
export default function LogisticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminLogisticsOverview();
      if (res.success) {
        setData(res);
      } else {
        setError(res.error || res.message || "Could not load logistics overview");
      }
    } catch (err) {
      setError(err?.message || "Could not load logistics overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading logistics overview...</p>;

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "#b91c1c" }}>{error}</p>
        <button onClick={load} style={btnStyle}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={statsGrid}>
        <StatCard label="Active Shipments" value={data.activeShipments} />
        <StatCard label="Warehouses" value={data.warehouseCount} />
        <StatCard label="Courier Partners in Use" value={data.courierPartnersInUse} />
        <StatCard
          label="Avg Delivery Time"
          value={data.avgDeliveryDays != null ? `${data.avgDeliveryDays} days` : "—"}
          sub="Last 30 days"
        />
      </div>

      <h3 style={{ margin: "24px 0 12px" }}>Recent Shipments</h3>

      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #eee" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={thStyle}>Invoice</th>
              <th style={thStyle}>Courier</th>
              <th style={thStyle}>AWB</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Shipped</th>
              <th style={thStyle}>Delivered</th>
            </tr>
          </thead>
          <tbody>
            {(data.recentShipments || []).length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "#888" }}>
                  No shipments yet
                </td>
              </tr>
            ) : (
              data.recentShipments.map((s) => (
                <tr key={s.orderId}>
                  <td style={tdStyle}>{s.invoiceNumber || "—"}</td>
                  <td style={tdStyle}>{s.courierPartner || "—"}</td>
                  <td style={tdStyle}>
                    {s.trackingUrl ? (
                      <a href={s.trackingUrl} target="_blank" rel="noreferrer">
                        {s.awbNumber}
                      </a>
                    ) : (
                      s.awbNumber || "—"
                    )}
                  </td>
                  <td style={tdStyle}>{s.trackingStatus || "—"}</td>
                  <td style={tdStyle}>{s.shippedAt ? new Date(s.shippedAt).toLocaleDateString() : "—"}</td>
                  <td style={tdStyle}>{s.deliveredAt ? new Date(s.deliveredAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
};

const thStyle = { textAlign: "left", padding: 12, fontSize: 12, color: "#6b7280", borderBottom: "1px solid #eee" };
const tdStyle = { padding: 12, fontSize: 13, borderBottom: "1px solid #f3f4f6" };
const btnStyle = {
  padding: "8px 16px",
  background: "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
