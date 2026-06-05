export function transformProductForMerchant(product) {
  const primary = product.primaryVariant;

  // fallback to first variant if primary missing
  const variant = primary || product.variants?.[0];

  if (!variant) return null;

  const price = variant.sellingPrice || product.pricing?.sellingPrice || 0;
  const mrp = variant.mrp || product.pricing?.mrp || price;

  const inStock = (variant.stock || 0) > 0;

  return {
    id: variant.sku, // 🔥 IMPORTANT: SKU as unique ID
    title: product.name,
    description: product.shortDescription || product.description || "",

    link: `https://yourdomain.com/product/${product.slug}`,

    image: product.primaryImage || product.images?.[0],

    brand: product.brand || "Generic",

    price: `${price} INR`,
    salePrice: mrp > price ? `${mrp} INR` : null,

    availability: inStock ? "in stock" : "out of stock",

    condition: "new",

    googleCategory: product.category || "",

    gtin: variant.barcode || "",
  };
}
