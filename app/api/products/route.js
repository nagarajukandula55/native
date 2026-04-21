import { NextResponse } from "next/server";

export async function GET() {
  try {
    // later replace with MongoDB
    const products = [
      {
        id: 1,
        name: "Sample Product",
        price: 499,
      },
    ];

    return NextResponse.json({ success: true, products });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching products" },
      { status: 500 }
    );
  }
}
