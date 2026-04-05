import connectDB from "@/lib/mongodb";
import GstCategory from "@/models/GstCategory";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const data = await GstCategory.find();
  return NextResponse.json(data);
}

export async function POST(req) {
  await connectDB();
  const { name, hsn, gst } = await req.json();

  const existing = await GstCategory.findOne({ name });
  if (existing) return NextResponse.json(existing);

  const gstCat = await GstCategory.create({ name, hsn, gst });
  return NextResponse.json(gstCat);
}
