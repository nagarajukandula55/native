import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Store from "@/models/Store";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, msg: "Missing credentials" });
    }

    const store = await Store.findOne({ email });
    if (!store) return NextResponse.json({ success: false, msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, store.password);
    if (!isMatch) return NextResponse.json({ success: false, msg: "Invalid credentials" });

    // Return store info (without password) + warehouseId
    const { _id, name, warehouseId } = store;

    return NextResponse.json({ success: true, store: { _id, name, email, warehouseId } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: "Server error" });
  }
}
