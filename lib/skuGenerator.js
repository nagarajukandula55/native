let skuDB = {};

export function generateSKU(productName, weight) {
  const key = `${productName}-${weight}`;

  if (!skuDB[key]) {
    skuDB[key] = 1;
  } else {
    skuDB[key] += 1;
  }

  const serial = String(skuDB[key]).padStart(3, "0");

  return `NA-${productName.toUpperCase()}-${serial}-${weight}GM`;
}
