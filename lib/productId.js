export function generateProductId(brand, sequence) {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

  const safeBrand = (brand || "GEN")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  const paddedSeq = String(sequence).padStart(5, "0");

  return `${safeBrand}-${yearMonth}-${paddedSeq}`;
}
