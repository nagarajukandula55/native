// app/api/store/login/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Store from "@/models/store";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await db();
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ success: false, msg: "Email and password required" }, { status: 400 });

  const store = await Store.findOne({ email });
  if (!store) return NextResponse.json({ success: false, msg: "Store not found" }, { status: 404 });

  const isMatch = await bcrypt.compare(password, store.password);
  if (!isMatch) return NextResponse.json({ success: false, msg: "Invalid password" }, { status: 401 });

  const token = jwt.sign({ id: store._id, role: store.role }, process.env.JWT_SECRET, { expiresIn: "12h" });

  return NextResponse.json({ success: true, token, store });
}
