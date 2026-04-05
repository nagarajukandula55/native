import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

/* ================= VERIFY ADMIN ================= */
function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET USERS ================= */
export async function GET(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const query = role ? { role } : {};

    const users = await User.find(query)
      .select("name email role isActive")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
    });

  } catch (err) {
    console.error("GET USERS ERROR:", err);

    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, message: err.message },
      { status }
    );
  }
}
