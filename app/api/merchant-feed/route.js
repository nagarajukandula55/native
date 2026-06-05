import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({
      isActive: true,
      isListed: true,
    }).lean();

    const feed = products.map((p) => ({
      id: p._id,
      title: p.name,
      description: p.description || "",
      link: `https://yourdomain.com/products/${p.slug}`,
      image_link: p.images?.[0] || "",
      price: p.pricing?.sellingPrice || 0,
      availability: p.stock > 0 ? "in stock" : "out of stock",
      condition: "new",
      brand: p.brand || "Native",
    }));

    return NextResponse.json(feed, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
