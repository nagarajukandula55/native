"use client";

import { useEffect, useState } from "react";
import {
  getBusinessRegistrationStatus,
  registerBusiness,
  updateBusinessSettings,
} from "@/lib/an-sdk/vendors";
import { ApiError } from "@/lib/an-sdk/client";

export default function AdminBusinessPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    businessName: "Native",
    legalName: "",
    gstNumber: "",
    contactEmail: "",
    contactPhone: "",
  });

  useEffect(() => {
    getBusinessRegistrationStatus()
      .then((data) => setStatus(data))
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load business registration status — this endpoint is pending on the AN group backend."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const data = await registerBusiness(form);
      setStatus(data);
      setMsg("Business registration submitted.");
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Couldn't register business");
    } finally {
      setSaving(false);
    }
  }

  const registered = status?.registered;

  return (
    <div>
      <h1>Business Settings</h1>
      <p className="sub">
        Native's own registration as a business/tenant within the shared AN
        group platform. This is separate from individual vendors applying to
        sell on Native — see the Vendors page for that.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && <p className="notice">{error}</p>}

          {registered ? (
            <div className="card">
              <p className="ok">✓ Registered with AN group</p>
              <p>
                <strong>Business:</strong> {status.businessName || form.businessName}
              </p>
              {status.businessId && (
                <p>
                  <strong>Business ID:</strong> {status.businessId}
                </p>
              )}
              {status.status && (
                <p>
                  <strong>Status:</strong> {status.status}
                </p>
              )}
            </div>
          ) : (
            <form className="card" onSubmit={handleRegister}>
              <p className="notReg">Native is not registered as a business yet.</p>

              <input
                placeholder="Business name"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="input"
              />
              <input
                placeholder="Legal name"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className="input"
              />
              <input
                placeholder="GST number"
                value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                className="input"
              />
              <input
                placeholder="Contact email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="input"
              />
              <input
                placeholder="Contact phone"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="input"
              />

              {msg && <p className="msg">{msg}</p>}

              <button className="btn" disabled={saving}>
                {saving ? "Registering..." : "Register business"}
              </button>
            </form>
          )}
        </>
      )}

      <style jsx>{`
        h1 {
          margin-bottom: 6px;
        }
        .sub {
          color: #888;
          max-width: 600px;
          margin-bottom: 24px;
          font-size: 13px;
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
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 26px;
          max-width: 460px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ok {
          color: #16a34a;
          font-weight: 700;
        }
        .notReg {
          color: #b45309;
          font-weight: 600;
          margin: 0;
        }
        .input {
          padding: 11px 13px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
        }
        .msg {
          font-size: 13px;
          color: #555;
        }
        .btn {
          padding: 12px;
          background: #111827;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn:disabled {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
