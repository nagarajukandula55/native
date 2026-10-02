"use client";

import { useEffect, useState } from "react";
import { getVendorProfile, updateVendorProfile } from "@/lib/an-sdk/vendors";
import { ApiError } from "@/lib/an-sdk/client";
import { logEvent } from "@/lib/eventLogger";

export default function VendorSettingsPage() {
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    gstNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getVendorProfile()
      .then((p) => {
        setForm({
          businessName: p?.businessName || "",
          contactName: p?.contactName || p?.contactPerson || "",
          email: p?.email || "",
          phone: p?.phone || "",
          gstNumber: p?.gstNumber || "",
          address: p?.address || "",
        });
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load your profile — this endpoint is pending on the AN group backend."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateVendorProfile(form);
      logEvent("vendor_profile_updated", `Profile updated for ${form.businessName || "vendor"}`, form);
      setSaved(true);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  }

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  return (
    <div>
      <h1>Settings</h1>
      <p className="sub">Your business profile, shown to customers and used for payouts.</p>

      {error && <p className="notice">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form className="formCard" onSubmit={handleSave}>
          {saved && <p className="form-success">Profile saved.</p>}

          <label>
            Business name
            <input className="input" value={form.businessName} onChange={set("businessName")} />
          </label>
          <label>
            Contact name
            <input className="input" value={form.contactName} onChange={set("contactName")} />
          </label>
          <label>
            Email
            <input className="input" type="email" value={form.email} onChange={set("email")} />
          </label>
          <label>
            Phone
            <input className="input" value={form.phone} onChange={set("phone")} />
          </label>
          <label>
            GST number
            <input className="input" value={form.gstNumber} onChange={set("gstNumber")} />
          </label>
          <label>
            Address
            <textarea className="input" rows={3} value={form.address} onChange={set("address")} />
          </label>

          <button className="btn" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
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
        .formCard {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 480px;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .input {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-family: inherit;
          font-size: 14px;
          font-weight: 400;
          color: #222;
        }
        .btn {
          padding: 10px 20px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          align-self: flex-start;
        }
        .btn:disabled {
          opacity: 0.7;
        }
        .form-success {
          color: #067647;
          margin: 0;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
