"use client";

import { useState } from "react";

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [form, setForm] = useState({
    productName: "",
    sku: "",
    size: "",
    quality: "",
    price: "",
    barcode: "",
    frontDesign: "",
    rearIngredients: "",
    nutrition: {
      calories: "",
      protein: "",
      fat: "",
      carbs: "",
    },
    regulatory: {
      fssai: "",
      batchNo: "",
      mfgDate: "",
      expDate: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.nutrition) {
      setForm({ ...form, nutrition: { ...form.nutrition, [name]: value } });
    } else if (name in form.regulatory) {
      setForm({ ...form, regulatory: { ...form.regulatory, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addLabel = () => {
    setLabels([...labels, form]);
    setForm({
      productName: "",
      sku: "",
      size: "",
      quality: "",
      price: "",
      barcode: "",
      frontDesign: "",
      rearIngredients: "",
      nutrition: { calories: "", protein: "", fat: "", carbs: "" },
      regulatory: { fssai: "", batchNo: "", mfgDate: "", expDate: "" },
    });
  };

  return (
    <div>
      <h2>Create Product Label</h2>
      <div style={formContainer}>
        <input placeholder="Product Name" name="productName" value={form.productName} onChange={handleChange} />
        <input placeholder="SKU" name="sku" value={form.sku} onChange={handleChange} />
        <input placeholder="Size" name="size" value={form.size} onChange={handleChange} />
        <input placeholder="Quality" name="quality" value={form.quality} onChange={handleChange} />
        <input placeholder="Price" name="price" value={form.price} onChange={handleChange} />
        <input placeholder="Barcode" name="barcode" value={form.barcode} onChange={handleChange} />

        <textarea placeholder="Front Design URL / Description" name="frontDesign" value={form.frontDesign} onChange={handleChange} />
        <textarea placeholder="Rear Ingredients" name="rearIngredients" value={form.rearIngredients} onChange={handleChange} />

        <h4>Nutrition Info</h4>
        <input placeholder="Calories" name="calories" value={form.nutrition.calories} onChange={handleChange} />
        <input placeholder="Protein" name="protein" value={form.nutrition.protein} onChange={handleChange} />
        <input placeholder="Fat" name="fat" value={form.nutrition.fat} onChange={handleChange} />
        <input placeholder="Carbs" name="carbs" value={form.nutrition.carbs} onChange={handleChange} />

        <h4>Regulatory Info</h4>
        <input placeholder="FSSAI" name="fssai" value={form.regulatory.fssai} onChange={handleChange} />
        <input placeholder="Batch No" name="batchNo" value={form.regulatory.batchNo} onChange={handleChange} />
        <input placeholder="MFG Date" name="mfgDate" value={form.regulatory.mfgDate} onChange={handleChange} />
        <input placeholder="EXP Date" name="expDate" value={form.regulatory.expDate} onChange={handleChange} />

        <button style={button} onClick={addLabel}>Add Label</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Created Labels</h3>
        {labels.map((l, i) => (
          <div key={i} style={labelCard}>
            <strong>{l.productName}</strong> ({l.sku}) - ₹{l.price}
            <p>Front: {l.frontDesign}</p>
            <p>Rear: {l.rearIngredients}</p>
            <p>Nutrition: {l.nutrition.calories} cal, {l.nutrition.protein}g protein, {l.nutrition.fat}g fat, {l.nutrition.carbs}g carbs</p>
            <p>Regulatory: FSSAI {l.regulatory.fssai}, Batch {l.regulatory.batchNo}, MFG {l.regulatory.mfgDate}, EXP {l.regulatory.expDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const formContainer = {
  display: "grid",
  gap: "10px",
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

const labelCard = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  marginTop: "10px",
};
