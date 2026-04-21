import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    // 🔥 No token
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // 🔥 Verify token
    const user = jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
