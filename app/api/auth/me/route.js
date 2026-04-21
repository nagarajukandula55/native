import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    console.log("TOKEN:", token); // 🔥 DEBUG

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token" },
        { status: 401 }
      );
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("AUTH ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
