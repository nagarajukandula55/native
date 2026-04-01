import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json({
      success: true,
      message: "Logged out",
    });

    res.cookies.set("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0, // 🔥 delete cookie
    });

    return res;

  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Logout failed",
    });
  }
}
