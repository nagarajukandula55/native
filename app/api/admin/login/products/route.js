import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to verify admin token
function verifyAdmin(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("Unauthorized");
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Unauthorized");
  return decoded;
}

export async function GET(req) {
  try {
    verifyAdmin(req);
    await connectDB();
    const products = await Product.find();
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    verifyAdmin(req);
    await connectDB();
    const data = await req.json();
    const product = new Product(data);
    await product.save();
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    verifyAdmin(req);
    await connectDB();
    const { id, updates } = await req.json();
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    verifyAdmin(req);
    await connectDB();
    const { id } = await req.json();
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
