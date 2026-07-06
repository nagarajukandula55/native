"use client";

import { useEffect, useState } from "react";
import {
  adminListVendors,
  adminApproveVendor,
  adminRejectVendor,
  adminSuspendVendor,
  adminReinstateVendor,
} from "@/lib/an-sdk/vendors";
import { ApiError } from "@/lib/an-sdk/client";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminVendorsPage() {
  const [tab, setTab] = useState("pending");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    adminListVendors({ status: tab })
      .then((data) => setVendors(data?.vendors || (Array.isArray(data) ? data : [])))
      .catch((err) => {
        setVendors([]);
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load vendors — this endpoint is pending on the AN group backend."
        );
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [tab]);

  async function handleAction(id, action) {
    setBusyId(id);
    try {
      if (action === "approve") await adminApproveVendor(id);
      if (action === "reject") await adminRejectVendor(id, "Not a fit at this time");
      if (action === "suspend") await adminSuspendVendor(id, "Policy violation");
      if (action === "reinstate") await adminReinstateVendor(id);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1>Vendors</h1>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={tab === t.key ? "tab active" : "tab"}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="notice">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : !vendors.length ? (
        <p className="empty">No {tab} vendors.</p>
      ) : (
        <div className="list">
          {vendors.map((v) => {
            const id = v._id || v.id;
            return (
              <div className="row" key={id}>
                <div>
                  <p className="name">{v.businessName}</p>
                  <p className="meta">
                    {v.contactName} · {v.email}
                    {v.phone ? ` · ${v.phone}` : ""}
                  </p>
                </div>
                <div className="actions">
                  {tab === "pending" && (
                    <>
                      <button
                        className="btn approve"
                        disabled={busyId === id}
                        onClick={() => handleAction(id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn reject"
                        disabled={busyId === id}
                        onClick={() => handleAction(id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {tab === "active" && (
                    <button
                      className="btn reject"
                      disabled={busyId === id}
                      onClick={() => handleAction(id, "suspend")}
                    >
                      Suspend
                    </button>
                  )}
                  {tab === "suspended" && (
                    <button
                      className="btn approve"
                      disabled={busyId === id}
                      onClick={() => handleAction(id, "reinstate")}
                    >
                      Reinstate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        h1 {
          margin-bottom: 16px;
        }
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .tab {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
        }
        .tab.active {
          background: #111827;
          color: #fff;
          border-color: #111827;
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
        .empty {
          color: #888;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .row {
          background: #fff;
          border-radius: 10px;
          padding: 14px 18px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .name {
          margin: 0;
          font-weight: 600;
        }
        .meta {
          margin: 2px 0 0;
          font-size: 12px;
          color: #888;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }
        .btn.approve {
          background: #16a34a;
          color: #fff;
        }
        .btn.reject {
          background: #e11d48;
          color: #fff;
        }
        .btn:disabled {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
