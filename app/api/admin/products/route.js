import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Product from "@/models/Product";
import slugify from "slugify";

const generateSlug = (name) => slugify(name || "", { lower: true, strict: true });

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({}).lean();
    const formatted = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description || "",
      price: p.price || 0,
      image: p.image || "",
      alt: p.alt || p.name,
      category: p.category || "General",
      stock: p.stock || 100,
      featured: p.featured || false,
      slug: p.slug || generateSlug(p.name),
    }));
    return NextResponse.json({ success: true, products: formatted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, products: [], message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const body = await req.json();
    if (!body.name || !body.price) return NextResponse.json({ success: false, message: "Name & price required" }, { status: 400 });
    const slug = generateSlug(body.name);
    const product = await Product.create({ ...body, price: Number(body.price), slug });
    return NextResponse.json({ success: true, product: { ...product.toObject(), id: product._id.toString() } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to add product" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectToDB();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    const slug = body.name ? generateSlug(body.name) : undefined;
    const updated = await Product.findByIdAndUpdate(body.id, { ...body, slug }, { new: true, runValidators: true }).lean();
    if (!updated) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product: { ...updated, id: updated._id.toString() } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectToDB();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 });
  }
}
