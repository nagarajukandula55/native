import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      name,
      email,
      password,
      role,
      phone,
      businessName,
      gstNumber,
      address,
    } = body;

    /* ===== VALIDATION ===== */
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: "Name, Email, Password & Role are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "User already exists",
      });
    }

    /* ===== HASH PASSWORD ===== */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ===== BUILD USER ===== */
    const newUser = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: phone || "",
    };

    /* ===== VENDOR EXTRA FIELDS ===== */
    if (role === "vendor") {
      newUser.vendorDetails = {
        businessName: businessName || "",
        gstNumber: gstNumber || "",
        address: address || "",
      };
    }

    const user = await User.create(newUser);

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user,
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
