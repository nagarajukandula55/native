"use client";

import { useEffect, useState } from "react";
import { getVendorDashboardStats, getVendorProfile } from "@/lib/an-sdk/vendors";

export default function VendorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([getVendorDashboardStats(), getVendorProfile()]).then(
      ([statsRes, profileRes]) => {
        if (cancelled) return;
        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        if (profileRes.status === "fulfilled") setProfile(profileRes.value);
        if (statsRes.status === "rejected" && profileRes.status === "rejected") {
          setError("Couldn't load your dashboard yet — this endpoint is pending on the AN group backend.");
        }
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? "—" },
    { label: "Revenue", value: stats?.revenue != null ? `₹${stats.revenue}` : "—" },
    { label: "Products Listed", value: stats?.productCount ?? "—" },
    { label: "Pending Payout", value: stats?.pendingPayout != null ? `₹${stats.pendingPayout}` : "—" },
  ];

  return (
    <div>
      <h1>Vendor Dashboard</h1>
      <p className="sub">
        {profile?.businessName ? `Welcome back, ${profile.businessName}.` : "Welcome to your vendor dashboard."}
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && <p className="notice">{error}</p>}

          <div className="grid">
            {cards.map((c) => (
              <div className="card" key={c.label}>
                <p className="value">{c.value}</p>
                <p className="label">{c.label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        h1 {
          margin-bottom: 4px;
        }
        .sub {
          color: #888;
          margin-bottom: 24px;
        }
        .notice {
          background: #fff8ec;
          border: 1px solid #f2d9ad;
          color: #8a5a12;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        .value {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #c28b45;
        }
        .label {
          margin: 0;
          color: #888;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
