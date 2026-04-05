import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const data = await Category.find();
  return NextResponse.json(data);
}

export async function POST(req) {
  await connectDB();
  const { name } = await req.json();

  const existing = await Category.findOne({ name });
  if (existing) return NextResponse.json(existing);

  const cat = await Category.create({ name });
  return NextResponse.json(cat);
}
