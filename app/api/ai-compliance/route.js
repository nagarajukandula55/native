export async function POST(req) {
  return Response.json({
    success: true,
    data: {
      storage: "Store in cool & dry place",
      allergen: "Contains peanuts"
    }
  });
}
