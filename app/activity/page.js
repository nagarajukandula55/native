"use client";

import { useEffect, useState } from "react";
import { getEvents, clearEvents } from "@/lib/eventLogger";

const TYPE_LABEL = {
  account_created: "Account created",
  vendor_application_submitted: "Vendor application submitted",
  vendor_profile_updated: "Vendor profile updated",
  product_created: "Product created",
  product_updated: "Product updated",
  product_deleted: "Product deleted",
  order_status_updated: "Order status updated",
  wallet_withdrawal_requested: "Withdrawal requested",
};

function formatTimestamp(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" });
  } catch {
    return iso;
  }
}

function groupByDay(events) {
  const groups = [];
  let lastKey = null;
  for (const e of events) {
    const key = new Date(e.timestamp).toDateString();
    if (key !== lastKey) {
      groups.push({ key, label: key, items: [] });
      lastKey = key;
    }
    groups[groups.length - 1].items.push(e);
  }
  return groups;
}

export default function ActivityLogPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  function handleClear() {
    if (!confirm("Clear this device's activity log? This can't be undone.")) return;
    clearEvents();
    setEvents([]);
  }

  const groups = groupByDay(events);

  return (
    <div className="wrap">
      <div className="header">
        <div>
          <h1>Activity Log</h1>
          <p className="sub">
            A timeline of actions taken on this device — account, vendor, product, order and wallet events.
          </p>
        </div>
        {events.length > 0 && (
          <button className="clearBtn" onClick={handleClear}>
            Clear log
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <p className="empty">No activity recorded yet on this device.</p>
      ) : (
        <div className="timeline">
          {groups.map((g) => (
            <div className="day" key={g.key}>
              <h3 className="dayLabel">{g.label}</h3>
              <div className="items">
                {g.items.map((e) => (
                  <div className="item" key={e.id}>
                    <div className="dot" />
                    <div className="body">
                      <p className="message">{e.message}</p>
                      <p className="meta">
                        <span className="type">{TYPE_LABEL[e.type] || e.type}</span>
                        <span className="time">{formatTimestamp(e.timestamp)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .wrap {
          max-width: 760px;
          margin: 0 auto;
          padding: 40px 20px 60px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 28px;
        }
        h1 {
          margin: 0 0 4px;
        }
        .sub {
          color: #888;
          font-size: 13px;
          margin: 0;
          max-width: 480px;
        }
        .clearBtn {
          background: none;
          border: 1px solid #e11d48;
          color: #e11d48;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          white-space: nowrap;
        }
        .empty {
          color: #888;
        }
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .dayLabel {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #c28b45;
          margin: 0 0 12px;
        }
        .items {
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-left: 2px solid #eee;
          padding-left: 18px;
        }
        .item {
          position: relative;
          padding: 10px 0;
        }
        .dot {
          position: absolute;
          left: -24px;
          top: 16px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #c28b45;
        }
        .message {
          margin: 0 0 4px;
          font-weight: 600;
          font-size: 14px;
        }
        .meta {
          margin: 0;
          display: flex;
          gap: 10px;
          font-size: 12px;
          color: #888;
        }
        .type {
          background: #faf7f2;
          border-radius: 6px;
          padding: 2px 8px;
        }
      `}</style>
    </div>
  );
}
