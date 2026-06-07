export function getProductDisplayName(p) {
  const brand = p?.brand || "";
  const name = p?.name || "";

  const value = p?.primaryVariant?.value || "";
  const unit = p?.primaryVariant?.unit || "";

  return `${brand} ${name} ${value} ${unit}`.trim();
}
