import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET product by slug
export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ slug }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Format the product to send
    const formatted = {
      id: product._id.toString(),
      name: product.name,
      description: product.description || "",
      price: product.price || 0,
      image: product.image || "",
      alt: product.alt || product.name,
      category: product.category || "General",
      stock: product.stock || 100,
      featured: product.featured || false,
      slug: product.slug,
    };

    return NextResponse.json({ success: true, product: formatted });
  } catch (error) {
    console.error("GET PRODUCT BY SLUG ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
