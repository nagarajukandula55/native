import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Product from "@/models/Product";
import slugify from "slugify"; // run `npm install slugify`

// Helper: generate SEO-friendly slug
const generateSlug = (name) => slugify(name || "", { lower: true, strict: true });

// --------------------
// GET PRODUCTS
// --------------------
export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({}).lean();

    const formattedProducts = Array.isArray(products)
      ? products.map((p) => ({
          id: p._id.toString(),
          name: p.name || "",
          description: p.description || "",
          price: p.price || 0,
          image: p.image || "",
          alt: p.alt || p.name || "",
          category: p.category || "General",
          stock: p.stock || 100,
          featured: p.featured || false,
          slug: p.slug || generateSlug(p.name),
        }))
      : [];

    return NextResponse.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json(
      { success: false, products: [], message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// --------------------
// ADD PRODUCT
// --------------------
export async function POST(req) {
  try {
    await connectToDB();
    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, message: "Name and price are required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(body.name);

    const product = await Product.create({
      name: body.name,
      description: body.description || "",
      price: Number(body.price),
      image: body.image || "",
      alt: body.alt || body.name,
      category: body.category || "General",
      stock: body.stock || 100,
      featured: body.featured || false,
      slug,
    });

    return NextResponse.json({
      success: true,
      product: { ...product.toObject(), id: product._id.toString() },
    });
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add product" },
      { status: 500 }
    );
  }
}

// --------------------
// UPDATE PRODUCT
// --------------------
export async function PATCH(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const { id, name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const slug = name ? generateSlug(name) : undefined;

    const updated = await Product.findByIdAndUpdate(
      id,
      { ...body, slug },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: { ...updated, id: updated._id.toString() },
    });
  } catch (error) {
    console.error("PATCH PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// --------------------
// DELETE PRODUCT
// --------------------
export async function DELETE(req) {
  try {
    await connectToDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
