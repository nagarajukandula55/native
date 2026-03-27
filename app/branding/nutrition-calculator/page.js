"use client";

import { useState } from "react";

export default function NutritionCalculatorPage() {
  const [form, setForm] = useState({
    productName: "",
    rawMaterialCost: 0,
    packagingCost: 0,
    laborCost: 0,
    logisticsCost: 0,
    taxPercent: 0,
    profitMarginPercent: 0,
  });

  const [calculated, setCalculated] = useState({
    totalCost: 0,
    taxAmount: 0,
    sellingPrice: 0,
    mrp: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: parseFloat(value) || 0 });
  };

  const calculatePricing = () => {
    const totalCost =
      form.rawMaterialCost +
      form.packagingCost +
      form.laborCost +
      form.logisticsCost;

    const taxAmount = (totalCost * form.taxPercent) / 100;
    const sellingPrice = totalCost + taxAmount;
    const mrp = sellingPrice + (sellingPrice * form.profitMarginPercent) / 100;

    setCalculated({ totalCost, taxAmount, sellingPrice, mrp });
  };

  return (
    <div>
      <h2>Pricing & Nutrition Calculator</h2>

      <div style={formContainer}>
        <input
          placeholder="Product Name"
          name="productName"
          value={form.productName}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Raw Material Cost (₹)"
          name="rawMaterialCost"
          value={form.rawMaterialCost}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Packaging Cost (₹)"
          name="packagingCost"
          value={form.packagingCost}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Labor / Production Cost (₹)"
          name="laborCost"
          value={form.laborCost}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Logistics / Shipping Cost (₹)"
          name="logisticsCost"
          value={form.logisticsCost}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Tax %"
          name="taxPercent"
          value={form.taxPercent}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Profit Margin %"
          name="profitMarginPercent"
          value={form.profitMarginPercent}
          onChange={handleChange}
        />

        <button style={button} onClick={calculatePricing}>
          Calculate MRP
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Calculated Pricing</h3>
        <p>Total Cost: ₹{calculated.totalCost.toFixed(2)}</p>
        <p>Tax Amount: ₹{calculated.taxAmount.toFixed(2)}</p>
        <p>Selling Price (Cost + Tax): ₹{calculated.sellingPrice.toFixed(2)}</p>
        <p>MRP (with Profit): ₹{calculated.mrp.toFixed(2)}</p>
      </div>
    </div>
  );
}

const formContainer = {
  display: "grid",
  gap: "10px",
  maxWidth: "400px",
};

const button = {
  marginTop: "10px",
  padding: "10px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
