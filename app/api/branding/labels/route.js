import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";
import { verifyToken } from "@/lib/auth";

/* CREATE */
export async function POST(req) {
  await connectDB();

  const user = verifyToken(req);
  if (!user) return NextResponse.json({ success: false, msg: "Unauthorized" });

  const body = await req.json();

  const label = await Label.create({
    ...body,
    userId: user.id,
  });

  return NextResponse.json({ success: true, label });
}

/* GET */
export async function GET(req) {
  await connectDB();

  const user = verifyToken(req);
  if (!user) return NextResponse.json({ success: false });

  const labels = await Label.find({ userId: user.id });

  return NextResponse.json({ success: true, labels });
}

/* DELETE */
export async function DELETE(req) {
  await connectDB();

  const user = verifyToken(req);
  if (!user) return NextResponse.json({ success: false });

  const { id } = await req.json();

  await Label.deleteOne({ _id: id, userId: user.id });

  return NextResponse.json({ success: true });
}
