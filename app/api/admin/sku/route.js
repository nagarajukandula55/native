import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SKU from "@/models/SKU";
import jwt from "jsonwebtoken";

/* ================= VERIFY ADMIN ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET SKUS ================= */
export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const skus = await SKU.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      skus,
    });
  } catch (err) {
    console.error("GET SKU ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

/* ================= CREATE SKU ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { name, code, price, description } = await req.json();

    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: "Name & Code required" },
        { status: 400 }
      );
    }

    const sku = await SKU.create({
      name,
      code,
      price,
      description,
    });

    return NextResponse.json({
      success: true,
      sku,
    });
  } catch (err) {
    console.error("CREATE SKU ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
