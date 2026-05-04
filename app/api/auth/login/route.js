import { NextResponse } from "next/server";

/* ================= LOGIN API ================= */
export async function POST(req) {
  try {
    const body = await req.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password required",
        },
        { status: 400 }
      );
    }

    /* ================= DEMO LOGIN LOGIC =================
       Replace this with DB check later
    */

    const ADMIN_EMAIL = "admin@native.com";
    const ADMIN_PASS = "123456";

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json({
      success: true,
      token: "demo_jwt_token_here",
      user: {
        email,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
