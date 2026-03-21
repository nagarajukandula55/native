import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, warehouseId } = await req.json();

    if (!name || !email || !password || !warehouseId) {
      return NextResponse.json({ success: false, msg: "Missing fields" }, { status: 400 });
    }

    const existing = await Store.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, msg: "Store already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const store = await Store.create({
      name,
      email,
      password: hashedPassword,
      warehouseId,
    });

    return NextResponse.json({ success: true, storeId: store._id });
  } catch (e) {
    console.error("STORE REGISTER ERROR:", e);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
