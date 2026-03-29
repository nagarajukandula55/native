import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    // Only return the necessary fields for public users
    const publicProducts = products.map((p) => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      image: p.image,
      sku: p.sku,
      slug: p.slug,
    }));

    return NextResponse.json(publicProducts);
  } catch (err) {
    console.error("PUBLIC PRODUCTS ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
