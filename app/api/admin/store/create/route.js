import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, code, contact, email, password } = body;

    if (!name || !code || !contact || !email || !password) {
      return NextResponse.json({ success: false, message: "All fields are required" });
    }

    const existing = await Store.findOne({ code });
    if (existing) {
      return NextResponse.json({ success: false, message: "Store code already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const store = await Store.create({
      name,
      code,
      contact,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ success: true, storeId: store._id });
  } catch (err) {
    console.error("CREATE STORE ERROR:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
