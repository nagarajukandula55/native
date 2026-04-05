import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

/* ================= AUTH ================= */
function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= SLUG ================= */
function generateSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/* ================= SKU ================= */
async function generateSKU(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const count = await Product.countDocuments();
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

/* ================= GET ================= */
export async function GET(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    });

  } catch (e) {
    return NextResponse.json({ success: false, message: e.message });
  }
}

/* ================= POST ================= */
export async function POST(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const body = await req.json();

    const slug = generateSlug(body.name);
    const sku = await generateSKU(body.name);

    const product = await Product.create({
      ...body,
      slug,
      sku,
    });

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (e) {
    return NextResponse.json({ success: false, message: e.message });
  }
}
