import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";

export async function GET() {
  await connectDB();
  const labels = await Label.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, labels });
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const label = await Label.create(data);
  return NextResponse.json({ success: true, label });
}

export async function PUT(req) {
  await connectDB();
  const { id, ...updates } = await req.json();
  const label = await Label.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json({ success: true, label });
}

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();
  await Label.findByIdAndDelete(id);
  return NextResponse.json({ success: true, msg: "Label deleted" });
}
