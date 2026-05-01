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
        alert("Updated Successfully");
      } else {
        alert("Update Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating company");
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>Company Settings</h2>

      <input
        name="companyName"
        placeholder="Company Name"
        value={form.companyName || ""}
        onChange={handleChange}
      />

      <input
        name="legalName"
        placeholder="Legal Name"
        value={form.legalName || ""}
        onChange={handleChange}
      />

      <input
        name="gstin"
        placeholder="GSTIN"
        value={form.gstin || ""}
        onChange={handleChange}
      />

      <input
        name="state"
        placeholder="State"
        value={form.state || ""}
        onChange={handleChange}
      />

      <input
        name="stateCode"
        placeholder="State Code"
        value={form.stateCode || ""}
        onChange={handleChange}
      />

      <input
        name="phone"
        placeholder="Phone"
        value={form.phone || ""}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email || ""}
        onChange={handleChange}
      />

      <input
        name="invoicePrefix"
        placeholder="Invoice Prefix"
        value={form.invoicePrefix || ""}
        onChange={handleChange}
      />

      <input
        name="receiptPrefix"
        placeholder="Receipt Prefix"
        value={form.receiptPrefix || ""}
        onChange={handleChange}
      />

      <input
        name="logoUrl"
        placeholder="Logo URL"
        value={form.logoUrl || ""}
        onChange={handleChange}
      />

      <textarea
        name="addressLine1"
        placeholder="Address Line 1"
        value={form.addressLine1 || ""}
        onChange={handleChange}
      />

      <textarea
        name="addressLine2"
        placeholder="Address Line 2"
        value={form.addressLine2 || ""}
        onChange={handleChange}
      />

      <button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Company Settings"}
      </button>

      <style jsx>{`
        input, textarea {
          width: 100%;
          padding: 10px;
          margin: 6px 0;
          border: 1px solid #ddd;
          border-radius: 6px;
        }

        button {
          margin-top: 10px;
          padding: 10px 20px;
          background: black;
          color: white;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
