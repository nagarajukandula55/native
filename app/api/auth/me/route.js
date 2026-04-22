import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    const token = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

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
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
