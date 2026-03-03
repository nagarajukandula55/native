import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET /api/admin/products
export async function GET() {
  try {
    await connectToDB(); // Connect to MongoDB
    const products = await Product.find({}); // Fetch all products
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
