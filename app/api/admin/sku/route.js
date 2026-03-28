import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";

// ⚠️ Replace with your actual SKU model
import SKU from "@/models/SKU";

async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const skus = await SKU.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      skus,
    });

  } catch (err) {
    console.error("SKU FETCH ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
