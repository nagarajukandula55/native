import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import slugify from "slugify";

/* ================= FORCE DYNAMIC ================= */
export const dynamic = "force-dynamic";

/* ================= VERIFY ADMIN ================= */
import jwt from "jsonwebtoken";
async function verifyAdmin(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") throw new Error("Forbidden");

    return decoded;
  } catch (err) {
    throw new Error(err.message || "Unauthorized");
  }
}

/* ================= AUTO SEO & TAGS ================= */
function generateSEO(product) {
  const title = `${product.name} - Buy Online at Best Price`;
  const metaDescription = `Get ${product.name} with ${product.highlights || "premium quality"} at best price. Available now under ${product.category}.`;
  const tags = product.name
    .split(" ")
    .concat(product.category.split(" "))
    .map((t) => t.toLowerCase());

  return { seoTitle: title, seoDescription: metaDescription, seoTags: tags };
}

/* ================= AUTO HSN & GST ================= */
async function generateHSNGST(gstCategory) {
  if (!gstCategory) return { hsn: "", gst: 0 };
  const cat = await Category.findOne({ "gstOptions.name": gstCategory });
  if (!cat) return { hsn: "", gst: 0 };

  const option = cat.gstOptions.find((o) => o.name === gstCategory);
  return { hsn: option?.hsn || "", gst: option?.gst || 0 };
}

/* ================= GET PRODUCTS ================= */
export async function GET() {
  try {
    await connectDB();
    // Admin verification is optional for GET if public API
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}

/* ================= CREATE / UPDATE PRODUCT ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    if (!body.name || !body.category || !body.gstCategory) {
      return NextResponse.json({ success: false, message: "Name, category, GST category required" }, { status: 400 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });

    const { seoTitle, seoDescription, seoTags } = generateSEO(body);
    const { hsn, gst } = await generateHSNGST(body.gstCategory);

    const product = await Product.create({
      ...body,
      slug,
      seoTitle,
      seoDescription,
      seoTags,
      hsn: body.hsn || hsn,
      gst: body.gst || gst,
      active: body.active ?? true,
    });

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

/* ================= UPDATE PRODUCT ================= */
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    if (!body._id) return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });

    const product = await Product.findById(body._id);
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

    const slug = slugify(body.name, { lower: true, strict: true });
    const { seoTitle, seoDescription, seoTags } = generateSEO(body);
    const { hsn, gst } = await generateHSNGST(body.gstCategory);

    Object.assign(product, {
      ...body,
      slug,
      seoTitle,
      seoDescription,
      seoTags,
      hsn: body.hsn || hsn,
      gst: body.gst || gst,
    });

    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
