export function autonomousBrain(product) {
  let score = 100;
  let flags = [];

  const v = product.primaryVariant || {};

  /* ================= COMPLETENESS ================= */

  if (!product.name) {
    score -= 30;
    flags.push("missing_name");
  }

  if (!product.description || product.description.length < 30) {
    score -= 15;
    flags.push("weak_description");
  }

  if (!product.images?.length) {
    score -= 25;
    flags.push("no_images");
  }

  if (!product.fssaiNumber) {
    score -= 10;
    flags.push("missing_fssai");
  }

  /* ================= PRICE SAFETY ================= */

  const cost =
    Number(product.baseCost || 0) +
    Number(product.packagingCost || 0) +
    Number(product.logisticsCost || 0);

  const price = Number(v.sellingPrice || 0);

  if (price < cost) {
    score -= 50;
    flags.push("loss_making_product");
  }

  if (price === 0) {
    score -= 40;
    flags.push("invalid_price");
  }

  /* ================= FRAUD / RISK ================= */

  if (product.name?.toLowerCase().includes("fake")) {
    score -= 60;
    flags.push("suspicious_keyword");
  }

  /* ================= FINAL SCORE ================= */

  let decision = "approve";

  if (score >= 85) decision = "auto_approve";
  else if (score >= 60) decision = "review";
  else decision = "reject";

  return {
    score,
    decision,
    flags,
  };
}
