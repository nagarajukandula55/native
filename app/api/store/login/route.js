import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Store from "@/models/Store";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, msg: "Missing credentials" }, { status: 400 });
    }

    const store = await Store.findOne({ email });
    if (!store) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

    const isMatch = await store.comparePassword(password);
    if (!isMatch) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign(
      { storeId: store._id, warehouseId: store.warehouseId, name: store.name },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return NextResponse.json({ success: true, token, name: store.name });
  } catch (e) {
    console.error("STORE LOGIN ERROR:", e);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
