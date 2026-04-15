import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
      success: true,
      user: {
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      },
    });

  } catch (err) {
    console.error("ME API ERROR:", err);

    return NextResponse.json({
      success: false,
      user: null,
    });
  }
}
