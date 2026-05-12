export const formatMoney = (value, mode = "UNICODE_SAFE") => {
  const n = Number(value || 0).toFixed(2);

  // ERP RULE:
  // fallback mode = no special characters
  if (mode === "FALLBACK") {
    return `INR ${n}`;
  }

  // unicode mode = safe ₹ rendering
  return `₹${n}`;
};
