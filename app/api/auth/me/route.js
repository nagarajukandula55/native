import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    console.log("TOKEN FROM COOKIE:", token); // DEBUG

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
