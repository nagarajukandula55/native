"use client";

import { useEffect, useState } from "react";

export default function CompanyAdmin() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/company");
      const data = await res.json();

      if (data.success) {
        setForm(data.data);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Company Updated Successfully");
      } else {
        alert("Update Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving company");
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h2>🏢 Company Settings</h2>

      {/* ================= COMPANY INFO ================= */}
      <Section title="Company Info">
        <Input label="Company Name" name="companyName" form={form} handleChange={handleChange} />
        <Input label="Legal Name" name="legalName" form={form} handleChange={handleChange} />
        <Input label="Tagline" name="brandTagline" form={form} handleChange={handleChange} />
      </Section>

      {/* ================= ADDRESS ================= */}
      <Section title="Address">
        <Input label="Address Line 1" name="addressLine1" form={form} handleChange={handleChange} />
        <Input label="Address Line 2" name="addressLine2" form={form} handleChange={handleChange} />
        <Input label="City" name="city" form={form} handleChange={handleChange} />
        <Input label="Pincode" name="pincode" form={form} handleChange={handleChange} />
        <Input label="State" name="state" form={form} handleChange={handleChange} />
        <Input label="Country" name="country" form={form} handleChange={handleChange} />
      </Section>

      {/* ================= CONTACT ================= */}
      <Section title="Contact">
        <Input label="Phone" name="phone" form={form} handleChange={handleChange} />
        <Input label="Email" name="email" form={form} handleChange={handleChange} />
        <Input label="WhatsApp" name="whatsapp" form={form} handleChange={handleChange} />
      </Section>

      {/* ================= GST ================= */}
      <Section title="GST Details">
        <Input label="GSTIN" name="gstin" form={form} handleChange={handleChange} />
        <Input label="PAN" name="pan" form={form} handleChange={handleChange} />
        <Input label="State Code" name="stateCode" form={form} handleChange={handleChange} />
      </Section>

      {/* ================= BANK ================= */}
      <Section title="Bank Details">
        <Input label="Bank Name" name="bankName" form={form} handleChange={handleChange} />
        <Input label="Account Number" name="accountNumber" form={form} handleChange={handleChange} />
        <Input label="IFSC" name="ifsc" form={form} handleChange={handleChange} />
        <Input label="Account Holder Name" name="accountName" form={form} handleChange={handleChange} />
      </Section>

      {/* ================= BRANDING ================= */}
      <Section title="Branding">
        <Input label="Logo URL" name="logoUrl" form={form} handleChange={handleChange} />
        <Input label="Signature URL" name="signatureUrl" form={form} handleChange={handleChange} />
        <Input label="Stamp URL" name="stampUrl" form={form} handleChange={handleChange} />
      </Section>

      {/* ================= PREFIX SYSTEM ================= */}
      <Section title="Invoice System">
        <Input label="Invoice Prefix" name="invoicePrefix" form={form} handleChange={handleChange} />
        <Input label="Receipt Prefix" name="receiptPrefix" form={form} handleChange={handleChange} />
        <Input
          label="Financial Year Start Month (1-12)"
          name="financialYearStartMonth"
          form={form}
          handleChange={handleChange}
        />
      </Section>

      {/* SAVE */}
      <button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Company Settings"}
      </button>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        button {
          margin-top: 20px;
          padding: 12px 20px;
          background: black;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

/* ================= COMPONENTS ================= */

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
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #ddd",
          borderRadius: 6,
        }}
      />
    </div>
  );
}
