"use client";

import { useEffect, useState } from "react";
import { getBusinessById, updateBusinessById } from "@/lib/an-sdk/company";

const STORAGE_KEY = "an_group_business_id";

/**
 * AN Group's own GST/legal details — a separate Business record in ANgroup
 * from Native's (Native sells under AN Group's GST registration, branded as
 * Native — see the invoicing conversation this page came out of). Unlike
 * Native's businessId (a build-time env var, since it's fixed for this
 * deployment), AN Group's businessId isn't something native's own build
 * config should hardcode — it's looked up here once and remembered in this
 * browser via localStorage. Find it in ANgroup's own admin → Businesses
 * list (the record named "AN Group" / businessCode "ANGROUP").
 */
export default function AnGroupSettings() {
  const [businessId, setBusinessId] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      setBusinessId(saved);
      loadBusiness(saved);
    }
  }, []);

  const loadBusiness = async (id) => {
    setLoading(true);
    setError("");
    try {
      const data = await getBusinessById(id);
      if (data.success) {
        setForm(data.data);
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        setError("Could not load that business — check the ID and that you're logged into ANgroup.");
        setForm(null);
      }
    } catch (err) {
      setError(err?.message || "Error loading business");
      setForm(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await updateBusinessById(businessId, form);
      if (data.success) {
        alert("AN Group settings updated");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      alert(err?.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h2>🏛️ AN Group Settings</h2>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
        AN Group's own GST/legal details — Native sells under this registration,
        branded as Native. Find AN Group's business ID in ANgroup's own admin →
        Businesses list (the record named "AN Group", business code "ANGROUP").
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="AN Group business ID"
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <button
          onClick={() => loadBusiness(businessId)}
          disabled={!businessId || loading}
          style={{ padding: "10px 20px", background: "#111827", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {error && <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 20 }}>{error}</p>}

      {form && (
        <>
          <Section title="Company Info">
            <Input label="Company Name" name="companyName" form={form} handleChange={handleChange} />
            <Input label="Legal Name" name="legalName" form={form} handleChange={handleChange} />
            <Input label="Brand Name" name="brandTagline" form={form} handleChange={handleChange} />
          </Section>

          <Section title="Address">
            <Input label="Address" name="addressLine1" form={form} handleChange={handleChange} />
            <Input label="City" name="city" form={form} handleChange={handleChange} />
            <Input label="Pincode" name="pincode" form={form} handleChange={handleChange} />
            <Input label="State" name="state" form={form} handleChange={handleChange} />
          </Section>

          <Section title="Contact">
            <Input label="Phone" name="phone" form={form} handleChange={handleChange} />
            <Input label="Email" name="email" form={form} handleChange={handleChange} />
          </Section>

          <Section title="GST Details">
            <Input label="GSTIN" name="gstin" form={form} handleChange={handleChange} />
            <Input label="PAN" name="pan" form={form} handleChange={handleChange} />
            <Input label="GST State Code" name="stateCode" form={form} handleChange={handleChange} />
          </Section>

          <Section title="Branding">
            <Input label="Logo URL" name="logoUrl" form={form} handleChange={handleChange} />
          </Section>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: 20, padding: "12px 20px", background: "black", color: "white", border: "none", borderRadius: 6, cursor: "pointer", width: "100%" }}
          >
            {saving ? "Saving..." : "Save AN Group Settings"}
          </button>
        </>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 25, padding: 15, border: "1px solid #eee", borderRadius: 10 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <div style={{ display: "grid", gap: 10 }}>{children}</div>
    </div>
  );
}

function Input({ label, name, form, handleChange }) {
  return (
    <div>
      <label style={{ fontSize: 12 }}>{label}</label>
      <input
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
      />
    </div>
  );
}
