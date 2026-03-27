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
        x: 100,
        y: 260,
        width: 200,
        height: 50,
        fontSize: 28,
        color: "#ffffff",
      },
      {
        id: 2,
        type: "text",
        text: "Premium Quality",
        x: 100,
        y: 300,
        width: 200,
        height: 40,
        fontSize: 16,
        color: "#eeeeee",
      }
    ],
    back: [
      {
        id: 3,
        type: "text",
        text: "Ingredients: Natural",
        x: 20,
        y: 20,
        width: 300,
        height: 40,
        fontSize: 14,
      },
      {
        id: 4,
        type: "text",
        text: "FSSAI: XXXXX",
        x: 20,
        y: 60,
        width: 300,
        height: 40,
        fontSize: 14,
      }
    ]
  });
}
