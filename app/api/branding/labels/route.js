import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const label = await Label.create(body);

  return NextResponse.json({ success: true, label });
}

export async function GET() {
  await connectDB();

  const labels = await Label.find().sort({ createdAt: -1 });

  return NextResponse.json({ success: true, labels });
}

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  await Label.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
