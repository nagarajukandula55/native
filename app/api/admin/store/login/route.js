import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) return NextResponse.json({ success: false, msg: "Missing fields" }, { status: 400 });

    const store = await Store.findOne({ email });
    if (!store) return NextResponse.json({ success: false, msg: "Store not found" }, { status: 404 });

    const match = await bcrypt.compare(password, store.password);
    if (!match) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign({ id: store._id, warehouseId: store.warehouseId }, process.env.JWT_SECRET, { expiresIn: "12h" });

    return NextResponse.json({ success: true, token, storeId: store._id, name: store.name });
  } catch (e) {
    console.error("STORE LOGIN ERROR:", e);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
