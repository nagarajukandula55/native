import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
      success: true,
      user: decoded,
    });

  } catch (err) {
    console.error("ME API ERROR:", err);
    return NextResponse.json({ success: false, user: null });
  }
}
