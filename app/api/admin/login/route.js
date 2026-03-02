import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Admin from "../../../models/Admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const admin = await Admin.findOne({ email });
    if (!admin) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({ token, email: admin.email, role: admin.role });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
