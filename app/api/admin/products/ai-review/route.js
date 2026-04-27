export async function POST(req) {
  const { product } = await req.json();

  const issues = [];

  if (!product.hsn) issues.push("Missing HSN");
  if (!product.tax) issues.push("Missing GST");
  if (!product.description) issues.push("Missing Description");

  const risk =
    issues.length === 0 ? "LOW" :
    issues.length <= 2 ? "MEDIUM" : "HIGH";

  return Response.json({
    success: true,
    ai: {
      summary: `${product.name} is a ${product.category} product.`,
      issues,
      risk,
      recommendation:
        risk === "LOW" ? "SAFE TO APPROVE" : "REVIEW REQUIRED"
    }
  });
}
