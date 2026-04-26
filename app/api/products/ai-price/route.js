import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const {
    category,
    totalCost,
    tax
  } = body;

  /* ================= CATEGORY MARGINS ================= */

  const margins = {
    spices: 0.35,
    instant: 0.40,
    flours: 0.30,
    premium: 0.50
  };

  const margin = margins[category] || 0.4;

  const suggestedSelling = totalCost * (1 + margin);

  const suggestedMRP =
    suggestedSelling * (1 + tax / 100) * 1.25;

  return NextResponse.json({
    success: true,
    suggestedSelling,
    suggestedMRP,
    margin
  });
}
