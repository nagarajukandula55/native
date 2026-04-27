export async function POST(req) {
  return Response.json({
    success: true,
    data: {
      storageInstructions: "Store in cool & dry place",
      allergenInfo: "Contains peanuts",
      usageInstructions: "Use as directed on label",
      safetyInfo: "Not suitable for infants"
    }
  });
}
