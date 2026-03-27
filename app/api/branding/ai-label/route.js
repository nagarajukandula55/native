import { NextResponse } from "next/server";

export async function POST(req) {
  const { productName } = await req.json();

  return NextResponse.json({
    success: true,

    front: [
      {
        id: 1,
        type: "text",
        text: productName,
        x: 80,
        y: 250,
        width: 250,
        height: 60,
        fontSize: 30,
        color: "#ffffff",
      },
      {
        id: 2,
        type: "text",
        text: "Premium Quality Product",
        x: 80,
        y: 300,
        width: 250,
        height: 40,
        fontSize: 16,
        color: "#eeeeee",
      }
    ],

    back: [
      { id: 3, type: "text", text: "Ingredients: Natural Ingredients", x: 20, y: 20 },
      { id: 4, type: "text", text: "Net Weight: 500g", x: 20, y: 50 },
      { id: 5, type: "text", text: "MRP: ₹99 (Incl. of all taxes)", x: 20, y: 80 },
      { id: 6, type: "text", text: "Packed On: DD/MM/YYYY", x: 20, y: 110 },
      { id: 7, type: "text", text: "Best Before: 6 Months", x: 20, y: 140 },
      { id: 8, type: "text", text: "FSSAI Lic No: XXXXX", x: 20, y: 170 },
      { id: 9, type: "text", text: "Customer Care: 9876543210", x: 20, y: 200 }
    ]
  });
}
