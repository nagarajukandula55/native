import connectDB from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const data = await Subcategory.find().populate("category");
  return NextResponse.json(data);
}

export async function POST(req) {
  await connectDB();
  const { name, categoryId } = await req.json();

  const sub = await Subcategory.create({
    name,
    category: categoryId,
  });

  return NextResponse.json(sub);
}
